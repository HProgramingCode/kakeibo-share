/** カテゴリ選択の表示ラベル（空は「（なし）」） */
export function displayExpenseCategoryLabel(value: string): string {
  return value === "" ? "（なし）" : value;
}
