import { requireAuthContext } from "@/features/auth/server/require-auth-context";
import { guardGroupMembership } from "@/features/groups/server/group-membership-guard";
import * as groupDetailRepository from "@/features/groups/repositories/group-detail-repository";
import { GroupsDestructiveAlert } from "@/features/groups/components/GroupsDestructiveAlert";
import { GroupSpendChartsScreenHeader } from "@/features/groups/charts/GroupSpendChartsScreenHeader";
import {
  buildMonthlySpendSeries,
  buildParticipantShareTotalsByMonth,
} from "@/features/settlement/charts/model/monthly-spend-series";
import { GroupSpendCharts } from "@/features/settlement/charts/components/GroupSpendCharts";
import { notFound } from "next/navigation";
import {
  buildNameByUserId,
  mapExpensesForMonthlySeries,
  mapExpensesForParticipantShares,
} from "./_lib/mapper";
import type { GroupSpendChartsExpenseRow, GroupSpendChartsMemberRow } from "./_lib/types";

type Props = { params: Promise<{ id: string }> };

export default async function GroupSpendChartsPage({ params }: Props) {
  const { id } = await params;
  const { supabase, user } = await requireAuthContext();
  const membership = await guardGroupMembership(supabase, id, user.id);
  if (!membership.ok) notFound();

  const [groupRes, membersRes, expensesRes] = await Promise.all([
    groupDetailRepository.selectGroupName(supabase, id),
    groupDetailRepository.selectGroupMembersForCharts(supabase, id),
    groupDetailRepository.selectExpensesForCharts(supabase, id),
  ]);
  if (membersRes.error || !membersRes.data?.length) {
    return <GroupsDestructiveAlert>メンバー情報の読み込みに失敗しました{membersRes.error?.message ? `: ${membersRes.error.message}` : ""}</GroupsDestructiveAlert>;
  }
  if (expensesRes.error) {
    return <GroupsDestructiveAlert>支出の読み込みに失敗しました: {expensesRes.error.message}</GroupsDestructiveAlert>;
  }

  const members = membersRes.data as unknown as GroupSpendChartsMemberRow[];
  const expenses = (expensesRes.data ?? []) as unknown as GroupSpendChartsExpenseRow[];
  return (
    <div className="flex flex-col gap-8">
      <GroupSpendChartsScreenHeader groupId={id} groupLabel={groupRes.data?.name?.trim() || "Family Room"} />
      <GroupSpendCharts
        data={buildMonthlySpendSeries(mapExpensesForMonthlySeries(expenses))}
        showCardHeading={false}
        payerTotalsByMonth={buildParticipantShareTotalsByMonth(mapExpensesForParticipantShares(expenses))}
        nameByUserId={buildNameByUserId(members)}
      />
    </div>
  );
}
