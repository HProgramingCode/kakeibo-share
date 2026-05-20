/** 条件付きクラス名を連結（false / undefined は無視） */
export function cn(...parts: Array<string | undefined | null | false>): string {
  return parts.filter(Boolean).join(" ");
}
