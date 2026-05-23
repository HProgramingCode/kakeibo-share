import * as profileRepo from "@/features/auth/lib/repositories/profile-repository";
import type { SupabaseClient } from "@supabase/supabase-js";

export const PROFILE_DISPLAY_NAME_MAX = 80;

export type UpdateProfileDisplayNameResult =
  | { kind: "success" }
  | { kind: "validation"; message: string }
  | { kind: "db"; message: string };

export async function updateProfileDisplayName(
  client: SupabaseClient,
  input: { userId: string; displayNameRaw: string },
): Promise<UpdateProfileDisplayNameResult> {
  const displayName = input.displayNameRaw.trim();

  if (displayName.length > PROFILE_DISPLAY_NAME_MAX) {
    return {
      kind: "validation",
      message: `表示名は${PROFILE_DISPLAY_NAME_MAX}文字以内にしてください`,
    };
  }

  const { error } = await profileRepo.updateProfileDisplayName(
    client,
    input.userId,
    displayName.length > 0 ? displayName : null,
  );

  if (error) {
    return { kind: "db", message: error.message };
  }

  return { kind: "success" };
}
