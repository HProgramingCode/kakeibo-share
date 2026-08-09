/** 精算確定 RPC のエラーメッセージをユーザー向けに変換 */
export function mapConfirmMonthlySettlementRpcMessage(raw: string | undefined): string {
  const m = raw ?? "";
  if (m.includes("not_authenticated")) return "ログインが必要です。";
  if (m.includes("not_group_member")) return "このグループのメンバーではありません。";
  if (m.includes("expense_without_participants")) return "負担メンバーがいない支出があります。";
  if (m.includes("no_unsettled_expenses")) return "未精算の支出がありません。";
  return m || "処理に失敗しました。";
}
