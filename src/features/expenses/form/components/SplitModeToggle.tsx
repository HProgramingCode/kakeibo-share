"use client";

import type { ExpenseSplitMode } from "@/features/expenses/form/model/split-mode";
import { cn } from "@/shared/utils/utils";

type Props = {
  value: ExpenseSplitMode;
  onValueChange: (mode: ExpenseSplitMode) => void;
  name?: string;
};

const OPTIONS: { value: ExpenseSplitMode; label: string }[] = [
  { value: "equal", label: "均等割" },
  { value: "exact", label: "金額指定" },
];

/**
 * 立替者の下に置く分割方式トグル（均等割 / 金額指定）。
 */
export function SplitModeToggle({
  value,
  onValueChange,
  name = "split_mode",
}: Props) {
  return (
    <fieldset className="min-w-0 space-y-2">
      <legend className="px-0.5 text-sm font-semibold text-slate-700">
        分割方式
      </legend>
      <input type="hidden" name={name} value={value} />
      <div
        role="tablist"
        aria-label="分割方式"
        className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-100 bg-slate-50/80 p-1"
      >
        {OPTIONS.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="tab"
              aria-selected={selected}
              className={cn(
                "min-h-[44px] rounded-xl px-3 text-sm font-semibold transition-all duration-200 focus-visible:outline focus-visible:ring-2 focus-visible:ring-indigo-400/55 focus-visible:ring-offset-2",
                selected
                  ? "bg-white text-indigo-700 shadow-card"
                  : "text-slate-600 hover:bg-white/60 hover:text-slate-800",
              )}
              onClick={() => onValueChange(opt.value)}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
