import type { SupabaseClient } from "@supabase/supabase-js";

import * as repo from "@/features/groups/lib/repositories/group-detail-repository";
import type {
  BatchRow,
  ExpenseRow,
  GroupDetailCoreLoadResult,
  GroupDetailDashboardLoadResult,
  GroupDetailHistoryLoadResult,
  MemberRow,
} from "./types";

function resolveMembershipFromMembers(
  memberRows: MemberRow[] | null | undefined,
  userId: string,
): { ok: true; role: string } | { ok: false } {
  const membership = memberRows?.find((row) => row.user_id === userId);
  if (!membership?.role) {
    return { ok: false };
  }
  return { ok: true, role: membership.role };
}

async function loadGroupDetailCoreData(
  client: SupabaseClient,
  opts: { groupId: string; userId: string },
): Promise<GroupDetailCoreLoadResult> {
  const { groupId, userId } = opts;

  const [membersRes, groupRes, profileRes] = await Promise.all([
    repo.selectGroupMembersWithProfiles(client, groupId),
    repo.selectGroupName(client, groupId),
    repo.selectOwnDisplayName(client, userId),
  ]);

  const { data: memberRows, error: mErr } = membersRes;

  if (mErr || !memberRows?.length) {
    return { kind: "members_error", message: mErr?.message };
  }

  const members = memberRows as unknown as MemberRow[];
  const membership = resolveMembershipFromMembers(members, userId);
  if (!membership.ok) {
    return { kind: "not_found" };
  }

  const { data: groupRow } = groupRes;
  const groupLabel = groupRow?.name?.trim() || "Family Room";
  const initialDisplayName = profileRes.data?.display_name?.trim() ?? "";

  return {
    kind: "ok",
    membershipRole: membership.role,
    members,
    groupLabel,
    initialDisplayName,
  };
}

export async function loadGroupDetailDashboardData(
  client: SupabaseClient,
  opts: { groupId: string; userId: string },
): Promise<GroupDetailDashboardLoadResult> {
  const core = await loadGroupDetailCoreData(client, opts);
  if (core.kind !== "ok") {
    return core;
  }

  const { data: expenseRows, error: exErr } =
    await repo.selectUnpaidExpensesForGroup(client, opts.groupId);

  if (exErr) {
    return { kind: "expenses_error", message: exErr.message };
  }

  return {
    kind: "ok",
    membershipRole: core.membershipRole,
    members: core.members,
    groupLabel: core.groupLabel,
    initialDisplayName: core.initialDisplayName,
    unpaidExpenses: (expenseRows ?? []) as unknown as ExpenseRow[],
  };
}

export async function loadGroupDetailHistoryData(
  client: SupabaseClient,
  opts: { groupId: string; userId: string },
): Promise<GroupDetailHistoryLoadResult> {
  const core = await loadGroupDetailCoreData(client, opts);
  if (core.kind !== "ok") {
    return { kind: "not_found" };
  }

  const [expensesRes, batchesRes] = await Promise.all([
    repo.selectExpensesForGroup(client, opts.groupId),
    repo.selectSettlementBatchesForGroup(client, opts.groupId),
  ]);

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
    expenses: (expenseRows ?? []) as unknown as ExpenseRow[],
    batches: (batchRows ?? []) as unknown as BatchRow[],
  };
}

/** @deprecated loadGroupDetailDashboardData + loadGroupDetailHistoryData を使用 */
export async function loadGroupDetailPageData(
  client: SupabaseClient,
  opts: { groupId: string; userId: string },
) {
  const dashboard = await loadGroupDetailDashboardData(client, opts);
  if (dashboard.kind !== "ok") {
    return dashboard;
  }

  const history = await loadGroupDetailHistoryData(client, opts);
  if (history.kind !== "ok") {
    return history;
  }

  return {
    kind: "ok" as const,
    membershipRole: dashboard.membershipRole,
    members: dashboard.members,
    groupLabel: dashboard.groupLabel,
    initialDisplayName: dashboard.initialDisplayName,
    expenses: history.expenses,
    batches: history.batches,
  };
}
