import type { SupabaseClient } from "@supabase/supabase-js";

import * as repo from "@/features/groups/lib/repositories/group-detail-repository";
import type {
  GroupSpendChartsExpenseRow,
  GroupSpendChartsMemberRow,
  GroupSpendChartsPageLoadResult,
} from "@/features/groups/lib/types/group-spend-charts-screen.types";

export async function loadGroupSpendChartsPageData(
  client: SupabaseClient,
  opts: { groupId: string; userId: string },
): Promise<GroupSpendChartsPageLoadResult> {
  const { groupId, userId } = opts;

  const { data: membership, error: memErr } = await repo.selectMembershipRole(
    client,
    groupId,
    userId,
  );

  if (memErr || !membership) {
    return { kind: "not_found" };
  }

  const [groupRes, membersRes, expensesRes] = await Promise.all([
    repo.selectGroupName(client, groupId),
    repo.selectGroupMembersForCharts(client, groupId),
    repo.selectExpensesForCharts(client, groupId),
  ]);

  const { data: groupRow } = groupRes;
  const groupLabel = groupRow?.name?.trim() || "Family Room";

  const { data: memberRows, error: mErr } = membersRes;

  if (mErr || !memberRows?.length) {
    return { kind: "members_error", message: mErr?.message };
  }

  const { data: expenseRows, error: exErr } = expensesRes;

  if (exErr) {
    return { kind: "expenses_error", message: exErr.message };
  }

  return {
    kind: "ok",
    groupLabel,
    members: memberRows as unknown as GroupSpendChartsMemberRow[],
    expenses: (expenseRows ?? []) as unknown as GroupSpendChartsExpenseRow[],
  };
}
