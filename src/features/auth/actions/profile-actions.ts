"use server";

import { createClient } from "@/shared/supabase/server";
import { revalidatePath } from "next/cache";

const DISPLAY_NAME_MAX = 80;

export async function updateProfileDisplayNameAction(
  formData: FormData,
): Promise<{ error?: string }> {
  const groupId = String(formData.get("group_id") ?? "").trim();
  const displayNameRaw = String(formData.get("display_name") ?? "");
  const displayName = displayNameRaw.trim();

  if (!groupId) {
    return { error: "グループが不正です" };
  }

  if (displayName.length > DISPLAY_NAME_MAX) {
    return { error: `表示名は${DISPLAY_NAME_MAX}文字以内にしてください` };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "ログインが必要です" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: displayName.length > 0 ? displayName : null })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/groups/${groupId}`);
  revalidatePath(`/groups/${groupId}/charts`);
  return {};
}
