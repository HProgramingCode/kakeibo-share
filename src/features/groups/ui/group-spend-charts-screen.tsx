import Link from "next/link";
import { GroupSpendCharts } from "@/features/settlement/ui/GroupSpendCharts";
import {
  buildMonthlySpendSeries,
  buildParticipantShareTotalsByMonth,
} from "@/features/settlement/lib/monthly-spend-series";
import { createClient } from "@/shared/supabase/server";
import { BarChart3, ChevronLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

type MemberRow = {
  user_id: string;
  profiles: { id: string; display_name: string | null } | null;
};

type ExpenseRow = {
  amount: number;
  expense_date: string;
  payer_id: string;
  expense_participants: { user_id: string }[] | null;
};

export default async function GroupSpendChartsScreen({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: membership, error: memErr } = await supabase
    .from("group_members")
    .select("role")
    .eq("group_id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (memErr || !membership) {
    notFound();
  }

  const { data: groupRow } = await supabase.from("groups").select("name").eq("id", id).maybeSingle();
  const groupLabel = groupRow?.name?.trim() || "Family Room";

  const { data: memberRows, error: mErr } = await supabase
    .from("group_members")
    .select("user_id, profiles ( id, display_name )")
    .eq("group_id", id);

  if (mErr || !memberRows?.length) {
    return (
      <div className="rounded-3xl border border-red-100 bg-red-50/80 p-5 text-sm text-red-800">
        メンバー情報の読み込みに失敗しました{mErr?.message ? `: ${mErr.message}` : ""}
      </div>
    );
  }

  const members = memberRows as unknown as MemberRow[];
  const nameByUserId: Record<string, string> = {};
  for (const m of members) {
    nameByUserId[m.user_id] = m.profiles?.display_name?.trim() || "（未設定）";
  }

  const { data: expenseRows, error: exErr } = await supabase
    .from("expenses")
    .select("amount, expense_date, payer_id, expense_participants ( user_id )")
    .eq("group_id", id)
    .order("expense_date", { ascending: false });

  if (exErr) {
    return (
      <div className="rounded-3xl border border-red-100 bg-red-50/80 p-5 text-sm text-red-800">
        支出の読み込みに失敗しました: {exErr.message}
      </div>
    );
  }

  const rawExpenses = (expenseRows ?? []) as unknown as ExpenseRow[];
  const expensesForSeries = rawExpenses.map((e) => ({
    amount: e.amount,
    expense_date: e.expense_date,
    payer_id: e.payer_id,
  }));
  const monthlySpendSeries = buildMonthlySpendSeries(expensesForSeries);
  const payerTotalsByMonth = buildParticipantShareTotalsByMonth(
    rawExpenses.map((e) => ({
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
