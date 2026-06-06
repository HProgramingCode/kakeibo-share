/** 金額入力フィールドの値を number | "" に正規化 */
export function parseShareAmountInput(
  raw: number | "" | undefined,
): number | null {
  if (typeof raw === "number") return raw;
  if (raw === "") return null;
  const v = Number.parseInt(String(raw), 10);
  return Number.isFinite(v) && v > 0 ? v : null;
}

/** 合計計算用: 無効値は 0 として扱う */
export function parseShareAmountForSum(
  raw: number | "" | undefined,
): number {
  const parsed = parseShareAmountInput(raw);
  return parsed ?? 0;
}

/** 入力変更時: 空文字 or 正の整数 or "" */
export function parseShareAmountFieldInput(raw: string): number | "" {
  if (raw === "") return "";
  const v = Number.parseInt(raw, 10);
  return Number.isFinite(v) && v > 0 ? v : "";
}
