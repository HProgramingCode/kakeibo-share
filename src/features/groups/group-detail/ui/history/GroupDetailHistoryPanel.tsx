import type { ExpenseFeedItemData } from "@/features/expenses/lib/expense-feed-item";
import type { BatchRow } from "@/features/groups/lib/types/group-detail-screen.types";
import { SettlementBatchesList } from "@/features/groups/components/SettlementBatchesList";
import { SettledExpensesSection } from "@/features/groups/components/SettledExpensesSection";
import { EmptyState } from "@/shared/ui/EmptyState";
import { History } from "lucide-react";

type Props = {
  settledFeedItems: ExpenseFeedItemData[];
  batches: BatchRow[];
  nameByUserId: Map<string, string>;
};

export function GroupDetailHistoryPanel({
  settledFeedItems,
  batches,
  nameByUserId,
}: Props) {
  return (
    <div className="flex flex-col gap-8">
      <SettledExpensesSection items={settledFeedItems} />

      <section className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          精算履歴
        </h2>
        {batches.length === 0 ? (
          <EmptyState
            icon={
              <History className="h-6 w-6 text-slate-300" strokeWidth={1.5} aria-hidden />
            }
            title="精算履歴はまだありません"
          />
        ) : (
          <SettlementBatchesList batches={batches} nameByUserId={nameByUserId} />
        )}
      </section>
    </div>
  );
}
