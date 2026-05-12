import Link from "next/link";
import { loadGroupSpendChartsPageData } from "@/features/groups/lib/services/group-spend-charts-service";
import type { GroupSpendChartsPageProps } from "@/features/groups/lib/types/group-spend-charts-screen.types";
import { GroupsDestructiveAlert } from "@/features/groups/components/GroupsDestructiveAlert";
import { GroupSpendCharts } from "@/features/settlement/ui/GroupSpendCharts";
import {
  buildMonthlySpendSeries,
  buildParticipantShareTotalsByMonth,
} from "@/features/settlement/lib/monthly-spend-series";
import { createClient } from "@/shared/supabase/server";
import { BarChart3, ChevronLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";

export default async function GroupSpendChartsScreen({
  params,
}: GroupSpendChartsPageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const loadResult = await loadGroupSpendChartsPageData(supabase, {
    groupId: id,
    userId: user.id,
  });

  if (loadResult.kind === "not_found") {
    notFound();
  }

  if (loadResult.kind === "members_error") {
    return (
      <GroupsDestructiveAlert>
        メンバー情報の読み込みに失敗しました
        {loadResult.message ? `: ${loadResult.message}` : ""}
      </GroupsDestructiveAlert>
    );
  }

  if (loadResult.kind === "expenses_error") {
    return (
      <GroupsDestructiveAlert>
        支出の読み込みに失敗しました: {loadResult.message}
      </GroupsDestructiveAlert>
    );
  }

  const { groupLabel, members, expenses } = loadResult;

  const nameByUserId: Record<string, string> = {};
  for (const m of members) {
    nameByUserId[m.user_id] = m.profiles?.display_name?.trim() || "（未設定）";
  }

  const expensesForSeries = expenses.map((e) => ({
    amount: e.amount,
    expense_date: e.expense_date,
    payer_id: e.payer_id,
  }));
  const monthlySpendSeries = buildMonthlySpendSeries(expensesForSeries);
  const payerTotalsByMonth = buildParticipantShareTotalsByMonth(
    expenses.map((e) => ({
      amount: e.amount,
      expense_date: e.expense_date,
      payer_id: e.payer_id,
      participant_ids: (e.expense_participants ?? []).map((p) => p.user_id),
    })),
  );

  return (
    <div className="flex flex-col gap-8">
      <header className="sticky top-0 z-30 -mx-6 border-b border-slate-100 bg-white/80 px-6 pb-6 pt-2 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href={`/groups/${id}`}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 transition-all active:scale-95"
            aria-label="グループ詳細へ戻る"
          >
            <ChevronLeft className="h-5 w-5 text-slate-600" strokeWidth={1.75} />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 shrink-0 text-indigo-600" strokeWidth={1.75} aria-hidden />
              <h1 className="text-xl font-black tracking-tight text-slate-950">支出の推移</h1>
            </div>
            <div className="mt-0.5 flex items-center gap-1">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
              <span className="truncate text-[10px] font-bold uppercase tracking-widest text-slate-500">
                {groupLabel}
              </span>
            </div>
          </div>
        </div>
      </header>

      <GroupSpendCharts
        data={monthlySpendSeries}
        showCardHeading={false}
        payerTotalsByMonth={payerTotalsByMonth}
        nameByUserId={nameByUserId}
      />
    </div>
  );
}
