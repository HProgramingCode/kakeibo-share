-- group_members の RLS が自分自身を参照して無限再帰になるのを防ぐ。
-- SECURITY DEFINER でメンバー判定し、ポリシー内の再帰参照を除去する。

CREATE OR REPLACE FUNCTION public.is_group_member(_group_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.group_members gm
    WHERE gm.group_id = _group_id
      AND gm.user_id = _user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.is_group_owner(_group_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.group_members gm
    WHERE gm.group_id = _group_id
      AND gm.user_id = _user_id
      AND gm.role = 'owner'
  );
$$;

CREATE OR REPLACE FUNCTION public.users_share_group(_user_a uuid, _user_b uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.group_members g1
    INNER JOIN public.group_members g2 ON g1.group_id = g2.group_id
    WHERE g1.user_id = _user_a
      AND g2.user_id = _user_b
  );
$$;

REVOKE ALL ON FUNCTION public.is_group_member(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_group_member(uuid, uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.is_group_owner(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_group_owner(uuid, uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.users_share_group(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.users_share_group(uuid, uuid) TO authenticated;

DROP POLICY IF EXISTS "profiles_select_own_or_groupmate" ON public.profiles;
CREATE POLICY "profiles_select_own_or_groupmate"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id
    OR public.users_share_group(auth.uid(), id)
  );

DROP POLICY IF EXISTS "groups_select_member" ON public.groups;
CREATE POLICY "groups_select_member"
  ON public.groups FOR SELECT
  USING (public.is_group_member(id, auth.uid()));

DROP POLICY IF EXISTS "group_members_select_member" ON public.group_members;
CREATE POLICY "group_members_select_member"
  ON public.group_members FOR SELECT
  USING (public.is_group_member(group_id, auth.uid()));

DROP POLICY IF EXISTS "group_invites_owner_select" ON public.group_invites;
CREATE POLICY "group_invites_owner_select"
  ON public.group_invites FOR SELECT
  USING (public.is_group_owner(group_id, auth.uid()));

DROP POLICY IF EXISTS "group_invites_owner_insert" ON public.group_invites;
CREATE POLICY "group_invites_owner_insert"
  ON public.group_invites FOR INSERT
  WITH CHECK (
    public.is_group_owner(group_id, auth.uid())
    AND created_by = auth.uid()
  );

DROP POLICY IF EXISTS "group_invites_owner_delete" ON public.group_invites;
CREATE POLICY "group_invites_owner_delete"
  ON public.group_invites FOR DELETE
  USING (public.is_group_owner(group_id, auth.uid()));

DROP POLICY IF EXISTS "settlement_batches_select_member" ON public.settlement_batches;
CREATE POLICY "settlement_batches_select_member"
  ON public.settlement_batches FOR SELECT
  USING (public.is_group_member(group_id, auth.uid()));

DROP POLICY IF EXISTS "expenses_member_rw" ON public.expenses;
CREATE POLICY "expenses_member_rw"
  ON public.expenses FOR ALL
  USING (public.is_group_member(group_id, auth.uid()))
  WITH CHECK (public.is_group_member(group_id, auth.uid()));

DROP POLICY IF EXISTS "expense_participants_member_rw" ON public.expense_participants;
CREATE POLICY "expense_participants_member_rw"
  ON public.expense_participants FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.expenses e
      WHERE e.id = expense_participants.expense_id
        AND public.is_group_member(e.group_id, auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.expenses e
      WHERE e.id = expense_participants.expense_id
        AND public.is_group_member(e.group_id, auth.uid())
    )
  );

DROP POLICY IF EXISTS "settlement_transfers_select_member" ON public.settlement_transfers;
CREATE POLICY "settlement_transfers_select_member"
  ON public.settlement_transfers FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.settlement_batches sb
      WHERE sb.id = settlement_transfers.batch_id
        AND public.is_group_member(sb.group_id, auth.uid())
    )
  );
