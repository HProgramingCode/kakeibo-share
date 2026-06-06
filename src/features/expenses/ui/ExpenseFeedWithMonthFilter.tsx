"use client";

import type { ExpenseFeedItemData } from "@/features/expenses/lib/expense-feed-item";
import { ExpenseFeed } from "@/features/expenses/ui/ExpenseFeed";
import type { MemberForExpenseEdit } from "@/features/expenses/lib/types/expense-member";
import { useMemo, useState } from "react";

type Props = {
  items: ExpenseFeedItemData[];
  groupId?: string;
  membersForEdit?: MemberForExpenseEdit[];
  /** 見出し直後に置く場合のラベル（任意） */
  filterLabel?: string;
};

export function ExpenseFeedWithMonthFilter({
  items,
  groupId,
  membersForEdit,
  filterLabel = "月で絞り込み",
}: Props) {
  const months = useMemo(() => {
    const set = new Set<string>();
    for (const e of items) {
      const ym = e.expense_date.slice(0, 7);
      if (/^\d{4}-\d{2}$/.test(ym)) set.add(ym);
    }
    return [...set].sort((a, b) => b.localeCompare(a, "en"));
  }, [items]);

  const [month, setMonth] = useState<string>("all");

  const filtered =
    month === "all" ? items : items.filter((e) => e.expense_date.slice(0, 7) === month);

  return (
    <div className="space-y-3">
      {months.length > 0 ? (
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-semibold text-slate-700">{filterLabel}</span>
          <select
            className="input-field"
            value={month}
            onChange={(ev) => setMonth(ev.target.value)}
            aria-label={filterLabel}
          >
            <option value="all">すべて</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <ExpenseFeed items={filtered} groupId={groupId} membersForEdit={membersForEdit} />
    </div>
  );
}
