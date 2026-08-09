-- NEW / OLD はトリガー対象テーブルごとに異なる record 型のため、
-- 存在しないフィールドを CASE 式で参照しないようにする。

CREATE OR REPLACE FUNCTION public.check_expense_participant_shares()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
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
