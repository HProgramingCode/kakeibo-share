import type { SupabaseClient } from "@supabase/supabase-js";

export async function selectGroupMembershipsWithGroups(
  client: SupabaseClient,
  userId: string,
) {
  return client
    .from("group_members")
    .select("group_id, role, groups ( id, name, created_at )")
    .eq("user_id", userId);
}
