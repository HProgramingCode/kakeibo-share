export type ExpenseForBalance = {
  amount: number;
  payer_id: string;
  participant_ids: string[];
};

/**
 * 均等割の負担額（1円未満の端数は支払者負担）。精算ネット計算・フォーム試算と同一ルール。
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
    shares.set(uid, base + (uid === payerId ? rem : 0));
  }
  return shares;
}

/**
 * 未精算支出の合計で、ユーザーごとのネット（プラス＝貸し、マイナス＝借り）。
 * 均等割の端数は支払者負担に寄せる（data-model.md と DB の精算 RPC と同一ルール）。
 */
export function computeNetBalancesByUser(
  expenses: ExpenseForBalance[],
): Map<string, number> {
  const net = new Map<string, number>();

  for (const e of expenses) {
    const n = e.participant_ids.length;
    if (n === 0) continue;

    net.set(e.payer_id, (net.get(e.payer_id) ?? 0) + e.amount);

    const shares = computeParticipantShares(e.amount, e.payer_id, e.participant_ids);
    for (const [uid, share] of shares) {
      net.set(uid, (net.get(uid) ?? 0) - share);
    }
  }

  return net;
}
