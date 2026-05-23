"use client";

import {
  buildDayOptions,
  buildMonthOptions,
  buildYearOptions,
  clampDay,
  composeYmd,
  resolveYmdParts,
} from "@/features/expenses/lib/expense-date-pick";
import { useMemo, useState } from "react";

type Props = {
  name: string;
  defaultValue: string;
  required?: boolean;
  yearSpan?: number;
};

export function ExpenseDatePickField({
  name,
  defaultValue,
  required = false,
  yearSpan = 3,
}: Props) {
  const now = useMemo(() => new Date(), []);
  const fallbackYear = now.getFullYear();
  const fallbackMonth = now.getMonth() + 1;
  const fallbackDay = now.getDate();

  const initial = useMemo(
    () =>
      resolveYmdParts(
        defaultValue,
        fallbackYear,
        fallbackMonth,
        fallbackDay,
      ),
    [defaultValue, fallbackYear, fallbackMonth, fallbackDay],
  );

  const [year, setYear] = useState(initial.year);
  const [month, setMonth] = useState(initial.month);
  const [day, setDay] = useState(initial.day);

  const anchorYear = initial.year;
  const yearOptions = useMemo(
    () => buildYearOptions(anchorYear, yearSpan),
    [anchorYear, yearSpan],
  );
  const monthOptions = useMemo(() => buildMonthOptions(), []);
  const dayOptions = useMemo(
    () => buildDayOptions(year, month),
    [year, month],
  );

  const safeDay = clampDay(year, month, day);
  const composed = composeYmd(year, month, safeDay);

  function onYearChange(nextYear: number) {
    setYear(nextYear);
    setDay((d) => clampDay(nextYear, month, d));
  }

  function onMonthChange(nextMonth: number) {
    setMonth(nextMonth);
    setDay((d) => clampDay(year, nextMonth, d));
  }

  return (
    <div className="flex min-w-0 gap-2">
      <input type="hidden" name={name} value={composed} required={required} />
      <select
        className="input-field-select input-field-select-compact min-w-0 flex-1"
        value={String(year)}
        onChange={(e) => onYearChange(Number.parseInt(e.target.value, 10))}
        aria-label="年"
      >
        {yearOptions.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
      <select
        className="input-field-select input-field-select-compact min-w-0 flex-1"
        value={String(month)}
        onChange={(e) => onMonthChange(Number.parseInt(e.target.value, 10))}
        aria-label="月"
      >
        {monthOptions.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
      <select
        className="input-field-select input-field-select-compact min-w-0 flex-1"
        value={String(safeDay)}
        onChange={(e) => setDay(Number.parseInt(e.target.value, 10))}
        aria-label="日"
      >
        {dayOptions.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>
    </div>
  );
}
