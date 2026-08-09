const YM_RE = /^[0-9]{4}-[0-9]{2}$/;

export function expenseYearMonth(expenseDate: string): string | null {
  const ym = expenseDate.slice(0, 7);
  return YM_RE.test(ym) ? ym : null;
}

export function batchYearMonth(batch: {
  target_month: string | null;
  period_ended_at?: string | null;
  created_at?: string;
}): string | null {
  if (batch.target_month && YM_RE.test(batch.target_month)) return batch.target_month;
  return expenseYearMonth(batch.period_ended_at ?? batch.created_at ?? "");
}

export function buildHistoryMonthOptions(
  settledItems: { expense_date: string }[],
  unpaidItems: { expense_date: string }[],
  batches: { target_month: string | null; period_ended_at?: string | null; created_at?: string }[],
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
    const ym = batchYearMonth(b);
    if (ym) set.add(ym);
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

export function filterBatchesByMonth<
  T extends { target_month: string | null; period_ended_at?: string | null; created_at?: string },
>(
  batches: T[],
  month: string,
): T[] {
  return batches.filter((b) => batchYearMonth(b) === month);
}
