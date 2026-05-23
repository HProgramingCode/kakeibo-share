"use server";

import { updateProfileDisplayName } from "@/features/auth/lib/services/profile-service";
import { requireAuthForAction } from "@/features/auth/lib/require-auth-for-action";
import { groupChartsPath, groupDetailPath } from "@/lib/routes";
import { revalidatePath } from "next/cache";

export async function updateProfileDisplayNameAction(
  formData: FormData,
): Promise<{ error?: string }> {
  const groupId = String(formData.get("group_id") ?? "").trim();
  const displayNameRaw = String(formData.get("display_name") ?? "");

  if (!groupId) {
    return { error: "グループが不正です" };
  }

  const auth = await requireAuthForAction({ mode: "returnError" });
  if (!auth.ok) {
    return { error: auth.error };
  }

  const result = await updateProfileDisplayName(auth.supabase, {
    userId: auth.user.id,
    displayNameRaw,
  });

  if (result.kind === "validation" || result.kind === "db") {
    return { error: result.message };
  }

  revalidatePath(groupDetailPath(groupId));
  revalidatePath(groupChartsPath(groupId));
  return {};
}
