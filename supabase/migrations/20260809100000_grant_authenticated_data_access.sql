-- RLS policies determine which rows a group member can access.  The
-- authenticated database role also needs these table-level privileges before
-- PostgREST can evaluate those policies.
GRANT USAGE ON SCHEMA public TO authenticated;

GRANT SELECT, UPDATE ON TABLE public.profiles TO authenticated;
GRANT SELECT, INSERT, DELETE ON TABLE public.groups TO authenticated;
GRANT SELECT ON TABLE public.group_members TO authenticated;
GRANT SELECT, INSERT, DELETE ON TABLE public.group_invites TO authenticated;
GRANT SELECT ON TABLE public.settlement_batches TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.expenses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.expense_participants TO authenticated;
GRANT SELECT ON TABLE public.settlement_transfers TO authenticated;
