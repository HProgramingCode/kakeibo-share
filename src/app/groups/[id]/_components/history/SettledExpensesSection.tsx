"use client";

import type { ExpenseFeedItemData } from "@/features/expenses/feed/model/expense-feed-item";
import { ExpenseFeed } from "@/features/expenses/feed/components/ExpenseFeed";
import { EmptyState } from "@/shared/components/EmptyState";
import { History } from "lucide-react";

type Props = {
  items: ExpenseFeedItemData[];
  selectedMonth: string;
};

export function SettledExpensesSection({ items, selectedMonth }: Props) {
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
          title={`${selectedMonth} の精算済み支出はありません`}
        />
      ) : (
        <ExpenseFeed items={items} />
      )}
    </section>
  );
}
