"use client";

import { cn } from "@/lib/utils";

export type HistoryStatusView = "settled" | "unpaid";

type Props = {
  value: HistoryStatusView;
  onChange: (value: HistoryStatusView) => void;
  settledCount: number;
  unpaidCount: number;
};

export function HistoryStatusToggle({
  value,
  onChange,
  settledCount,
  unpaidCount,
}: Props) {
  return (
    <div
      className="flex rounded-[20px] border border-slate-100 bg-slate-50/80 p-1 shadow-inner"
      role="tablist"
      aria-label="支出の精算状態"
    >
      <StatusButton
        selected={value === "unpaid"}
        onClick={() => onChange("unpaid")}
        label="未精算"
        count={unpaidCount}
      />
      <StatusButton
        selected={value === "settled"}
        onClick={() => onChange("settled")}
        label="精算済み"
        count={settledCount}
      />
    </div>
  );
}

function StatusButton({
  selected,
  onClick,
  label,
  count,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={onClick}
      className={cn(
        "flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-2xl px-3 py-2 text-sm font-bold transition-all duration-200",
        selected
          ? "bg-white text-indigo-600 shadow-md"
          : "text-slate-500 hover:bg-white/60 hover:text-slate-700",
      )}
    >
      <span>{label}</span>
      <span
        className={cn(
          "rounded-full px-2 py-0.5 text-[11px] font-black tabular-nums",
          selected ? "bg-indigo-100 text-indigo-700" : "bg-slate-200/80 text-slate-600",
        )}
      >
        {count}
      </span>
    </button>
  );
}
