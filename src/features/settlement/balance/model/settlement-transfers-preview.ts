import { computeExpenseShares } from "@/features/settlement/balance/model/dashboard-balances";

export type TransferPreview = {
  from_user_id: string;
  to_user_id: string;
  amount: number;
};

type ExpenseForPairwiseSettlement = {
  amount: number;
  payer_id: string;
  participant_ids: string[];
  split_mode?: "equal" | "exact";
  share_amounts?: Record<string, number>;
};

/**
 * 支出ごとの「負担者 → 立替者」を二人組ごとにだけ相殺する。
 * 三者間の債務を別の相手へ振り替えないため、二人の間に残る送金が表示される。
 */
export function computePairwiseSettlementTransfers(
  expenses: ExpenseForPairwiseSettlement[],
): TransferPreview[] {
  const pairBalances = new Map<
    string,
    { lowId: string; highId: string; lowToHigh: number }
  >();

  for (const expense of expenses) {
    const shares = computeExpenseShares({
      amount: expense.amount,
      payerId: expense.payer_id,
      participantIds: expense.participant_ids,
      splitMode: expense.split_mode ?? "equal",
      shareAmounts: expense.share_amounts,
    });
    for (const [debtorId, amount] of shares) {
      if (debtorId === expense.payer_id || amount <= 0) continue;
      const [lowId, highId] = [debtorId, expense.payer_id].sort();
      const key = `${lowId}\u0000${highId}`;
      const pair = pairBalances.get(key) ?? { lowId, highId, lowToHigh: 0 };
      pair.lowToHigh += debtorId === lowId ? amount : -amount;
      pairBalances.set(key, pair);
    }
  }

  return [...pairBalances.values()]
    .filter((pair) => pair.lowToHigh !== 0)
    .map((pair) =>
      pair.lowToHigh > 0
        ? {
            from_user_id: pair.lowId,
            to_user_id: pair.highId,
            amount: pair.lowToHigh,
          }
        : {
            from_user_id: pair.highId,
            to_user_id: pair.lowId,
            amount: -pair.lowToHigh,
          },
    )
    .sort(
      (a, b) =>
        a.from_user_id.localeCompare(b.from_user_id) ||
        a.to_user_id.localeCompare(b.to_user_id),
    );
}
