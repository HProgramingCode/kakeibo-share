import { computeParticipantShares } from "@/features/settlement/lib/dashboard-balances";

export type GroupSpendChartPoint = {
  month: string;
  monthlyTotal: number;
  cumulativeTotal: number;
};

type SpendRow = {
  expense_date: string;
  amount: number;
};

/** expense_date を YYYY-MM で暦月集計し、月ソート済みの累計（prefix sum）を返す */
export function buildMonthlySpendSeries(rows: SpendRow[]): GroupSpendChartPoint[] {
  const map = new Map<string, number>();
  for (const e of rows) {
    const d = e.expense_date.trim();
    const ym = d.length >= 7 ? d.slice(0, 7) : d;
    map.set(ym, (map.get(ym) ?? 0) + e.amount);
  }
  const months = [...map.keys()].sort((a, b) => a.localeCompare(b));
  let cumulativeTotal = 0;
  return months.map((month) => {
    const monthlyTotal = map.get(month) ?? 0;
    cumulativeTotal += monthlyTotal;
    return { month, monthlyTotal, cumulativeTotal };
  });
}

/** グラフ画面で取得する支出行（月次シリーズ・ユーザー別内訳の入力） */
export type ChartExpenseRow = {
  expense_date: string;
  amount: number;
  payer_id: string;
};

/** YYYY-MM ごとの user_id → その月のユーザー別合計（グラフ下の内訳用） */
export type PayerTotalsByMonth = Record<string, Record<string, number>>;

/** 均等割の負担額を月×ユーザーで合計（端数ルールは computeParticipantShares と同一） */
export type ChartExpenseForSharesRow = ChartExpenseRow & {
  participant_ids: string[];
};

export function buildParticipantShareTotalsByMonth(rows: ChartExpenseForSharesRow[]): PayerTotalsByMonth {
  const out: PayerTotalsByMonth = {};
  for (const e of rows) {
    const d = e.expense_date.trim();
    const ym = d.length >= 7 ? d.slice(0, 7) : d;
    const shares = computeParticipantShares(e.amount, e.payer_id, e.participant_ids);
    if (shares.size === 0) continue;
    if (!out[ym]) out[ym] = {};
    const bucket = out[ym];
    for (const [uid, share] of shares) {
      bucket[uid] = (bucket[uid] ?? 0) + share;
    }
  }
  return out;
}
