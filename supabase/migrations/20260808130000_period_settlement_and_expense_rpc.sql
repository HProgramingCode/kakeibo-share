-- 精算を「対象月」ではなく、前回確定から次回確定までの期間として記録する。
-- あわせて支出と負担者を同一トランザクションで保存する RPC を追加する。

ALTER TABLE public.settlement_batches
  ADD COLUMN period_started_at timestamptz,
  ADD COLUMN period_ended_at timestamptz;

-- 既存の月次履歴は残す。期間情報は月初から確定時刻までとして補完する。
UPDATE public.settlement_batches
SET
  period_started_at = (target_month || '-01')::date::timestamptz,
  period_ended_at = created_at
WHERE period_started_at IS NULL;

ALTER TABLE public.settlement_batches
  ALTER COLUMN target_month DROP NOT NULL;

ALTER TABLE public.settlement_batches
  DROP CONSTRAINT IF EXISTS settlement_batches_group_id_target_month_key;

CREATE INDEX IF NOT EXISTS settlement_batches_group_period_ended_idx
  ON public.settlement_batches (group_id, period_ended_at DESC);

-- 金額指定の支出は、支出本体を更新した場合もコミット時に整合性を検査する。
CREATE OR REPLACE FUNCTION public.check_expense_participant_shares()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_expense_id uuid;
  v_split_mode text;
  v_amount integer;
  v_participant_count integer;
  v_share_sum bigint;
BEGIN
  IF TG_TABLE_NAME = 'expenses' THEN
    IF TG_OP = 'DELETE' THEN
      v_expense_id := OLD.id;
    ELSE
      v_expense_id := NEW.id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    v_expense_id := OLD.expense_id;
  ELSE
    v_expense_id := NEW.expense_id;
  END IF;

  SELECT e.split_mode, e.amount
  INTO v_split_mode, v_amount
  FROM public.expenses e
  WHERE e.id = v_expense_id;

  -- 支出自体を削除する CASCADE の途中では検査しない。
  IF v_split_mode IS NULL OR v_split_mode = 'equal' THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  SELECT COUNT(*)::integer, COALESCE(SUM(share_amount)::bigint, 0)
  INTO v_participant_count, v_share_sum
  FROM public.expense_participants ep
  WHERE ep.expense_id = v_expense_id;

  IF v_participant_count = 0 THEN
    RAISE EXCEPTION 'exact_split_requires_participants';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.expense_participants ep
    WHERE ep.expense_id = v_expense_id
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

DROP TRIGGER IF EXISTS tr_check_expense_participant_shares ON public.expense_participants;
CREATE CONSTRAINT TRIGGER tr_check_expense_participant_shares
  AFTER INSERT OR UPDATE OR DELETE ON public.expense_participants
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW
  EXECUTE FUNCTION public.check_expense_participant_shares();

CREATE CONSTRAINT TRIGGER tr_check_expense_shares_on_expense_change
  AFTER INSERT OR UPDATE ON public.expenses
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW
  EXECUTE FUNCTION public.check_expense_participant_shares();

