"use server";

import { createClient } from "@/shared/supabase/server";
import { createHash, randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

function hashInviteToken(plain: string): string {
  return createHash("sha256").update(plain, "utf8").digest("hex");
}

export async function createGroupInviteAction(
  groupId: string,
): Promise<{ url?: string; error?: string }> {
  const id = groupId.trim();
  if (!id) {
    return { error: "グループが不正です" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "ログインが必要です" };
  }

  const { data: mem, error: memErr } = await supabase
    .from("group_members")
    .select("role")
    .eq("group_id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (memErr || !mem || mem.role !== "owner") {
    return { error: "招待を発行できるのはオーナーのみです" };
  }

  const plain = randomBytes(32).toString("hex");
  const token_hash = hashInviteToken(plain);
  const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { error: insErr } = await supabase.from("group_invites").insert({
    group_id: id,
    token_hash,
    expires_at,
    created_by: user.id,
  });

  if (insErr) {
    return { error: insErr.message };
  }

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const origin = `${proto}://${host}`;
  const url = `${origin}/join?token=${encodeURIComponent(plain)}`;

  return { url };
}

export async function acceptGroupInviteAction(formData: FormData) {
  const token = String(formData.get("token") ?? "").trim();
  if (!token) {
    redirect("/join?error=" + encodeURIComponent("招待リンクが無効です"));
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("accept_group_invite", {
    p_invite_token: token,
  });

  if (error) {
    redirect(
      "/join?token=" +
        encodeURIComponent(token) +
        "&error=" +
        encodeURIComponent("招待が無効か期限切れです"),
    );
  }

  const groupId = data as string;
  redirect(`/groups/${groupId}`);
}
