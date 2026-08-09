import type { ExpenseSplitMode } from "@/features/expenses/form/model/split-mode";

export type ExpenseForBalance = {
  amount: number;
  payer_id: string;
  participant_ids: string[];
  split_mode?: ExpenseSplitMode;
  share_amounts?: Record<string, number>;
};

export type ExpenseShareInput = {
  amount: number;
  payerId: string;
  participantIds: string[];
  splitMode: ExpenseSplitMode;
  shareAmounts?: Map<string, number> | Record<string, number>;
};

/**
 * 均等割の負担額（1円未満の端数は立替者負担。負担リストにいなくても端数は立替者に付与）。
 */
export function computeParticipantShares(
  amount: number,
  payerId: string,
  participantIds: string[],
): Map<string, number> {
  const shares = new Map<string, number>();
  const n = participantIds.length;
  if (!Number.isFinite(amount) || amount <= 0 || n === 0) return shares;

  const base = Math.floor(amount / n);
  const rem = amount - base * n;
  for (const uid of participantIds) {
    shares.set(uid, base);
  }
  if (rem > 0) {
    shares.set(payerId, (shares.get(payerId) ?? 0) + rem);
  }
  return shares;
}

function toShareMap(
  shareAmounts?: Map<string, number> | Record<string, number>,
): Map<string, number> | null {
  if (!shareAmounts) return null;
  if (shareAmounts instanceof Map) return shareAmounts;
  return new Map(Object.entries(shareAmounts));
}

/**
 * 分割方式に応じた負担額 Map を返す。
 */
export function computeExpenseShares(input: ExpenseShareInput): Map<string, number> {
  const { amount, payerId, participantIds, splitMode } = input;
  if (splitMode === "exact") {
    const shares = toShareMap(input.shareAmounts) ?? new Map<string, number>();
    return new Map(
      participantIds
        .filter((uid) => shares.has(uid))
        .map((uid) => [uid, shares.get(uid)!]),
    );
  }
  return computeParticipantShares(amount, payerId, participantIds);
}

/**
 * 未精算支出の合計で、ユーザーごとのネット（プラス＝貸し、マイナス＝借り）。
 */
export function computeNetBalancesByUser(
  expenses: ExpenseForBalance[],
): Map<string, number> {
  const net = new Map<string, number>();

  for (const e of expenses) {
    const n = e.participant_ids.length;
    if (n === 0) continue;

    net.set(e.payer_id, (net.get(e.payer_id) ?? 0) + e.amount);

    const shares = computeExpenseShares({
      amount: e.amount,
      payerId: e.payer_id,
      participantIds: e.participant_ids,
      splitMode: e.split_mode ?? "equal",
      shareAmounts: e.share_amounts,
    });
    for (const [uid, share] of shares) {
      net.set(uid, (net.get(uid) ?? 0) - share);
    }
  }

  return net;
}
