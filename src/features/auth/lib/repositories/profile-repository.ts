import type { SupabaseClient } from "@supabase/supabase-js";

export async function updateProfileDisplayName(
  client: SupabaseClient,
  userId: string,
  displayName: string | null,
) {
  return client
    .from("profiles")
    .update({
      display_name:
        displayName !== null && displayName.length > 0 ? displayName : null,
    })
    .eq("id", userId);
}
