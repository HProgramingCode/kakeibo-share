import { requireAuthContext } from "@/features/auth/server/require-auth-context";
import * as groupDetailRepository from "@/features/groups/repositories/group-detail-repository";
import { GroupsDestructiveAlert } from "@/features/groups/components/GroupsDestructiveAlert";
import {
  buildGroupDetailCoreViewModel,
  buildGroupDetailDashboardViewModel,
  todayJstYmd,
} from "./_lib/mapper";
import type { ExpenseRow, MemberRow } from "./_lib/types";
import { GroupDetailDashboardPanel } from "./_components/dashboard/GroupDetailDashboardPanel";
import { GroupDetailFlashAlerts } from "./_components/GroupDetailFlashAlerts";
import { GroupDetailHistoryPanelAsync } from "./_components/history/GroupDetailHistoryPanelAsync";
import { GroupDetailHistoryPanelSkeleton } from "./_components/history/GroupDetailHistoryPanelSkeleton";
import { GroupDetailScreenHeader } from "./_components/header/GroupDetailScreenHeader";
import { GroupDetailTabs } from "./_components/GroupDetailTabs";
import { GroupExpenseCreateSection } from "./_components/GroupExpenseCreateSection";
import { notFound } from "next/navigation";
import { Suspense } from "react";

type Props = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string; settled?: string; created?: string }>;
};

export default async function GroupDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const { supabase, user } = await requireAuthContext();

  const [membersRes, groupRes, profileRes, expensesRes] = await Promise.all([
    groupDetailRepository.selectGroupMembersWithProfiles(supabase, id),
    groupDetailRepository.selectGroupName(supabase, id),
    groupDetailRepository.selectOwnDisplayName(supabase, user.id),
    groupDetailRepository.selectUnpaidExpensesForGroup(supabase, id),
  ]);

  if (membersRes.error || !membersRes.data?.length) {
    return (
      <GroupsDestructiveAlert>
        メンバー情報の読み込みに失敗しました: {membersRes.error?.message}
      </GroupsDestructiveAlert>
    );
  }

  const members = membersRes.data as unknown as MemberRow[];
  const membership = members.find((member) => member.user_id === user.id);
  if (!membership?.role) notFound();

  if (expensesRes.error) {
    return (
      <GroupsDestructiveAlert>
        支出の読み込みに失敗しました: {expensesRes.error.message}
      </GroupsDestructiveAlert>
    );
  }

  const coreVm = buildGroupDetailCoreViewModel(members);
  const dashboardVm = buildGroupDetailDashboardViewModel(
    members,
    (expensesRes.data ?? []) as unknown as ExpenseRow[],
  );
  const groupLabel = groupRes.data?.name?.trim() || "Family Room";
  const initialDisplayName = profileRes.data?.display_name?.trim() ?? "";

  return (
    <div className="flex flex-col gap-8">
      <GroupDetailScreenHeader
        groupLabel={groupLabel}
        groupId={id}
        isOwner={membership.role === "owner"}
        initialDisplayName={initialDisplayName}
        menuMembers={coreVm.menuMembers}
      />

      <GroupDetailFlashAlerts
        queryError={sp?.error}
        settlementConfirmed={sp?.settled === "1"}
        expenseCreated={sp?.created === "1"}
      />

      <GroupDetailTabs
        dashboard={
          <GroupDetailDashboardPanel
            groupId={id}
            currentUserId={user.id}
            transferPreview={dashboardVm.transferPreview}
            nameByUserId={coreVm.nameByUserId}
            unpaidFeedItems={dashboardVm.unpaidFeedItems}
            membersForExpenseEdit={coreVm.membersForExpenseEdit}
          />
        }
        register={
          <GroupExpenseCreateSection
            groupId={id}
            currentUserId={user.id}
            membersForEdit={coreVm.membersForExpenseEdit}
            defaultExpenseDate={todayJstYmd()}
          />
        }
        history={
          <Suspense fallback={<GroupDetailHistoryPanelSkeleton />}>
            <GroupDetailHistoryPanelAsync
              groupId={id}
              members={members}
              membersForExpenseEdit={coreVm.membersForExpenseEdit}
              nameByUserId={coreVm.nameByUserId}
            />
          </Suspense>
        }
      />
    </div>
  );
}
