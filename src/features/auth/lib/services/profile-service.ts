import * as authRepo from "@/features/auth/lib/repositories/auth-repository";
import * as profileRepo from "@/features/auth/lib/repositories/profile-repository";
import type { SupabaseClient } from "@supabase/supabase-js";

export const PROFILE_DISPLAY_NAME_MAX = 80;

export type UpdateProfileDisplayNameResult =
  | { kind: "success" }
  | { kind: "unauthorized" }
  | { kind: "validation"; message: string }
  | { kind: "db"; message: string };

export async function updateProfileDisplayName(
  client: SupabaseClient,
  input: { displayNameRaw: string },
): Promise<UpdateProfileDisplayNameResult> {
  const displayName = input.displayNameRaw.trim();

  if (displayName.length > PROFILE_DISPLAY_NAME_MAX) {
    return {
      kind: "validation",
      message: `表示名は${PROFILE_DISPLAY_NAME_MAX}文字以内にしてください`,
    };
  }

  const { data: userData, error: userError } =
    await authRepo.getSessionUser(client);

  if (userError || !userData.user) {
    return { kind: "unauthorized" };
  }

  const { error } = await profileRepo.updateProfileDisplayName(
    client,
    userData.user.id,
    displayName.length > 0 ? displayName : null,
  );

  if (error) {
    return { kind: "db", message: error.message };
  }

  return { kind: "success" };
}
