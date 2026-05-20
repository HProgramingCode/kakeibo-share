"use server";

import * as authRepo from "@/features/auth/lib/repositories/auth-repository";
import { selectMembershipRole } from "@/features/groups/lib/repositories/group-detail-repository";
import * as groupWriteRepo from "@/features/groups/lib/repositories/group-write-repository";
import { ROUTES } from "@/lib/routes";
import { createClient } from "@/server/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type DeleteGroupResult = { ok: true } | { ok: false; error: string };

export async function deleteGroupAction(
  _prevState: DeleteGroupResult,
  formData: FormData,
): Promise<DeleteGroupResult> {
  const groupId = String(formData.get("group_id") ?? "").trim();
  if (!groupId) {
    return { ok: false, error: "グループが不正です" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await authRepo.getSessionUser(supabase);

  if (!user) {
    return { ok: false, error: "ログインが必要です" };
  }

  const { data: mem, error: memErr } = await selectMembershipRole(
    supabase,
    groupId,
    user.id,
  );

  if (memErr || !mem || mem.role !== "owner") {
    return { ok: false, error: "削除できるのはオーナーのみです" };
  }

  const { error } = await groupWriteRepo.deleteGroupById(supabase, groupId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath(ROUTES.groups);
  redirect(ROUTES.groups);
}
