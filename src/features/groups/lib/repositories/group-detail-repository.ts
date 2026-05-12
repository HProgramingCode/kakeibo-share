import type { SupabaseClient } from "@supabase/supabase-js";

export async function selectMembershipRole(
  client: SupabaseClient,
  groupId: string,
  userId: string,
) {
  return client
    .from("group_members")
    .select("role")
    .eq("group_id", groupId)
    .eq("user_id", userId)
    .maybeSingle();
}

/** Server Actions で参加者検証に使う（profiles は不要） */
export async function selectGroupMemberUserIds(
  client: SupabaseClient,
  groupId: string,
) {
  return client.from("group_members").select("user_id").eq("group_id", groupId);
}

export async function selectGroupMembersWithProfiles(
  client: SupabaseClient,
  groupId: string,
) {
  return client
    .from("group_members")
    .select("user_id, role, profiles ( id, display_name )")
    .eq("group_id", groupId);
}

export async function selectGroupName(client: SupabaseClient, groupId: string) {
  return client.from("groups").select("name").eq("id", groupId).maybeSingle();
}

export async function selectOwnDisplayName(
  client: SupabaseClient,
  userId: string,
) {
  return client
    .from("profiles")
    .select("display_name")
    .eq("id", userId)
    .maybeSingle();
}

export async function selectExpensesForGroup(
  client: SupabaseClient,
  groupId: string,
) {
  return client
    .from("expenses")
    .select(
      "id, amount, expense_date, title, category, payer_id, status, expense_participants ( user_id )",
    )
    .eq("group_id", groupId)
    .order("expense_date", { ascending: false });
}

export async function selectSettlementBatchesForGroup(
  client: SupabaseClient,
  groupId: string,
) {
  return client
    .from("settlement_batches")
    .select(
      "id, target_month, created_at, settlement_transfers ( from_user_id, to_user_id, amount )",
    )
    .eq("group_id", groupId)
    .order("target_month", { ascending: false });
}

export async function selectGroupMembersForCharts(
  client: SupabaseClient,
  groupId: string,
) {
  return client
    .from("group_members")
    .select("user_id, profiles ( id, display_name )")
    .eq("group_id", groupId);
}

export async function selectExpensesForCharts(
  client: SupabaseClient,
  groupId: string,
) {
  return client
    .from("expenses")
    .select("amount, expense_date, payer_id, expense_participants ( user_id )")
    .eq("group_id", groupId)
    .order("expense_date", { ascending: false });
}
