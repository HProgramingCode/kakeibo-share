import type { ExpenseFeedItemData } from "@/features/expenses/feed/model/expense-feed-item";
import type { TransferPreview } from "@/features/settlement/balance/model/settlement-transfers-preview";
import { BalanceHero } from "@/features/settlement/balance/components/BalanceHero";
import { DashboardUnpaidExpensesSection } from "./DashboardUnpaidExpensesSection";
import { ExpenseEntryShortcutGrid } from "./ExpenseEntryShortcutGrid";
import { MonthlySettlementConfirmSection } from "./MonthlySettlementConfirmSection";

type Props = {
  groupId: string;
  currentUserId: string;
  transferPreview: TransferPreview[];
  nameByUserId: Record<string, string>;
  unpaidFeedItems: ExpenseFeedItemData[];
  membersForExpenseEdit: { user_id: string; label: string }[];
};

export function GroupDetailDashboardPanel({
  groupId,
  currentUserId,
  transferPreview,
  nameByUserId,
  unpaidFeedItems,
  membersForExpenseEdit,
}: Props) {
  return (
    <div className="flex flex-col gap-8">
      <BalanceHero
        currentUserId={currentUserId}
        transfers={transferPreview}
        nameByUserId={nameByUserId}
      />

      <ExpenseEntryShortcutGrid />

      <MonthlySettlementConfirmSection
        groupId={groupId}
      />

      <DashboardUnpaidExpensesSection
        groupId={groupId}
        items={unpaidFeedItems}
        membersForEdit={membersForExpenseEdit}
      />
    </div>
  );
}
