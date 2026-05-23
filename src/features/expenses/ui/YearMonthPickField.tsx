"use client";

import {
  buildMonthOptions,
  buildYearOptions,
  composeYm,
  resolveYmParts,
} from "@/features/expenses/lib/expense-date-pick";
import { useMemo, useState } from "react";

type Props = {
  name: string;
  defaultValue: string;
  required?: boolean;
  /** 基準年から ±span 年を選択肢に含める */
  yearSpan?: number;
};

export function YearMonthPickField({
  name,
  defaultValue,
  required = false,
  yearSpan = 3,
}: Props) {
  const anchorYear = useMemo(() => {
    const parsed = resolveYmParts(defaultValue, new Date().getFullYear());
    return parsed.year;
  }, [defaultValue]);

  const initial = useMemo(
    () => resolveYmParts(defaultValue, anchorYear),
    [defaultValue, anchorYear],
  );

  const [year, setYear] = useState(initial.year);
  const [month, setMonth] = useState(initial.month);

  const yearOptions = useMemo(
    () => buildYearOptions(anchorYear, yearSpan),
    [anchorYear, yearSpan],
  );
  const monthOptions = useMemo(() => buildMonthOptions(), []);
  const composed = composeYm(year, month);

  return (
    <div className="flex min-w-0 gap-2">
      <input type="hidden" name={name} value={composed} required={required} />
      <select
        className="input-field-select min-w-0 flex-1"
        value={String(year)}
        onChange={(e) => setYear(Number.parseInt(e.target.value, 10))}
        aria-label="年"
      >
        {yearOptions.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
      <select
        className="input-field-select min-w-0 flex-1"
        value={String(month)}
        onChange={(e) => setMonth(Number.parseInt(e.target.value, 10))}
        aria-label="月"
      >
        {monthOptions.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
    </div>
  );
}
