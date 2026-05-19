"use client";

import { formatYen } from "@/lib/format-yen";
import type {
  GroupSpendChartPoint,
  PayerTotalsByMonth,
} from "@/features/settlement/lib/monthly-spend-series";
import { EmptyState } from "@/features/shared/ui/EmptyState";
import { BarChart3 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { BarRectangleItem } from "recharts";
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type { GroupSpendChartPoint };

type Props = {
  data: GroupSpendChartPoint[];
  /** false のときカード内の見出しを省略（専用ページなどでページタイトルと重なる場合） */
  showCardHeading?: boolean;
  /** 指定時、月選択後にユーザー別の当月負担合計を表示できる */
  payerTotalsByMonth?: PayerTotalsByMonth;
  nameByUserId?: Record<string, string>;
};

function formatYmJapanese(ym: string): string {
  const parts = ym.split("-");
  if (parts.length < 2) return ym;
  return `${parts[0]}年${Number(parts[1])}月`;
}

type ChartTooltipPayload = {
  dataKey?: string | number;
  value?: unknown;
};

type ChartTooltipOwnProps = {
  active?: boolean;
  payload?: ChartTooltipPayload[];
  label?: string;
};

function ChartTooltip({ active, payload, label }: ChartTooltipOwnProps) {
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

export function GroupSpendCharts({
  data,
  showCardHeading = true,
  payerTotalsByMonth,
  nameByUserId,
}: Props) {
  const [selectedMonth, setSelectedMonth] = useState<string>(
    () => data[data.length - 1]?.month ?? "",
  );

  useEffect(() => {
    const latest = data[data.length - 1]?.month;
    if (!latest) return;
    if (!data.some((d) => d.month === selectedMonth)) {
      setSelectedMonth(latest);
    }
  }, [data, selectedMonth]);

  const chartRows = useMemo(
    () =>
      data.map((d) => ({
        ...d,
        axisLabel: d.month.replace("-", "/"),
      })),
    [data],
  );

  const payerBreakdown = Boolean(payerTotalsByMonth && nameByUserId);
  const sortedPayerLines = useMemo(() => {
    if (!selectedMonth || !payerTotalsByMonth) return [];
    const bucket = payerTotalsByMonth[selectedMonth] ?? {};
    return Object.entries(bucket)
      .map(([userId, amount]) => ({
        userId,
        amount,
        label:
          nameByUserId?.[userId]?.trim() || `（不明: ${userId.slice(0, 8)}…）`,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [payerTotalsByMonth, selectedMonth, nameByUserId]);

  if (data.length === 0) {
    return (
      <section className="card-glass p-6">
        <EmptyState
          icon={
            <BarChart3
              className="h-6 w-6 text-slate-300"
              strokeWidth={1.5}
              aria-hidden
            />
          }
          title="まだ支出がありません"
          description="支出を登録すると月ごとの合計と推移が表示されます"
        />
      </section>
    );
  }

  const tooltipContent = (tooltipProps: unknown) => (
    <ChartTooltip {...(tooltipProps as ChartTooltipOwnProps)} />
  );

  return (
    <section className="card-glass p-6">
      {showCardHeading ? (
        <div className="mb-5 space-y-1">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            支出の推移
          </h2>
          <p className="text-sm text-slate-500">
            暦月ごとの合計と開始月からの平均月額
          </p>
        </div>
      ) : null}
      <div className="h-[280px] w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartRows}
            margin={{ top: 8, right: 8, left: -8, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgb(241 245 249)"
              vertical={false}
            />
            <XAxis
              dataKey="axisLabel"
              tick={{ fill: "rgb(100 116 139)", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "rgb(226 232 240)" }}
            />
            <YAxis
              tick={{ fill: "rgb(100 116 139)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => formatYen(v)}
              width={68}
            />
            <Tooltip content={tooltipContent} />
            <Bar
              dataKey="monthlyTotal"
              name="月別"
              fill="rgb(99 102 241)"
              fillOpacity={0.85}
              radius={[6, 6, 2, 2]}
              maxBarSize={40}
              cursor="pointer"
              onClick={(shape: BarRectangleItem) => {
                const ym = shape?.payload?.month;
                if (typeof ym === "string") setSelectedMonth(ym);
              }}
            >
              {chartRows.map((entry) => (
                <Cell
                  key={entry.month}
                  fill={
                    entry.month === selectedMonth
                      ? "rgb(55 48 163)"
                      : "rgb(99 102 241)"
                  }
                />
              ))}
            </Bar>
            <Line
              type="monotone"
              dataKey="cumulativeMonthlyAverage"
              name="開始〜の平均月額（累進）"
              stroke="rgb(71 85 105)"
              strokeWidth={2}
              dot={{ r: 3, fill: "rgb(71 85 105)" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 space-y-2 border-t border-slate-50 pt-4 text-[11px] leading-relaxed text-slate-500">
        <p className="font-semibold uppercase tracking-wider text-slate-400">
          グラフの見方
        </p>
        <ul className="list-inside list-disc space-y-1 pl-0.5">
          <li>棒は、その暦月のグループ支出の合計です。</li>
          <li>
            線は、その月までの平均月額（先頭の月から当該月までを月数で割った値）です。棒と同じ「いくら／月」で並べ読みできます。
          </li>
          {payerBreakdown ? (
            <li>
              棒をタップすると色が変わり、その月を選べます。下に参加者ごとの自分の分担（均等割・端数は支払者負担）が出ます。
            </li>
          ) : (
            <li>棒をタップすると、選択した暦月が色で強調されます。</li>
          )}
        </ul>
      </div>

      {payerBreakdown ? (
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
      ) : null}
    </section>
  );
}
