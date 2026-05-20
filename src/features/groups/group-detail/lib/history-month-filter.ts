const YM_RE = /^[0-9]{4}-[0-9]{2}$/;

export function expenseYearMonth(expenseDate: string): string | null {
  const ym = expenseDate.slice(0, 7);
  return YM_RE.test(ym) ? ym : null;
}

export function buildHistoryMonthOptions(
  settledItems: { expense_date: string }[],
  unpaidItems: { expense_date: string }[],
  batches: { target_month: string }[],
  currentMonth: string,
): string[] {
  const set = new Set<string>();
  if (YM_RE.test(currentMonth)) {
    set.add(currentMonth);
  }
  for (const e of settledItems) {
    const ym = expenseYearMonth(e.expense_date);
    if (ym) set.add(ym);
  }
  for (const e of unpaidItems) {
    const ym = expenseYearMonth(e.expense_date);
    if (ym) set.add(ym);
  }
  for (const b of batches) {
    if (YM_RE.test(b.target_month)) set.add(b.target_month);
  }
  return [...set].sort((a, b) => b.localeCompare(a, "en"));
}

export function filterExpensesByMonth<T extends { expense_date: string }>(
  items: T[],
  month: string,
): T[] {
  return items.filter((e) => expenseYearMonth(e.expense_date) === month);
}

/** @deprecated Use filterExpensesByMonth */
export const filterSettledByMonth = filterExpensesByMonth;

export function filterBatchesByMonth<T extends { target_month: string }>(
  batches: T[],
  month: string,
): T[] {
  return batches.filter((b) => b.target_month === month);
}
