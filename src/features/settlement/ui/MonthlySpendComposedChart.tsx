"use client";

import { formatYen } from "@/lib/format-yen";
import type { GroupSpendChartPoint } from "@/features/settlement/lib/monthly-spend-series";
import { GroupSpendChartTooltip } from "@/features/settlement/ui/GroupSpendChartTooltip";
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

type ChartRow = GroupSpendChartPoint & { axisLabel: string };

type Props = {
  chartRows: ChartRow[];
  selectedMonth: string;
  onSelectMonth: (month: string) => void;
};

export function MonthlySpendComposedChart({
  chartRows,
  selectedMonth,
  onSelectMonth,
}: Props) {
  const tooltipContent = (tooltipProps: unknown) => (
    <GroupSpendChartTooltip
      {...(tooltipProps as React.ComponentProps<typeof GroupSpendChartTooltip>)}
    />
  );

  return (
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
              if (typeof ym === "string") onSelectMonth(ym);
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
  );
}
