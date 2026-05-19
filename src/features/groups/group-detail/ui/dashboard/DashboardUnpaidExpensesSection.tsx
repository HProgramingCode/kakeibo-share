import type { ExpenseFeedItemData } from "@/features/expenses/lib/expense-feed-item";
import { ExpenseFeed } from "@/features/expenses/ui/ExpenseFeed";
import { EmptyState } from "@/features/shared/ui/EmptyState";
import { Landmark } from "lucide-react";

type Props = {
  groupId: string;
  items: ExpenseFeedItemData[];
  membersForEdit: { user_id: string; label: string }[];
};

export function DashboardUnpaidExpensesSection({
  groupId,
  items,
  membersForEdit,
}: Props) {
  return (
    <section id="recent-expenses" className="scroll-mt-36 space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-base font-black text-slate-900">最近の支出一覧</h2>
        <a
          href="#settled-expenses"
          className="text-[11px] font-black uppercase tracking-widest text-indigo-600 opacity-80 transition-opacity hover:opacity-100"
        >
          View All
        </a>
      </div>
      {items.length === 0 ? (
        <EmptyState
          icon={
            <Landmark className="h-6 w-6 text-slate-300" strokeWidth={1.5} aria-hidden />
          }
          title="未精算の支出はありません"
          description="清潔な状態からはじめられます"
        />
      ) : (
        <ExpenseFeed
          items={items.slice(0, 3)}
          groupId={groupId}
          membersForEdit={membersForEdit}
        />
      )}
    </section>
  );
}