CREATE OR REPLACE FUNCTION public.create_expense_with_participants(
  p_group_id uuid,
  p_payer_id uuid,
  p_amount integer,
  p_expense_date date,
  p_title text,
  p_category text,
  p_client_request_id uuid,
  p_split_mode text,
  p_participants jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_expense_id uuid;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  IF NOT public.is_group_member(p_group_id, v_uid) THEN RAISE EXCEPTION 'not_group_member'; END IF;
  IF p_amount IS NULL OR p_amount <= 0 THEN RAISE EXCEPTION 'invalid_amount'; END IF;
  IF p_expense_date IS NULL THEN RAISE EXCEPTION 'invalid_expense_date'; END IF;
  IF p_split_mode NOT IN ('equal', 'exact') THEN RAISE EXCEPTION 'invalid_split_mode'; END IF;
  IF p_client_request_id IS NULL THEN RAISE EXCEPTION 'invalid_client_request_id'; END IF;
  IF jsonb_typeof(p_participants) <> 'array' OR jsonb_array_length(p_participants) = 0 THEN
    RAISE EXCEPTION 'expense_without_participants';
  END IF;
  IF NOT public.is_group_member(p_group_id, p_payer_id) THEN RAISE EXCEPTION 'payer_not_group_member'; END IF;
  IF EXISTS (
    SELECT 1
    FROM jsonb_to_recordset(p_participants) AS p(user_id uuid, share_amount integer)
    WHERE p.user_id IS NULL OR NOT public.is_group_member(p_group_id, p.user_id)
  ) THEN RAISE EXCEPTION 'participant_not_group_member'; END IF;
  IF (SELECT COUNT(*) FROM jsonb_to_recordset(p_participants) AS p(user_id uuid, share_amount integer))
     <> (SELECT COUNT(DISTINCT p.user_id) FROM jsonb_to_recordset(p_participants) AS p(user_id uuid, share_amount integer)) THEN
    RAISE EXCEPTION 'duplicate_participants';
  END IF;
  IF p_split_mode = 'exact' AND (
    EXISTS (SELECT 1 FROM jsonb_to_recordset(p_participants) AS p(user_id uuid, share_amount integer) WHERE p.share_amount IS NULL OR p.share_amount <= 0)
    OR (SELECT COALESCE(SUM(p.share_amount), 0) FROM jsonb_to_recordset(p_participants) AS p(user_id uuid, share_amount integer)) <> p_amount
  ) THEN RAISE EXCEPTION 'invalid_exact_shares'; END IF;

  SELECT id INTO v_expense_id
  FROM public.expenses
  WHERE group_id = p_group_id AND client_request_id = p_client_request_id;
  IF v_expense_id IS NOT NULL THEN RETURN v_expense_id; END IF;

  INSERT INTO public.expenses (
    group_id, payer_id, amount, expense_date, title, category,
    client_request_id, status, split_mode
  ) VALUES (
    p_group_id, p_payer_id, p_amount, p_expense_date, p_title, p_category,
    p_client_request_id, 'unpaid', p_split_mode
  ) RETURNING id INTO v_expense_id;

  INSERT INTO public.expense_participants (expense_id, user_id, share_amount)
  SELECT v_expense_id, p.user_id,
    CASE WHEN p_split_mode = 'exact' THEN p.share_amount ELSE NULL END
  FROM jsonb_to_recordset(p_participants) AS p(user_id uuid, share_amount integer);

  RETURN v_expense_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_expense_with_participants(
  p_expense_id uuid,
  p_group_id uuid,
  p_payer_id uuid,
  p_amount integer,
  p_expense_date date,
  p_title text,
  p_category text,
  p_split_mode text,
  p_participants jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_existing public.expenses%ROWTYPE;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  IF NOT public.is_group_member(p_group_id, v_uid) THEN RAISE EXCEPTION 'not_group_member'; END IF;
  IF p_amount IS NULL OR p_amount <= 0 THEN RAISE EXCEPTION 'invalid_amount'; END IF;
  IF p_expense_date IS NULL THEN RAISE EXCEPTION 'invalid_expense_date'; END IF;
  IF p_split_mode NOT IN ('equal', 'exact') THEN RAISE EXCEPTION 'invalid_split_mode'; END IF;
  IF jsonb_typeof(p_participants) <> 'array' OR jsonb_array_length(p_participants) = 0 THEN
    RAISE EXCEPTION 'expense_without_participants';
  END IF;
  IF NOT public.is_group_member(p_group_id, p_payer_id) THEN RAISE EXCEPTION 'payer_not_group_member'; END IF;
  IF EXISTS (
    SELECT 1 FROM jsonb_to_recordset(p_participants) AS p(user_id uuid, share_amount integer)
    WHERE p.user_id IS NULL OR NOT public.is_group_member(p_group_id, p.user_id)
  ) THEN RAISE EXCEPTION 'participant_not_group_member'; END IF;
  IF (SELECT COUNT(*) FROM jsonb_to_recordset(p_participants) AS p(user_id uuid, share_amount integer))
     <> (SELECT COUNT(DISTINCT p.user_id) FROM jsonb_to_recordset(p_participants) AS p(user_id uuid, share_amount integer)) THEN
    RAISE EXCEPTION 'duplicate_participants';
  END IF;
  IF p_split_mode = 'exact' AND (
    EXISTS (SELECT 1 FROM jsonb_to_recordset(p_participants) AS p(user_id uuid, share_amount integer) WHERE p.share_amount IS NULL OR p.share_amount <= 0)
    OR (SELECT COALESCE(SUM(p.share_amount), 0) FROM jsonb_to_recordset(p_participants) AS p(user_id uuid, share_amount integer)) <> p_amount
  ) THEN RAISE EXCEPTION 'invalid_exact_shares'; END IF;

  SELECT * INTO v_existing FROM public.expenses WHERE id = p_expense_id FOR UPDATE;
  IF NOT FOUND OR v_existing.group_id <> p_group_id THEN RAISE EXCEPTION 'expense_not_found'; END IF;
  IF v_existing.status <> 'unpaid' THEN RAISE EXCEPTION 'expense_already_settled'; END IF;

  UPDATE public.expenses
  SET payer_id = p_payer_id, amount = p_amount, expense_date = p_expense_date,
      title = p_title, category = p_category, split_mode = p_split_mode
  WHERE id = p_expense_id;

  DELETE FROM public.expense_participants WHERE expense_id = p_expense_id;
  INSERT INTO public.expense_participants (expense_id, user_id, share_amount)
  SELECT p_expense_id, p.user_id,
    CASE WHEN p_split_mode = 'exact' THEN p.share_amount ELSE NULL END
  FROM jsonb_to_recordset(p_participants) AS p(user_id uuid, share_amount integer);
END;
$$;

-- 未精算全件を、二者間の債務だけで相殺して確定する。
CREATE OR REPLACE FUNCTION public.confirm_group_settlement(p_group_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_batch_id uuid;
  v_period_started_at timestamptz;
  v_period_ended_at timestamptz := now();
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  IF NOT public.is_group_member(p_group_id, v_uid) THEN RAISE EXCEPTION 'not_group_member'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.expenses WHERE group_id = p_group_id AND status = 'unpaid') THEN
    RAISE EXCEPTION 'no_unsettled_expenses';
  END IF;
  IF EXISTS (
    SELECT 1
    FROM public.expenses e
    WHERE e.group_id = p_group_id
      AND e.status = 'unpaid'
      AND NOT EXISTS (
        SELECT 1 FROM public.expense_participants ep WHERE ep.expense_id = e.id
      )
  ) THEN RAISE EXCEPTION 'expense_without_participants'; END IF;

  SELECT COALESCE(MAX(period_ended_at), MIN(created_at))
  INTO v_period_started_at
  FROM public.settlement_batches
  WHERE group_id = p_group_id;
  IF v_period_started_at IS NULL THEN
    SELECT created_at INTO v_period_started_at FROM public.groups WHERE id = p_group_id;
  END IF;

  INSERT INTO public.settlement_batches (
    group_id, target_month, status, created_by, period_started_at, period_ended_at
  ) VALUES (
    p_group_id, NULL, 'confirmed', v_uid, v_period_started_at, v_period_ended_at
  ) RETURNING id INTO v_batch_id;

  WITH target AS (
    SELECT e.id, e.amount, e.payer_id, e.split_mode
    FROM public.expenses e
    WHERE e.group_id = p_group_id AND e.status = 'unpaid'
  ), participant_counts AS (
    SELECT ep.expense_id, COUNT(*)::integer AS participant_count
    FROM public.expense_participants ep
    JOIN target t ON t.id = ep.expense_id
    GROUP BY ep.expense_id
  ), share_rows AS (
    SELECT ep.user_id AS debtor_id, t.payer_id AS creditor_id,
      CASE WHEN t.split_mode = 'exact' THEN ep.share_amount ELSE t.amount / pc.participant_count END AS amount
    FROM target t
    JOIN public.expense_participants ep ON ep.expense_id = t.id
    JOIN participant_counts pc ON pc.expense_id = t.id
    UNION ALL
    SELECT t.payer_id, t.payer_id, t.amount - (t.amount / pc.participant_count) * pc.participant_count
    FROM target t
    JOIN participant_counts pc ON pc.expense_id = t.id
    WHERE t.split_mode = 'equal'
  ), pair_debts AS (
    SELECT debtor_id, creditor_id, SUM(amount)::integer AS amount
    FROM share_rows
    WHERE debtor_id <> creditor_id AND amount > 0
    GROUP BY debtor_id, creditor_id
  ), pair_net AS (
    SELECT
      LEAST(debtor_id, creditor_id) AS low_id,
      GREATEST(debtor_id, creditor_id) AS high_id,
      SUM(CASE WHEN debtor_id < creditor_id THEN amount ELSE -amount END)::integer AS net_amount
    FROM pair_debts
    GROUP BY LEAST(debtor_id, creditor_id), GREATEST(debtor_id, creditor_id)
  )
  INSERT INTO public.settlement_transfers (batch_id, from_user_id, to_user_id, amount)
  SELECT v_batch_id,
    CASE WHEN net_amount > 0 THEN low_id ELSE high_id END,
    CASE WHEN net_amount > 0 THEN high_id ELSE low_id END,
    ABS(net_amount)
  FROM pair_net
  WHERE net_amount <> 0;

  UPDATE public.expenses
  SET status = 'settled', settlement_batch_id = v_batch_id
  WHERE group_id = p_group_id AND status = 'unpaid';

  RETURN v_batch_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_expense_with_participants(uuid, uuid, integer, date, text, text, uuid, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_expense_with_participants(uuid, uuid, integer, date, text, text, uuid, text, jsonb) TO authenticated;
REVOKE ALL ON FUNCTION public.update_expense_with_participants(uuid, uuid, uuid, integer, date, text, text, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_expense_with_participants(uuid, uuid, uuid, integer, date, text, text, text, jsonb) TO authenticated;
REVOKE ALL ON FUNCTION public.confirm_group_settlement(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.confirm_group_settlement(uuid) TO authenticated;
