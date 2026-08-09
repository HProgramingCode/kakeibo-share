"use client";

import type { GroupSpendChartPoint } from "@/features/settlement/charts/model/monthly-spend-series";
import type { PayerTotalsByMonth } from "@/features/settlement/charts/model/monthly-spend-series";
import { useSelectedChartMonth } from "@/features/settlement/charts/hooks/use-selected-chart-month";
import { GroupSpendChartLegend } from "@/features/settlement/charts/components/GroupSpendChartLegend";
import { MonthlySpendComposedChart } from "@/features/settlement/charts/components/MonthlySpendComposedChart";
import { PayerShareBreakdownPanel } from "@/features/settlement/charts/components/PayerShareBreakdownPanel";
import { EmptyState } from "@/shared/components/EmptyState";
import { BarChart3 } from "lucide-react";
import { useMemo } from "react";

export type { GroupSpendChartPoint };

type Props = {
  data: GroupSpendChartPoint[];
  /** false のときカード内の見出しを省略（専用ページなどでページタイトルと重なる場合） */
  showCardHeading?: boolean;
  /** 指定時、月選択後にユーザー別の当月負担合計を表示できる */
  payerTotalsByMonth?: PayerTotalsByMonth;
  nameByUserId?: Record<string, string>;
};

export function GroupSpendCharts({
  data,
  showCardHeading = true,
  payerTotalsByMonth,
  nameByUserId,
}: Props) {
  const months = useMemo(() => data.map((d) => d.month), [data]);
  const { selectedMonth, setSelectedMonth } = useSelectedChartMonth(months);

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
      <MonthlySpendComposedChart
        chartRows={chartRows}
        selectedMonth={selectedMonth}
        onSelectMonth={setSelectedMonth}
      />
      <GroupSpendChartLegend showPayerHint={payerBreakdown} />
      {payerBreakdown ? (
        <PayerShareBreakdownPanel
          selectedMonth={selectedMonth}
          sortedPayerLines={sortedPayerLines}
        />
      ) : null}
    </section>
  );
}
