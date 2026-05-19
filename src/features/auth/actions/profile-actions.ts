"use server";

import { updateProfileDisplayName } from "@/features/auth/lib/services/profile-service";
import { groupChartsPath, groupDetailPath } from "@/lib/routes";
import { createClient } from "@/server/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfileDisplayNameAction(
  formData: FormData,
): Promise<{ error?: string }> {
  const groupId = String(formData.get("group_id") ?? "").trim();
  const displayNameRaw = String(formData.get("display_name") ?? "");

  if (!groupId) {
    return { error: "グループが不正です" };
  }

  const supabase = await createClient();
  const result = await updateProfileDisplayName(supabase, { displayNameRaw });

  if (result.kind === "validation" || result.kind === "db") {
    return { error: result.message };
  }

  if (result.kind === "unauthorized") {
    return { error: "ログインが必要です" };
  }

  revalidatePath(groupDetailPath(groupId));
  revalidatePath(groupChartsPath(groupId));
  return {};
}
