-- 招待トークン（平文）の SHA-256（UTF-8、hex）を token_hash と照合し、メンバーに追加する。

CREATE OR REPLACE FUNCTION public.accept_group_invite(p_invite_token text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_hash text;
  v_invite public.group_invites%ROWTYPE;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  IF p_invite_token IS NULL OR length(trim(p_invite_token)) = 0 THEN
    RAISE EXCEPTION 'invalid_token';
  END IF;

  v_hash := encode(
    extensions.digest(convert_to(trim(p_invite_token), 'UTF8'), 'sha256'),
    'hex'
  );

  SELECT *
  INTO v_invite
  FROM public.group_invites
  WHERE token_hash = v_hash;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'invalid_or_expired_invite';
  END IF;

  IF v_invite.expires_at <= now() THEN
    RAISE EXCEPTION 'invalid_or_expired_invite';
  END IF;

  IF public.is_group_member(v_invite.group_id, v_uid) THEN
    RETURN v_invite.group_id;
  END IF;

  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (v_invite.group_id, v_uid, 'member');

  RETURN v_invite.group_id;
END;
$$;

REVOKE ALL ON FUNCTION public.accept_group_invite(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.accept_group_invite(text) TO authenticated;
