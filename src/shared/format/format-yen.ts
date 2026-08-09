export function formatYen(n: number): string {
  const sign = n < 0 ? "−" : "";
  return `${sign}¥${Math.abs(n).toLocaleString("ja-JP")}`;
}
