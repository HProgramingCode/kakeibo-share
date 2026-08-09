export type ExpenseSplitMode = "equal" | "exact";

export const EXPENSE_SPLIT_MODES: ExpenseSplitMode[] = ["equal", "exact"];

export function parseSplitMode(raw: string): ExpenseSplitMode | null {
  const v = raw.trim();
  if (v === "equal" || v === "exact") return v;
  return null;
}
