import type { ExpenseFeedItemData } from "@/features/expenses/lib/expense-feed-item";
import type { TransferPreview } from "@/features/settlement/lib/settlement-transfers-preview";
import { BalanceHero } from "@/features/settlement/ui/BalanceHero";
import { DashboardUnpaidExpensesSection } from "./DashboardUnpaidExpensesSection";
import { ExpenseEntryShortcutGrid } from "./ExpenseEntryShortcutGrid";
import { MonthlySettlementConfirmSection } from "./MonthlySettlementConfirmSection";

type Props = {
  groupId: string;
  currentUserId: string;
  transferPreview: TransferPreview[];
  nameByUserId: Map<string, string>;
  unpaidFeedItems: ExpenseFeedItemData[];
  membersForExpenseEdit: { user_id: string; label: string }[];
  defaultSettlementMonth: string;
};

export function GroupDetailDashboardPanel({
  groupId,
  currentUserId,
  transferPreview,
  nameByUserId,
  unpaidFeedItems,
  membersForExpenseEdit,
  defaultSettlementMonth,
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
        defaultTargetMonth={defaultSettlementMonth}
      />

      <DashboardUnpaidExpensesSection
        groupId={groupId}
        items={unpaidFeedItems}
        membersForEdit={membersForExpenseEdit}
      />
    </div>
  );
}
