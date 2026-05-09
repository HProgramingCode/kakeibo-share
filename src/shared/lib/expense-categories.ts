/** 支出カテゴリ（サーバー検証と UI で共通） */
export const EXPENSE_CATEGORY_OPTIONS = [
  "食費",
  "日用品",
  "交通",
  "娯楽",
  "その他",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORY_OPTIONS)[number];
