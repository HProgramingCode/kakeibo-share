-- 期間精算で追加した関数を REST の匿名ロールから呼び出せないようにする。
-- トリガー関数は固定 search_path にして advisor の警告を解消する。

ALTER FUNCTION public.check_expense_participant_shares()
  SET search_path = public;

REVOKE ALL ON FUNCTION public.create_expense_with_participants(uuid, uuid, integer, date, text, text, uuid, text, jsonb) FROM anon;
REVOKE ALL ON FUNCTION public.update_expense_with_participants(uuid, uuid, uuid, integer, date, text, text, text, jsonb) FROM anon;
REVOKE ALL ON FUNCTION public.confirm_group_settlement(uuid) FROM anon;
