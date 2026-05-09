-- kakeibo-share initial schema（docs/engineering/data-model.md + group_invites）

-- ---------------------------------------------------------------------------
-- Core tables
-- ---------------------------------------------------------------------------

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data ->> 'full_name',
      NEW.raw_user_meta_data ->> 'name',
      split_part(NEW.email, '@', 1)
    )
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_by uuid REFERENCES public.profiles (id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.groups (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (group_id, user_id)
);

CREATE OR REPLACE FUNCTION public.add_creator_as_group_owner()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.created_by IS NOT NULL THEN
    INSERT INTO public.group_members (group_id, user_id, role)
    VALUES (NEW.id, NEW.created_by, 'owner');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER tr_groups_add_creator_member
  AFTER INSERT ON public.groups
  FOR EACH ROW
  EXECUTE FUNCTION public.add_creator_as_group_owner();

CREATE TABLE public.settlement_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.groups (id) ON DELETE CASCADE,
  target_month text NOT NULL CHECK (target_month ~ '^[0-9]{4}-[0-9]{2}$'),
  status text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed')),
  created_by uuid REFERENCES public.profiles (id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (group_id, target_month)
);

CREATE TABLE public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.groups (id) ON DELETE CASCADE,
  payer_id uuid NOT NULL REFERENCES public.profiles (id),
  title text,
  category text,
  amount integer NOT NULL CHECK (amount > 0),
  expense_date date NOT NULL DEFAULT ((timezone('Asia/Tokyo', now())))::date,
  status text NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'settled')),
  settlement_batch_id uuid REFERENCES public.settlement_batches (id) ON DELETE RESTRICT,
  receipt_image_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX expenses_group_month_idx ON public.expenses (group_id, expense_date);
CREATE INDEX expenses_group_status_idx ON public.expenses (group_id, status);

CREATE TABLE public.expense_participants (
  expense_id uuid NOT NULL REFERENCES public.expenses (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  PRIMARY KEY (expense_id, user_id)
);

CREATE TABLE public.settlement_transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES public.settlement_batches (id) ON DELETE CASCADE,
  from_user_id uuid NOT NULL REFERENCES public.profiles (id),
  to_user_id uuid NOT NULL REFERENCES public.profiles (id),
  amount integer NOT NULL CHECK (amount > 0),
  CHECK (from_user_id <> to_user_id)
);

CREATE INDEX settlement_transfers_batch_idx ON public.settlement_transfers (batch_id);

CREATE TABLE public.group_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.groups (id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  created_by uuid NOT NULL REFERENCES public.profiles (id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX group_invites_group_id_idx ON public.group_invites (group_id);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlement_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlement_transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own_or_groupmate"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1
      FROM public.group_members gm_self
      JOIN public.group_members gm_other ON gm_self.group_id = gm_other.group_id
      WHERE gm_self.user_id = auth.uid()
        AND gm_other.user_id = profiles.id
    )
  );

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "groups_select_member"
  ON public.groups FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = groups.id AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "groups_insert_self_creator"
  ON public.groups FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND created_by = auth.uid()
  );

CREATE POLICY "group_members_select_member"
  ON public.group_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = group_members.group_id AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "group_invites_owner_select"
  ON public.group_invites FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = group_invites.group_id
        AND gm.user_id = auth.uid()
        AND gm.role = 'owner'
    )
  );

CREATE POLICY "group_invites_owner_insert"
  ON public.group_invites FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = group_invites.group_id
        AND gm.user_id = auth.uid()
        AND gm.role = 'owner'
    )
    AND created_by = auth.uid()
  );

CREATE POLICY "group_invites_owner_delete"
  ON public.group_invites FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = group_invites.group_id
        AND gm.user_id = auth.uid()
        AND gm.role = 'owner'
    )
  );

CREATE POLICY "settlement_batches_select_member"
  ON public.settlement_batches FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = settlement_batches.group_id AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "expenses_member_rw"
  ON public.expenses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = expenses.group_id AND gm.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = expenses.group_id AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "expense_participants_member_rw"
  ON public.expense_participants FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.expenses e
      JOIN public.group_members gm ON gm.group_id = e.group_id
      WHERE e.id = expense_participants.expense_id AND gm.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.expenses e
      JOIN public.group_members gm ON gm.group_id = e.group_id
      WHERE e.id = expense_participants.expense_id AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "settlement_transfers_select_member"
  ON public.settlement_transfers FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.settlement_batches sb
      JOIN public.group_members gm ON gm.group_id = sb.group_id
      WHERE sb.id = settlement_transfers.batch_id AND gm.user_id = auth.uid()
    )
  );
