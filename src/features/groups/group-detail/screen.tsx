import {
  buildGroupDetailViewModel,
  currentMonthJstYm,
  todayJstYmd,
} from "./lib/view-model";
import { loadGroupDetailPageData } from "./lib/service";
import type { GroupDetailPageProps } from "./lib/types";
import { GroupsDestructiveAlert } from "@/features/groups/shared/GroupsDestructiveAlert";
import { GroupDetailDashboardPanel } from "./ui/dashboard/GroupDetailDashboardPanel";
import { GroupDetailFlashAlerts } from "./ui/GroupDetailFlashAlerts";
import { GroupDetailHistoryPanel } from "./ui/history/GroupDetailHistoryPanel";
import { GroupDetailScreenHeader } from "./ui/header/GroupDetailScreenHeader";
import { GroupDetailTabs } from "./ui/GroupDetailTabs";
import { GroupExpenseCreateSection } from "./ui/GroupExpenseCreateSection";
import * as authRepo from "@/features/auth/lib/repositories/auth-repository";
import { createClient } from "@/server/supabase/server";
import { ROUTES } from "@/lib/routes";
import { notFound, redirect } from "next/navigation";

export default async function GroupDetailPage({
  params,
  searchParams,
}: GroupDetailPageProps) {
  const { id } = await params;
  const sp = await searchParams;
  const queryError = sp?.error;
  const settledMonth = sp?.settled;

  const supabase = await createClient();
  const {
    data: { user },
  } = await authRepo.getSessionUser(supabase);

  if (!user) {
    redirect(ROUTES.login);
  }

  const loadResult = await loadGroupDetailPageData(supabase, {
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

  if (loadResult.kind === "batches_error") {
    return (
      <GroupsDestructiveAlert>
        精算履歴の読み込みに失敗しました: {loadResult.message}
      </GroupsDestructiveAlert>
    );
  }

  const {
    membershipRole,
    members,
    groupLabel,
    initialDisplayName,
    expenses,
    batches,
  } = loadResult;

  const vm = buildGroupDetailViewModel(members, expenses);
  const {
    nameById,
    transferPreview,
    unpaidFeedItems,
    settledFeedItems,
    membersForExpenseEdit,
    menuMembers,
  } = vm;

  const dashboardSlot = (
    <GroupDetailDashboardPanel
      groupId={id}
      currentUserId={user.id}
      transferPreview={transferPreview}
      nameByUserId={nameById}
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
    <GroupDetailHistoryPanel
      settledFeedItems={settledFeedItems}
      batches={batches}
      nameByUserId={nameById}
    />
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
