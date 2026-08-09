import { requireAuthContext } from "@/features/auth/server/require-auth-context";
import * as groupDetailRepository from "@/features/groups/repositories/group-detail-repository";
import { GroupsDestructiveAlert } from "@/features/groups/components/GroupsDestructiveAlert";
import {
  buildGroupDetailHistoryViewModel,
  currentMonthJstYm,
} from "../../_lib/mapper";
import type { ExpenseRow, MemberRow } from "../../_lib/types";
import { GroupDetailHistoryPanel } from "./GroupDetailHistoryPanel";

type Props = {
  groupId: string;
  members: MemberRow[];
  membersForExpenseEdit: { user_id: string; label: string }[];
  nameByUserId: Record<string, string>;
};

export async function GroupDetailHistoryPanelAsync({
  groupId,
  members,
  membersForExpenseEdit,
  nameByUserId,
}: Props) {
  const { supabase } = await requireAuthContext();

  const [expensesRes, batchesRes] = await Promise.all([
    groupDetailRepository.selectExpensesForGroup(supabase, groupId),
    groupDetailRepository.selectSettlementBatchesForGroup(supabase, groupId),
  ]);

  if (expensesRes.error) {
    return (
      <GroupsDestructiveAlert>
        支出の読み込みに失敗しました: {expensesRes.error.message}
      </GroupsDestructiveAlert>
    );
  }

  if (batchesRes.error) {
    return (
      <GroupsDestructiveAlert>
        精算履歴の読み込みに失敗しました: {batchesRes.error.message}
      </GroupsDestructiveAlert>
    );
  }

  const historyVm = buildGroupDetailHistoryViewModel(
    members,
    (expensesRes.data ?? []) as unknown as ExpenseRow[],
  );

  return (
    <GroupDetailHistoryPanel
      groupId={groupId}
      settledFeedItems={historyVm.settledFeedItems}
      unpaidFeedItems={historyVm.unpaidFeedItems}
      membersForExpenseEdit={membersForExpenseEdit}
      batches={batchesRes.data ?? []}
      nameByUserId={nameByUserId}
      initialMonth={currentMonthJstYm()}
    />
  );
}
