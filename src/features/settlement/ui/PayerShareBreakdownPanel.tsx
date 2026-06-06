"use client";

import { formatYen } from "@/lib/format-yen";
import { formatYmJapanese } from "@/features/settlement/lib/format-ym-japanese";

type PayerLine = {
  userId: string;
  amount: number;
  label: string;
};

type Props = {
  selectedMonth: string;
  sortedPayerLines: PayerLine[];
};

export function PayerShareBreakdownPanel({
  selectedMonth,
  sortedPayerLines,
}: Props) {
  return (
    <div
      className="mt-6 space-y-3 border-t border-slate-100 pt-6"
      aria-live="polite"
    >
      <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
        {formatYmJapanese(selectedMonth)}の自分の分担（均等割）
      </h3>
      <p className="text-xs text-slate-500">
        参加者で割ったときの自分あたりの金額（1円未満は支払者負担）。
      </p>
      {sortedPayerLines.length === 0 ? (
        <p className="text-sm text-slate-500">
          この月に該当する支出はありません。
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {sortedPayerLines.map((row) => (
            <li
              key={row.userId}
              className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3 text-sm"
            >
              <span className="min-w-0 truncate font-medium text-slate-800">
                {row.label}
              </span>
              <span className="shrink-0 font-mono text-sm font-semibold tabular-nums text-slate-900">
                {formatYen(row.amount)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
