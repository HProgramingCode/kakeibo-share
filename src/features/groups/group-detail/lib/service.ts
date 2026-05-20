import type { SupabaseClient } from "@supabase/supabase-js";

import { guardGroupMembership } from "@/features/groups/lib/group-membership-guard";
import * as repo from "@/features/groups/lib/repositories/group-detail-repository";
import type {
  BatchRow,
  ExpenseRow,
  GroupDetailPageLoadResult,
  MemberRow,
} from "./types";

export async function loadGroupDetailPageData(
  client: SupabaseClient,
  opts: { groupId: string; userId: string },
): Promise<GroupDetailPageLoadResult> {
  const { groupId, userId } = opts;

  const membership = await guardGroupMembership(client, groupId, userId);
  if (!membership.ok) {
    return { kind: "not_found" };
  }

  const [membersRes, groupRes, profileRes, expensesRes, batchesRes] =
    await Promise.all([
      repo.selectGroupMembersWithProfiles(client, groupId),
      repo.selectGroupName(client, groupId),
      repo.selectOwnDisplayName(client, userId),
      repo.selectExpensesForGroup(client, groupId),
      repo.selectSettlementBatchesForGroup(client, groupId),
    ]);

  const { data: memberRows, error: mErr } = membersRes;

  if (mErr || !memberRows?.length) {
    return { kind: "members_error", message: mErr?.message };
  }

  const { data: groupRow } = groupRes;
  const groupLabel = groupRow?.name?.trim() || "Family Room";

  const initialDisplayName = profileRes.data?.display_name?.trim() ?? "";

  const { data: expenseRows, error: exErr } = expensesRes;

  if (exErr) {
    return { kind: "expenses_error", message: exErr.message };
  }

  const { data: batchRows, error: bErr } = batchesRes;

  if (bErr) {
    return { kind: "batches_error", message: bErr.message };
  }

  return {
    kind: "ok",
    membershipRole: membership.role,
    members: memberRows as unknown as MemberRow[],
    groupLabel,
    initialDisplayName,
    expenses: (expenseRows ?? []) as unknown as ExpenseRow[],
    batches: (batchRows ?? []) as unknown as BatchRow[],
  };
}
