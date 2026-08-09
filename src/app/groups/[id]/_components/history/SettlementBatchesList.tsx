"use client";

import type { ExpenseFeedItemData } from "@/features/expenses/feed/model/expense-feed-item";
import { ExpenseFeed } from "@/features/expenses/feed/components/ExpenseFeed";
import type { BatchRow } from "../../_lib/types";
import { formatYen } from "@/shared/format/format-yen";
import { ChevronDown } from "lucide-react";

type Props = {
  batches: BatchRow[];
  settledFeedItems: ExpenseFeedItemData[];
  nameByUserId: Record<string, string>;
};

function periodLabel(batch: BatchRow): string {
  if (batch.period_started_at && batch.period_ended_at) {
    const start = new Date(batch.period_started_at).toLocaleDateString("ja-JP");
    const end = new Date(batch.period_ended_at).toLocaleDateString("ja-JP");
    return `${start} 〜 ${end}`;
  }
  return batch.target_month ?? "過去の精算";
}

export function SettlementBatchesList({
  batches,
  settledFeedItems,
  nameByUserId,
}: Props) {
  const expensesByBatchId = new Map<string, ExpenseFeedItemData[]>();
  for (const expense of settledFeedItems) {
    if (!expense.settlementBatchId) continue;
    const items = expensesByBatchId.get(expense.settlementBatchId) ?? [];
    items.push(expense);
    expensesByBatchId.set(expense.settlementBatchId, items);
  }

  return (
    <ul className="flex flex-col gap-3">
      {batches.map((b) => {
        const transfers = b.settlement_transfers ?? [];
        const expenses = expensesByBatchId.get(b.id) ?? [];
        return (
          <li key={b.id}>
            <details className="group card-glass overflow-hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 marker:content-none focus-visible:outline focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-400">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">{periodLabel(b)}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {new Date(b.created_at).toLocaleString("ja-JP")} · 送金 {transfers.length} 件 · 支出 {expenses.length} 件
                  </p>
                </div>
                <ChevronDown
                  className="h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-180"
                  aria-hidden
                />
              </summary>

              <div className="border-t border-slate-100 bg-slate-50/60 p-5">
                <section aria-label="確定した送金額">
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                    確定した送金
                  </h3>
                  {transfers.length === 0 ? (
                    <p className="mt-3 text-sm text-slate-500">送金は不要でした</p>
                  ) : (
                    <ul className="mt-3 space-y-2 text-sm text-slate-600">
                      {transfers.map((t, i) => (
                        <li key={i} className="font-medium">
                          {nameByUserId[t.from_user_id] ?? t.from_user_id}{" "}
                          <span className="text-slate-400">→</span>{" "}
                          {nameByUserId[t.to_user_id] ?? t.to_user_id}{" "}
                          <span className="font-mono font-black tracking-tighter text-slate-900">
                            {formatYen(t.amount)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <section className="mt-6" aria-label="対象支出">
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                    対象支出
                  </h3>
                  {expenses.length === 0 ? (
                    <p className="mt-3 text-sm text-slate-500">
                      この履歴に紐づく支出はありません。
                    </p>
                  ) : (
                    <div className="mt-3">
                      <ExpenseFeed items={expenses} />
                    </div>
                  )}
                </section>
              </div>
            </details>
          </li>
        );
      })}
    </ul>
  );
}
