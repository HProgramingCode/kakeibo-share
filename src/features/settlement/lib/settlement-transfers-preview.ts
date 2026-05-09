export type TransferPreview = {
  from_user_id: string;
  to_user_id: string;
  amount: number;
};

/**
 * ユーザー別ネット残高から、RPC confirm_monthly_settlement と同様の貪欲法による送金ペアを算出する（画面上のプレビュー用）。
 * タイブレークは user_id を二次キーに固定（確定時の転送一覧と完全一致しない場合がある）。
 */
export function computeGreedySettlementTransfers(
  balanceByUser: Map<string, number>,
): TransferPreview[] {
  const bal = new Map(balanceByUser);
  const transfers: TransferPreview[] = [];

  function pickDebtor(): { id: string; b: number } | null {
    let best: { id: string; b: number } | null = null;
    for (const [id, b] of bal) {
      if (b >= 0) continue;
      if (!best || b < best.b || (b === best.b && id.localeCompare(best.id) < 0)) {
        best = { id, b };
      }
    }
    return best;
  }

  function pickCreditor(): { id: string; b: number } | null {
    let best: { id: string; b: number } | null = null;
    for (const [id, b] of bal) {
      if (b <= 0) continue;
      if (!best || b > best.b || (b === best.b && id.localeCompare(best.id) > 0)) {
        best = { id, b };
      }
    }
    return best;
  }

  for (;;) {
    const d = pickDebtor();
    const c = pickCreditor();
    if (!d || !c) break;
    const amt = Math.min(-d.b, c.b);
    if (amt <= 0) break;
    transfers.push({ from_user_id: d.id, to_user_id: c.id, amount: amt });
    bal.set(d.id, d.b + amt);
    bal.set(c.id, c.b - amt);
  }

  return transfers;
}
