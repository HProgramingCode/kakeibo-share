"use server";

import { requireAuthForAction } from "@/features/auth/server/require-auth-for-action";
import * as groupWriteRepo from "@/features/groups/repositories/group-write-repository";
import { ROUTES } from "@/shared/navigation/routes";
import { redirect } from "next/navigation";

export async function createGroupAction(formData: FormData) {
  const { supabase, user } = await requireAuthForAction();

  const name = String(formData.get("name") ?? "").trim();

  if (!name) {
    redirect(
      `${ROUTES.groupsNew}?error=` +
        encodeURIComponent("グループ名を入力してください"),
    );
  }

  const { error } = await groupWriteRepo.insertGroup(supabase, {
    name,
    createdBy: user.id,
  });

  if (error) {
    redirect(`${ROUTES.groupsNew}?error=` + encodeURIComponent(error.message));
  }

  redirect(ROUTES.groups);
}
