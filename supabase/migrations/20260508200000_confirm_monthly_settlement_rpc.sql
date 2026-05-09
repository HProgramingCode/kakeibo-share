-- 月次精算を1トランザクションで確定する（均等割・支払者に端数寄せと最小送金貪欲法は data-model.md に準拠）

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
      AND NOT EXISTS (
        SELECT 1
        FROM public.expense_participants ep
        WHERE ep.expense_id = e.id
          AND ep.user_id = e.payer_id
      )
  ) THEN
    RAISE EXCEPTION 'payer_not_in_participants';
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
    e.payer_id
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
      ep.user_id,
      SUM(
        (t.amount / cnt.n)
        + CASE
          WHEN ep.user_id = t.payer_id THEN t.amount - (t.amount / cnt.n) * cnt.n
          ELSE 0
        END
      )::integer AS owed_amt
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
    GROUP BY ep.user_id
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
