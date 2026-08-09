import type {
  GroupSpendChartsExpenseRow,
  GroupSpendChartsMemberRow,
} from "./types";
import type { ChartExpenseForSharesRow } from "@/features/settlement/charts/model/monthly-spend-series";

export function buildNameByUserId(
  members: GroupSpendChartsMemberRow[],
): Record<string, string> {
  const nameByUserId: Record<string, string> = {};
  for (const m of members) {
    nameByUserId[m.user_id] = m.profiles?.display_name?.trim() || "（未設定）";
  }
  return nameByUserId;
}

export function mapExpensesForMonthlySeries(
  expenses: GroupSpendChartsExpenseRow[],
) {
  return expenses.map((e) => ({
    amount: e.amount,
    expense_date: e.expense_date,
    payer_id: e.payer_id,
  }));
}

export function mapExpensesForParticipantShares(
  expenses: GroupSpendChartsExpenseRow[],
): ChartExpenseForSharesRow[] {
  return expenses.map((e) => {
    const participants = e.expense_participants ?? [];
    const share_amounts: Record<string, number> = {};
    for (const p of participants) {
      if (p.share_amount != null) {
        share_amounts[p.user_id] = p.share_amount;
      }
    }
    return {
      amount: e.amount,
      expense_date: e.expense_date,
      payer_id: e.payer_id,
      participant_ids: participants.map((p) => p.user_id),
      split_mode: e.split_mode === "exact" ? "exact" : "equal",
      share_amounts: e.split_mode === "exact" ? share_amounts : undefined,
    };
  });
}
