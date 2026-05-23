import { requireAuthContext } from "@/features/auth/lib/require-auth-context";
import {
  buildGroupDetailHistoryViewModel,
  currentMonthJstYm,
} from "@/features/groups/group-detail/lib/view-model";
import { loadGroupDetailHistoryData } from "@/features/groups/group-detail/lib/service";
import type { MemberRow } from "@/features/groups/group-detail/lib/types";
import { GroupsDestructiveAlert } from "@/features/groups/shared/GroupsDestructiveAlert";
import { GroupDetailHistoryPanel } from "./GroupDetailHistoryPanel";

type Props = {
  groupId: string;
  userId: string;
  members: MemberRow[];
  membersForExpenseEdit: { user_id: string; label: string }[];
  nameByUserId: Record<string, string>;
};

export async function GroupDetailHistoryPanelAsync({
  groupId,
  userId,
  members,
  membersForExpenseEdit,
  nameByUserId,
}: Props) {
  const { supabase } = await requireAuthContext();

  const loadResult = await loadGroupDetailHistoryData(supabase, {
    groupId,
    userId,
  });

  if (loadResult.kind === "not_found") {
    return (
      <GroupsDestructiveAlert>
        このグループの履歴を表示する権限がありません。
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

  const historyVm = buildGroupDetailHistoryViewModel(
    members,
    loadResult.expenses,
  );

  return (
    <GroupDetailHistoryPanel
      groupId={groupId}
      settledFeedItems={historyVm.settledFeedItems}
      unpaidFeedItems={historyVm.unpaidFeedItems}
      membersForExpenseEdit={membersForExpenseEdit}
      batches={loadResult.batches}
      nameByUserId={nameByUserId}
      initialMonth={currentMonthJstYm()}
    />
  );
}
