"use server";

import {
  groupJoinPathWithError,
  groupJoinPathWithToken,
  groupJoinPathWithTokenAndError,
} from "@/features/groups/lib/group-invite-path";
import * as authRepo from "@/features/auth/lib/repositories/auth-repository";
import { selectMembershipRole } from "@/features/groups/lib/repositories/group-detail-repository";
import * as groupWriteRepo from "@/features/groups/lib/repositories/group-write-repository";
import { groupDetailPath } from "@/lib/routes";
import { createClient } from "@/server/supabase/server";
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
  } = await authRepo.getSessionUser(supabase);
  if (!user) {
    return { error: "ログインが必要です" };
  }

  const { data: mem, error: memErr } = await selectMembershipRole(
    supabase,
    id,
    user.id,
  );

  if (memErr || !mem || mem.role !== "owner") {
    return { error: "招待を発行できるのはオーナーのみです" };
  }

  const plain = randomBytes(32).toString("hex");
  const token_hash = hashInviteToken(plain);
  const expires_at = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { error: insErr } = await groupWriteRepo.insertGroupInvite(supabase, {
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
  const url = `${origin}${groupJoinPathWithToken(plain)}`;

  return { url };
}

export async function acceptGroupInviteAction(formData: FormData) {
  const token = String(formData.get("token") ?? "").trim();
  if (!token) {
    redirect(groupJoinPathWithError("招待リンクが無効です"));
  }

  const supabase = await createClient();
  const { data, error } = await groupWriteRepo.acceptGroupInvite(
    supabase,
    token,
  );

  if (error) {
    redirect(
      groupJoinPathWithTokenAndError(token, "招待が無効か期限切れです"),
    );
  }

  const groupId = data as string;
  redirect(groupDetailPath(groupId));
}
