-- 支出の分割方式（均等割 / 金額指定）と参加者ごとの負担額

ALTER TABLE public.expenses
  ADD COLUMN split_mode text NOT NULL DEFAULT 'equal'
  CHECK (split_mode IN ('equal', 'exact'));

ALTER TABLE public.expense_participants
  ADD COLUMN share_amount integer CHECK (share_amount IS NULL OR share_amount >= 0);

-- 金額指定時は share_amount 必須・合計一致を DB でも担保
CREATE OR REPLACE FUNCTION public.check_expense_participant_shares()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_split_mode text;
  v_amount integer;
  v_participant_count integer;
  v_share_sum bigint;
BEGIN
  SELECT e.split_mode, e.amount
  INTO v_split_mode, v_amount
  FROM public.expenses e
  WHERE e.id = COALESCE(NEW.expense_id, OLD.expense_id);

  IF v_split_mode IS NULL OR v_split_mode = 'equal' THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  SELECT COUNT(*)::integer, COALESCE(SUM(share_amount)::bigint, 0)
  INTO v_participant_count, v_share_sum
  FROM public.expense_participants ep
  WHERE ep.expense_id = COALESCE(NEW.expense_id, OLD.expense_id);

  IF v_participant_count = 0 THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.expense_participants ep
    WHERE ep.expense_id = COALESCE(NEW.expense_id, OLD.expense_id)
      AND (ep.share_amount IS NULL OR ep.share_amount <= 0)
  ) THEN
    RAISE EXCEPTION 'exact_split_requires_positive_shares';
  END IF;

  IF v_share_sum <> v_amount THEN
    RAISE EXCEPTION 'exact_split_sum_mismatch';
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE CONSTRAINT TRIGGER tr_check_expense_participant_shares
  AFTER INSERT OR UPDATE OR DELETE ON public.expense_participants
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW
  EXECUTE FUNCTION public.check_expense_participant_shares();

