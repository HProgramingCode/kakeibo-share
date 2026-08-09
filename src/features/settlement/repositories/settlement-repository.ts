import type { SupabaseClient } from "@supabase/supabase-js";

export async function confirmGroupSettlement(client: SupabaseClient, groupId: string) {
  return client.rpc("confirm_group_settlement", {
    p_group_id: groupId,
  });
}
