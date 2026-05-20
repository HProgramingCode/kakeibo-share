"use client";

import type { ExpenseFeedItemData } from "@/features/expenses/lib/expense-feed-item";
import { ExpenseFeed } from "@/features/expenses/ui/ExpenseFeed";
import { EmptyState } from "@/features/shared/ui/EmptyState";
import { Landmark } from "lucide-react";

type Props = {
  groupId: string;
  items: ExpenseFeedItemData[];
  membersForEdit: { user_id: string; label: string }[];
  selectedMonth: string;
};

export function UnpaidExpensesSection({
  groupId,
  items,
  membersForEdit,
  selectedMonth,
}: Props) {
  return (
    <section id="history-unpaid-expenses" className="scroll-mt-36 space-y-4">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
        未精算の支出
      </h2>
      {items.length === 0 ? (
        <EmptyState
          icon={
            <Landmark className="h-6 w-6 text-slate-300" strokeWidth={1.5} aria-hidden />
          }
          title={`${selectedMonth} の未精算支出はありません`}
        />
      ) : (
        <ExpenseFeed
          items={items}
          groupId={groupId}
          membersForEdit={membersForEdit}
        />
      )}
    </section>
  );
}