-- confirm_monthly_settlement: split_mode に応じて owed を計算
CREATE OR REPLACE FUNCTION public.confirm_monthly_settlement(
  p_group_id uuid,
  p_target_month text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_batch_id uuid;
  v_debtor uuid;
  v_creditor uuid;
  v_db integer;
  v_cb integer;
  v_amt integer;
  v_sum bigint;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  IF NOT public.is_group_member(p_group_id, v_uid) THEN
    RAISE EXCEPTION 'not_group_member';
  END IF;

  IF p_target_month !~ '^[0-9]{4}-[0-9]{2}$' THEN
    RAISE EXCEPTION 'invalid_month';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.settlement_batches b
    WHERE b.group_id = p_group_id
      AND b.target_month = p_target_month
  ) THEN
    RAISE EXCEPTION 'settlement_already_exists';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.expenses e
    WHERE e.group_id = p_group_id
      AND e.status = 'unpaid'
      AND e.expense_date >= (p_target_month || '-01')::date
      AND e.expense_date < ((p_target_month || '-01')::date + interval '1 month')::date
      AND (
        SELECT COUNT(*)::integer
        FROM public.expense_participants ep
        WHERE ep.expense_id = e.id
      ) = 0
  ) THEN
    RAISE EXCEPTION 'expense_without_participants';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.expenses e
    WHERE e.group_id = p_group_id
      AND e.status = 'unpaid'
      AND e.expense_date >= (p_target_month || '-01')::date
      AND e.expense_date < ((p_target_month || '-01')::date + interval '1 month')::date
  ) THEN
    RAISE EXCEPTION 'no_expenses_in_month';
  END IF;

  DROP TABLE IF EXISTS _settle_target;
  DROP TABLE IF EXISTS _settle_bal;

  CREATE TEMP TABLE _settle_target ON COMMIT DROP AS
  SELECT
    e.id,
    e.amount,
    e.payer_id,
    e.split_mode
  FROM public.expenses e
  WHERE e.group_id = p_group_id
    AND e.status = 'unpaid'
    AND e.expense_date >= (p_target_month || '-01')::date
    AND e.expense_date < ((p_target_month || '-01')::date + interval '1 month')::date;

  CREATE TEMP TABLE _settle_bal (
    user_id uuid PRIMARY KEY,
    balance integer NOT NULL
  ) ON COMMIT DROP;

  INSERT INTO _settle_bal (user_id, balance)
  WITH paid AS (
    SELECT
      payer_id AS user_id,
      SUM(amount)::integer AS paid_amt
    FROM _settle_target
    GROUP BY payer_id
  ),
  owed AS (
    SELECT
      sub.user_id,
      SUM(sub.owed_amt)::integer AS owed_amt
    FROM (
      -- 金額指定
      SELECT
        ep.user_id,
        SUM(ep.share_amount)::integer AS owed_amt
      FROM _settle_target t
      INNER JOIN public.expense_participants ep ON ep.expense_id = t.id
      WHERE t.split_mode = 'exact'
      GROUP BY ep.user_id
      UNION ALL
      -- 均等割（参加者）
      SELECT
        ep.user_id,
        SUM(t.amount / cnt.n)::integer AS owed_amt
      FROM _settle_target t
      INNER JOIN public.expense_participants ep ON ep.expense_id = t.id
      INNER JOIN (
        SELECT
          expense_id,
          COUNT(*)::integer AS n
        FROM public.expense_participants
        WHERE expense_id IN (SELECT id FROM _settle_target)
        GROUP BY expense_id
      ) AS cnt ON cnt.expense_id = t.id
      WHERE t.split_mode = 'equal'
      GROUP BY ep.user_id
      UNION ALL
      -- 均等割（端数は立替者）
      SELECT
        t.payer_id AS user_id,
        SUM(t.amount - (t.amount / cnt.n) * cnt.n)::integer AS owed_amt
      FROM _settle_target t
      INNER JOIN (
        SELECT
          expense_id,
          COUNT(*)::integer AS n
        FROM public.expense_participants
        WHERE expense_id IN (SELECT id FROM _settle_target)
        GROUP BY expense_id
      ) AS cnt ON cnt.expense_id = t.id
      WHERE t.split_mode = 'equal'
        AND t.amount - (t.amount / cnt.n) * cnt.n > 0
      GROUP BY t.payer_id
    ) AS sub
    GROUP BY sub.user_id
  ),
  uids AS (
    SELECT user_id FROM paid
    UNION
    SELECT user_id FROM owed
  )
  SELECT
    u.user_id,
    (COALESCE(p.paid_amt, 0) - COALESCE(o.owed_amt, 0))::integer
  FROM uids u
  LEFT JOIN paid p ON p.user_id = u.user_id
  LEFT JOIN owed o ON o.user_id = u.user_id;

  SELECT COALESCE(SUM(balance::bigint), 0)
  INTO v_sum
  FROM _settle_bal;

  IF v_sum <> 0 THEN
    RAISE EXCEPTION 'balance_sum_mismatch';
  END IF;

  INSERT INTO public.settlement_batches (group_id, target_month, status, created_by)
  VALUES (p_group_id, p_target_month, 'confirmed', v_uid)
  RETURNING id INTO v_batch_id;

  LOOP
    SELECT sb.user_id, sb.balance
    INTO v_debtor, v_db
    FROM _settle_bal AS sb
    WHERE sb.balance < 0
    ORDER BY sb.balance ASC
    LIMIT 1;

    EXIT WHEN NOT FOUND;

    SELECT sb.user_id, sb.balance
    INTO v_creditor, v_cb
    FROM _settle_bal AS sb
    WHERE sb.balance > 0
    ORDER BY sb.balance DESC
    LIMIT 1;

    EXIT WHEN NOT FOUND;

    v_amt := LEAST(-v_db, v_cb);

    INSERT INTO public.settlement_transfers (batch_id, from_user_id, to_user_id, amount)
    VALUES (v_batch_id, v_debtor, v_creditor, v_amt);

    UPDATE _settle_bal
    SET balance = balance + v_amt
    WHERE user_id = v_debtor;

    UPDATE _settle_bal
    SET balance = balance - v_amt
    WHERE user_id = v_creditor;
  END LOOP;

  UPDATE public.expenses AS e
  SET
    status = 'settled',
    settlement_batch_id = v_batch_id
  FROM _settle_target AS t
  WHERE e.id = t.id;

  RETURN v_batch_id;
END;
$$;

REVOKE ALL ON FUNCTION public.confirm_monthly_settlement(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.confirm_monthly_settlement(uuid, text) TO authenticated;
