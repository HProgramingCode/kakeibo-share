/** confirm_monthly_settlement RPC のエラーメッセージをユーザー向けに変換 */
export function mapConfirmMonthlySettlementRpcMessage(raw: string | undefined): string {
  const m = raw ?? "";
  if (m.includes("not_authenticated")) return "ログインが必要です。";
  if (m.includes("not_group_member")) return "このグループのメンバーではありません。";
  if (m.includes("invalid_month")) return "対象月の形式が正しくありません（YYYY-MM）。";
  if (m.includes("settlement_already_exists")) return "この月はすでに精算が確定しています。";
  if (m.includes("payer_not_in_participants")) return "支払者が負担メンバーに含まれていない支出があります。";
  if (m.includes("expense_without_participants")) return "負担メンバーがいない支出があります。";
  if (m.includes("no_expenses_in_month")) return "その月に未精算の支出がありません。";
  if (m.includes("balance_sum_mismatch")) return "残高計算が整合しませんでした。管理者に連絡してください。";
  return m || "処理に失敗しました。";
}
