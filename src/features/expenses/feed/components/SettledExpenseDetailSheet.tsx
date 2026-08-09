"use client";

import type { ExpenseFeedItemData } from "@/features/expenses/feed/model/expense-feed-item";
import { formatExpenseDate } from "@/features/expenses/feed/model/format-expense-date";
import { computeExpenseShares } from "@/features/settlement/balance/model/dashboard-balances";
import { formatYen } from "@/shared/format/format-yen";
import { BottomSheetDialog } from "@/shared/components/BottomSheetDialog";
import { CheckCircle2 } from "lucide-react";
import { useId } from "react";

type Props = { item: ExpenseFeedItemData; onClose: () => void };

export function SettledExpenseDetailSheet({ item, onClose }: Props) {
  const titleId = useId();
  const participantIds = item.participantIds ?? [];
  const shares = computeExpenseShares({
    amount: item.amount,
    payerId: item.payerId ?? "",
    participantIds,
    splitMode: item.splitMode ?? "equal",
    shareAmounts: item.participantShares,
  });

  return (
    <BottomSheetDialog open onClose={onClose} titleId={titleId} title="支出の詳細" scrollable>
      <div className="space-y-6">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-emerald-900">
          <div className="flex items-center gap-2 text-sm font-bold"><CheckCircle2 className="h-4 w-4" aria-hidden />精算確定済み・編集不可</div>
        </div>
        <section className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold text-slate-500">{formatExpenseDate(item.expense_date)}{item.category ? ` · ${item.category}` : ""}</p>
          <h3 className="mt-1 text-lg font-black text-slate-900">{item.title?.trim() || "（摘要なし）"}</h3>
          <p className="mt-2 font-mono text-2xl font-black text-slate-950">{formatYen(item.amount)}</p>
        </section>
        <section>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">立替と分け方</h3>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm"><div className="rounded-xl border border-slate-100 p-3"><dt className="text-slate-400">立替者</dt><dd className="mt-1 font-bold text-slate-900">{item.payerLabel}</dd></div><div className="rounded-xl border border-slate-100 p-3"><dt className="text-slate-400">分け方</dt><dd className="mt-1 font-bold text-slate-900">{item.splitMode === "exact" ? "金額指定" : "均等割"}</dd></div></dl>
        </section>
        <section>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">負担額と支払先</h3>
          <ul className="mt-3 divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-white px-4">
            {participantIds.map((userId) => { const share = shares.get(userId) ?? 0; const isPayer = userId === item.payerId; return <li key={userId} className="flex items-center justify-between gap-3 py-3 text-sm"><div><p className="font-bold text-slate-800">{item.participantLabels?.[userId] ?? userId}</p><p className="text-xs text-slate-400">{isPayer ? "立替者の負担分" : `${item.payerLabel} へ支払い`}</p></div><span className="font-mono font-black text-slate-950">{formatYen(share)}</span></li>; })}
          </ul>
        </section>
      </div>
    </BottomSheetDialog>
  );
}
