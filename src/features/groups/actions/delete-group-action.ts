"use server";

import {
  isAuthActionError,
  requireAuthForAction,
} from "@/features/auth/server/require-auth-for-action";
import { selectMembershipRole } from "@/features/groups/repositories/group-detail-repository";
import * as groupWriteRepo from "@/features/groups/repositories/group-write-repository";
import { ROUTES } from "@/shared/navigation/routes";
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

  const auth = await requireAuthForAction({ mode: "returnError" });
  if (isAuthActionError(auth)) {
    return { ok: false, error: auth.error };
  }
  const { supabase, user } = auth;

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
