-- groups: オーナーのみ DELETE 可能（関連データは ON DELETE CASCADE）

CREATE POLICY "groups_owner_delete"
  ON public.groups FOR DELETE
  USING (public.is_group_owner(id, auth.uid()));
