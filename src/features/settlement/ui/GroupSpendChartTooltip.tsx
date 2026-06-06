"use client";

import { formatYen } from "@/lib/format-yen";

type ChartTooltipPayload = {
  dataKey?: string | number;
  value?: unknown;
};

type Props = {
  active?: boolean;
  payload?: ChartTooltipPayload[];
  label?: string;
};

export function GroupSpendChartTooltip({ active, payload, label }: Props) {
  if (!active || !payload?.length) return null;
  const monthly = payload.find((p) => p.dataKey === "monthlyTotal")?.value;
  const cumulativeAvg = payload.find(
    (p) => p.dataKey === "cumulativeMonthlyAverage",
  )?.value;
  return (
    <div className="rounded-xl border border-slate-100 bg-white/95 px-3 py-2 text-xs shadow-lg backdrop-blur-sm">
      <p className="mb-1 font-semibold text-slate-700">{label}</p>
      {typeof monthly === "number" ? (
        <p className="text-slate-600">
          <span className="text-slate-500">その月の合計（グループ）: </span>
          <span className="font-mono tabular-nums">{formatYen(monthly)}</span>
        </p>
      ) : null}
      {typeof cumulativeAvg === "number" ? (
        <p className="text-slate-600">
          <span className="text-slate-500">開始月〜の平均月額（累進）: </span>
          <span className="font-mono tabular-nums">
            {formatYen(cumulativeAvg)}
          </span>
        </p>
      ) : null}
    </div>
  );
}
