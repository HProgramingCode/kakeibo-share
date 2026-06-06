import { computeExpenseShares } from "@/features/settlement/lib/dashboard-balances";
import type { ExpenseSplitMode } from "@/features/expenses/lib/split-mode";

export type GroupSpendChartPoint = {
  month: string;
  monthlyTotal: number;
  /** 表示期間の先頭月から当該月までの総額（内部計算や将来の別表示用） */
  cumulativeTotal: number;
  /** 先頭月〜当該月までの月数での平均（円／月）。棒と同じ次元で並べ読みしやすい */
  cumulativeMonthlyAverage: number;
};

type SpendRow = {
  expense_date: string;
  amount: number;
};

/** expense_date を YYYY-MM で暦月集計し、月ソート済みの累計と累進平均（各月での cumulativeTotal÷月数）を返す */
export function buildMonthlySpendSeries(rows: SpendRow[]): GroupSpendChartPoint[] {
  const map = new Map<string, number>();
  for (const e of rows) {
    const d = e.expense_date.trim();
    const ym = d.length >= 7 ? d.slice(0, 7) : d;
    map.set(ym, (map.get(ym) ?? 0) + e.amount);
  }
  const months = [...map.keys()].sort((a, b) => a.localeCompare(b));
  let cumulativeTotal = 0;
  return months.map((month, i) => {
    const monthlyTotal = map.get(month) ?? 0;
    cumulativeTotal += monthlyTotal;
    const monthsCount = i + 1;
    const cumulativeMonthlyAverage = Math.round(cumulativeTotal / monthsCount);
    return { month, monthlyTotal, cumulativeTotal, cumulativeMonthlyAverage };
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

export type ChartExpenseForSharesRow = ChartExpenseRow & {
  participant_ids: string[];
  split_mode?: ExpenseSplitMode;
  share_amounts?: Record<string, number>;
};

export function buildParticipantShareTotalsByMonth(
  rows: ChartExpenseForSharesRow[],
): PayerTotalsByMonth {
  const out: PayerTotalsByMonth = {};
  for (const e of rows) {
    const d = e.expense_date.trim();
    const ym = d.length >= 7 ? d.slice(0, 7) : d;
    const shares = computeExpenseShares({
      amount: e.amount,
      payerId: e.payer_id,
      participantIds: e.participant_ids,
      splitMode: e.split_mode ?? "equal",
      shareAmounts: e.share_amounts,
    });
    if (shares.size === 0) continue;
    if (!out[ym]) out[ym] = {};
    const bucket = out[ym];
    for (const [uid, share] of shares) {
      bucket[uid] = (bucket[uid] ?? 0) + share;
    }
  }
  return out;
}
