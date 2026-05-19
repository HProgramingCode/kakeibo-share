import type { SupabaseClient } from "@supabase/supabase-js";

export async function confirmMonthlySettlement(
  client: SupabaseClient,
  input: { groupId: string; targetMonth: string },
) {
  return client.rpc("confirm_monthly_settlement", {
    p_group_id: input.groupId,
    p_target_month: input.targetMonth,
  });
}
