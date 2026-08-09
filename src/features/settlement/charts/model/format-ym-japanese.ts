/** 暦月ラベル（YYYY-MM → YYYY年M月） */
export function formatYmJapanese(ym: string): string {
  const parts = ym.split("-");
  if (parts.length < 2) return ym;
  return `${parts[0]}年${Number(parts[1])}月`;
}
