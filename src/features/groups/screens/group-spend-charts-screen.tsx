import { requireAuthContext } from "@/features/auth/lib/require-auth-context";
import {
  buildNameByUserId,
  mapExpensesForMonthlySeries,
  mapExpensesForParticipantShares,
} from "@/features/groups/lib/map-group-spend-charts-view-model";
import { loadGroupSpendChartsPageData } from "@/features/groups/lib/services/group-spend-charts-service";
import type { GroupSpendChartsPageProps } from "@/features/groups/lib/types/group-spend-charts-screen.types";
import { GroupsDestructiveAlert } from "@/features/groups/shared/GroupsDestructiveAlert";
import { GroupSpendChartsScreenHeader } from "@/features/groups/ui/GroupSpendChartsScreenHeader";
import {
  buildMonthlySpendSeries,
  buildParticipantShareTotalsByMonth,
} from "@/features/settlement/lib/monthly-spend-series";
import { GroupSpendCharts } from "@/features/settlement/ui/GroupSpendCharts";
import { notFound } from "next/navigation";

export default async function GroupSpendChartsScreen({
  params,
}: GroupSpendChartsPageProps) {
  const { id } = await params;

  const { supabase, user } = await requireAuthContext();

  const loadResult = await loadGroupSpendChartsPageData(supabase, {
    groupId: id,
    userId: user.id,
  });

  if (loadResult.kind === "not_found") {
    notFound();
  }

  if (loadResult.kind === "members_error") {
    return (
      <GroupsDestructiveAlert>
        メンバー情報の読み込みに失敗しました
        {loadResult.message ? `: ${loadResult.message}` : ""}
      </GroupsDestructiveAlert>
    );
  }

  if (loadResult.kind === "expenses_error") {
    return (
      <GroupsDestructiveAlert>
        支出の読み込みに失敗しました: {loadResult.message}
      </GroupsDestructiveAlert>
    );
  }

  const { groupLabel, members, expenses } = loadResult;

  const nameByUserId = buildNameByUserId(members);
  const monthlySpendSeries = buildMonthlySpendSeries(
    mapExpensesForMonthlySeries(expenses),
  );
  const payerTotalsByMonth = buildParticipantShareTotalsByMonth(
    mapExpensesForParticipantShares(expenses),
  );

  return (
    <div className="flex flex-col gap-8">
      <GroupSpendChartsScreenHeader groupId={id} groupLabel={groupLabel} />
      <GroupSpendCharts
        data={monthlySpendSeries}
        showCardHeading={false}
        payerTotalsByMonth={payerTotalsByMonth}
        nameByUserId={nameByUserId}
      />
    </div>
  );
}
