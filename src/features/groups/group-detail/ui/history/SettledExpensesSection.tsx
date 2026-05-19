import type { ExpenseFeedItemData } from "@/features/expenses/lib/expense-feed-item";
import { ExpenseFeedWithMonthFilter } from "@/features/expenses/ui/ExpenseFeedWithMonthFilter";
import { EmptyState } from "@/features/shared/ui/EmptyState";
import { History } from "lucide-react";

type Props = {
  items: ExpenseFeedItemData[];
};

export function SettledExpensesSection({ items }: Props) {
  return (
    <section id="settled-expenses" className="scroll-mt-36 space-y-4">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
        精算済みの支出
      </h2>
      {items.length === 0 ? (
        <EmptyState
          icon={
            <History className="h-6 w-6 text-slate-300" strokeWidth={1.5} aria-hidden />
          }
          title="精算済みの支出はまだありません"
        />
      ) : (
        <ExpenseFeedWithMonthFilter items={items} />
      )}
    </section>
  );
}
