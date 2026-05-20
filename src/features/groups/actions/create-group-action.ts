"use server";

import * as authRepo from "@/features/auth/lib/repositories/auth-repository";
import * as groupWriteRepo from "@/features/groups/lib/repositories/group-write-repository";
import { ROUTES } from "@/lib/routes";
import { createClient } from "@/server/supabase/server";
import { redirect } from "next/navigation";

export async function createGroupAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await authRepo.getSessionUser(supabase);

  if (!user) {
    redirect(ROUTES.login);
  }

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
