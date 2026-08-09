/** 支出日を日本語短形式に変換 */
export function formatExpenseDate(isoDate: string): string {
  const d = new Date(isoDate + (isoDate.length <= 10 ? "T12:00:00" : ""));
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("ja-JP", { month: "short", day: "numeric" });
}
