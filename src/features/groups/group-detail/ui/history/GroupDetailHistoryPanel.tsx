import type { ExpenseFeedItemData } from "@/features/expenses/lib/expense-feed-item";
import type { BatchRow } from "@/features/groups/group-detail/lib/types";
import { GroupDetailHistoryPanelClient } from "./GroupDetailHistoryPanelClient";

type Props = {
  groupId: string;
  settledFeedItems: ExpenseFeedItemData[];
  unpaidFeedItems: ExpenseFeedItemData[];
  membersForExpenseEdit: { user_id: string; label: string }[];
  batches: BatchRow[];
  nameByUserId: Record<string, string>;
  initialMonth: string;
};

export function GroupDetailHistoryPanel({
  groupId,
  settledFeedItems,
  unpaidFeedItems,
  membersForExpenseEdit,
  batches,
  nameByUserId,
  initialMonth,
}: Props) {
  return (
    <GroupDetailHistoryPanelClient
      groupId={groupId}
      settledFeedItems={settledFeedItems}
      unpaidFeedItems={unpaidFeedItems}
      membersForExpenseEdit={membersForExpenseEdit}
      batches={batches}
      nameByUserId={nameByUserId}
      initialMonth={initialMonth}
    />
  );
}
