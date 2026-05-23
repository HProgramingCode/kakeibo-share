import { requireAuthContext } from "@/features/auth/lib/require-auth-context";
import {
  buildGroupDetailCoreViewModel,
  buildGroupDetailDashboardViewModel,
  currentMonthJstYm,
  todayJstYmd,
} from "./lib/view-model";
import { loadGroupDetailDashboardData } from "./lib/service";
import type { GroupDetailPageProps } from "./lib/types";
import { GroupsDestructiveAlert } from "@/features/groups/shared/GroupsDestructiveAlert";
import { GroupDetailDashboardPanel } from "./ui/dashboard/GroupDetailDashboardPanel";
import { GroupDetailFlashAlerts } from "./ui/GroupDetailFlashAlerts";
import { GroupDetailHistoryPanelAsync } from "./ui/history/GroupDetailHistoryPanelAsync";
import { GroupDetailHistoryPanelSkeleton } from "./ui/history/GroupDetailHistoryPanelSkeleton";
import { GroupDetailScreenHeader } from "./ui/header/GroupDetailScreenHeader";
import { GroupDetailTabs } from "./ui/GroupDetailTabs";
import { GroupExpenseCreateSection } from "./ui/GroupExpenseCreateSection";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export default async function GroupDetailPage({
  params,
  searchParams,
}: GroupDetailPageProps) {
  const { id } = await params;
  const sp = await searchParams;
  const queryError = sp?.error;
  const settledMonth = sp?.settled;

  const { supabase, user } = await requireAuthContext();

  const loadResult = await loadGroupDetailDashboardData(supabase, {
    groupId: id,
    userId: user.id,
  });

  if (loadResult.kind === "not_found") {
    notFound();
  }

  if (loadResult.kind === "members_error") {
    return (
      <GroupsDestructiveAlert>
        メンバー情報の読み込みに失敗しました: {loadResult.message}
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

  const {
    membershipRole,
    members,
    groupLabel,
    initialDisplayName,
    unpaidExpenses,
  } = loadResult;

  const coreVm = buildGroupDetailCoreViewModel(members);
  const dashboardVm = buildGroupDetailDashboardViewModel(members, unpaidExpenses);
  const { nameByUserId, membersForExpenseEdit, menuMembers } = coreVm;
  const { transferPreview, unpaidFeedItems } = dashboardVm;

  const dashboardSlot = (
    <GroupDetailDashboardPanel
      groupId={id}
      currentUserId={user.id}
      transferPreview={transferPreview}
      nameByUserId={nameByUserId}
      unpaidFeedItems={unpaidFeedItems}
      membersForExpenseEdit={membersForExpenseEdit}
      defaultSettlementMonth={currentMonthJstYm()}
    />
  );

  const registerSlot = (
    <GroupExpenseCreateSection
      groupId={id}
      currentUserId={user.id}
      membersForEdit={membersForExpenseEdit}
      defaultExpenseDate={todayJstYmd()}
    />
  );

  const historySlot = (
    <Suspense fallback={<GroupDetailHistoryPanelSkeleton />}>
      <GroupDetailHistoryPanelAsync
        groupId={id}
        userId={user.id}
        members={members}
        membersForExpenseEdit={membersForExpenseEdit}
        nameByUserId={nameByUserId}
      />
    </Suspense>
  );

  return (
    <div className="flex flex-col gap-8">
      <GroupDetailScreenHeader
        groupLabel={groupLabel}
        groupId={id}
        isOwner={membershipRole === "owner"}
        initialDisplayName={initialDisplayName}
        menuMembers={menuMembers}
      />

      <GroupDetailFlashAlerts
        queryError={queryError}
        settledMonth={settledMonth}
      />

      <GroupDetailTabs
        dashboard={dashboardSlot}
        register={registerSlot}
        history={historySlot}
      />
    </div>
  );
}
