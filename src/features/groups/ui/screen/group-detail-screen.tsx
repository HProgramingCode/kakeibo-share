import Link from "next/link";
import { loadGroupDetailPageData } from "@/features/groups/lib/services/group-detail-service";
import type {
  ExpenseRow,
  GroupDetailPageProps,
} from "@/features/groups/lib/types/group-detail-screen.types";
import { BalanceHero } from "@/features/settlement/ui/BalanceHero";
import { computeNetBalancesByUser } from "@/features/settlement/lib/dashboard-balances";
import { computeGreedySettlementTransfers } from "@/features/settlement/lib/settlement-transfers-preview";
import { confirmMonthlySettlementAction } from "@/features/settlement/actions/settlement-actions";
import { createExpenseAction } from "@/features/expenses/actions/expense-actions";
import type { ExpenseFeedItemData } from "@/features/expenses/lib/expense-feed-item";
import { ExpenseFeedWithMonthFilter } from "@/features/expenses/ui/ExpenseFeedWithMonthFilter";
import { ExpenseCategoryPickField } from "@/features/expenses/ui/ExpenseCategoryPickField";
import { ExpenseParticipantSharesSection } from "@/features/expenses/ui/ExpenseParticipantSharesSection";
import { GroupDetailOverflowMenu } from "@/features/groups/ui/components/GroupDetailOverflowMenu";
import { GroupDetailTabs } from "@/features/groups/ui/components/GroupDetailTabs";
import { EmptyState } from "@/shared/ui/EmptyState";
import { formatYen } from "@/shared/lib/format-yen";
import { createClient } from "@/shared/supabase/server";
import { Camera, History, Landmark, Plus, Users } from "lucide-react";
import { notFound, redirect } from "next/navigation";

function todayJstYmd(): string {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" });
}

function currentMonthJstYm(): string {
  return todayJstYmd().slice(0, 7);
}

function toFeedItems(
  rows: ExpenseRow[],
  nameById: Map<string, string>,
): ExpenseFeedItemData[] {
  return rows.map((e) => {
    const base: ExpenseFeedItemData = {
      id: e.id,
      amount: e.amount,
      expense_date: e.expense_date,
      title: e.title,
      category: e.category,
      payerLabel: nameById.get(e.payer_id) ?? e.payer_id,
      participantCount: (e.expense_participants ?? []).length,
      participantsLine: `負担: ${(e.expense_participants ?? [])
        .map((p) => nameById.get(p.user_id) ?? p.user_id)
        .join("・")}`,
    };
    if (e.status !== "unpaid") return base;
    return {
      ...base,
      payerId: e.payer_id,
      participantIds: (e.expense_participants ?? []).map((p) => p.user_id),
      editable: true,
    };
  });
}

export default async function GroupDetailPage({
  params,
  searchParams,
}: GroupDetailPageProps) {
  const { id } = await params;
  const sp = await searchParams;
  const queryError = sp?.error;
  const settledMonth = sp?.settled;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const loadResult = await loadGroupDetailPageData(supabase, {
    groupId: id,
    userId: user.id,
  });

  if (loadResult.kind === "not_found") {
    notFound();
  }

  if (loadResult.kind === "members_error") {
    return (
      <div className="rounded-3xl border border-red-100 bg-red-50/80 p-5 text-sm text-red-800">
        メンバー情報の読み込みに失敗しました: {loadResult.message}
      </div>
    );
  }

  if (loadResult.kind === "expenses_error") {
    return (
      <div className="rounded-3xl border border-red-100 bg-red-50/80 p-5 text-sm text-red-800">
        支出の読み込みに失敗しました: {loadResult.message}
      </div>
    );
  }

  if (loadResult.kind === "batches_error") {
    return (
      <div className="rounded-3xl border border-red-100 bg-red-50/80 p-5 text-sm text-red-800">
        精算履歴の読み込みに失敗しました: {loadResult.message}
      </div>
    );
  }

  const {
    membershipRole,
    members,
    groupLabel,
    initialDisplayName,
    expenses,
    batches,
  } = loadResult;

  const nameById = new Map<string, string>();
  for (const m of members) {
    const name = m.profiles?.display_name?.trim() || "（未設定）";
    nameById.set(m.user_id, name);
  }

  const unpaidExpenses = expenses.filter((e) => e.status === "unpaid");
  const settledExpenses = expenses.filter((e) => e.status === "settled");
  const balancesInput = unpaidExpenses.map((e) => ({
    amount: e.amount,
    payer_id: e.payer_id,
    participant_ids: (e.expense_participants ?? []).map((p) => p.user_id),
  }));
  const netByUser = computeNetBalancesByUser(balancesInput);

  const sortedMembers = [...members].sort((a, b) =>
    (nameById.get(a.user_id) ?? "").localeCompare(
      nameById.get(b.user_id) ?? "",
      "ja",
    ),
  );

  const membersForExpenseEdit = sortedMembers.map((m) => ({
    user_id: m.user_id,
    label: nameById.get(m.user_id) ?? "（未設定）",
  }));

  const menuMembers = sortedMembers.map((m) => ({
    user_id: m.user_id,
    label: nameById.get(m.user_id) ?? "（未設定）",
    role: (m.role === "owner" ? "owner" : "member") as "owner" | "member",
  }));

  const transferPreview = computeGreedySettlementTransfers(netByUser);

  const unpaidFeedItems = toFeedItems(unpaidExpenses, nameById);
  const settledFeedItems = toFeedItems(settledExpenses, nameById);

  const dashboardSlot = (
    <div className="flex flex-col gap-8">
      <BalanceHero
        currentUserId={user.id}
        transfers={transferPreview}
        nameByUserId={nameById}
      />

      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          disabled
          className="flex flex-col items-start space-y-3 rounded-3xl border border-slate-100 bg-white/95 p-5 text-left shadow-card opacity-70 transition-all duration-200 active:scale-95"
          aria-disabled
        >
          <div className="rounded-xl bg-orange-50 p-2.5 text-left shadow-inner">
            <Camera className="h-5 w-5 text-orange-600" strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Rapid
            </p>
            <p className="text-sm font-bold leading-tight text-slate-800">
              OCR撮影
            </p>
          </div>
        </button>
        <a
          href="#expense-form"
          className="group flex flex-col items-start space-y-3 rounded-3xl border border-indigo-100 bg-indigo-50/90 p-5 text-left shadow-card transition-all duration-200 hover:border-indigo-200 hover:shadow-card-hover active:scale-95"
        >
          <div className="rounded-xl bg-indigo-600 p-2.5 shadow-lg transition-transform group-hover:rotate-12">
            <Plus className="h-5 w-5 text-white" strokeWidth={2} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">
              Simple
            </p>
            <p className="text-sm font-bold leading-tight text-indigo-900">
              手入力
            </p>
          </div>
        </a>
      </div>

      <section id="monthly-settle" className="scroll-mt-36 space-y-5">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            月次精算の確定のみ
          </h2>
        </div>
        <div className="card-glass p-6">
          <form
            className="flex flex-col gap-5"
            action={confirmMonthlySettlementAction}
          >
            <input type="hidden" name="group_id" value={id} />
            <label className="flex min-w-0 flex-col gap-2 text-sm">
              <span className="font-semibold text-slate-700">
                対象月（JST）
              </span>
              <input
                className="input-field"
                type="month"
                name="target_month"
                required
                defaultValue={currentMonthJstYm()}
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-[24px] bg-slate-950 py-6 text-xs font-black uppercase tracking-[0.2em] text-white shadow-2xl transition-all active:scale-[0.98]"
            >
              確定して記録を締める
            </button>
            <p className="text-center text-sm leading-relaxed text-slate-500">
              対象月の未精算支出をまとめて確定します（同じ月は1回だけ）
            </p>
          </form>
        </div>
      </section>

      <section id="recent-expenses" className="scroll-mt-36 space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-black text-slate-900">
            最近の支出一覧
          </h2>
          <a
            href="#settled-expenses"
            className="text-[11px] font-black uppercase tracking-widest text-indigo-600 opacity-80 transition-opacity hover:opacity-100"
          >
            View All
          </a>
        </div>
        {unpaidFeedItems.length === 0 ? (
          <EmptyState
            icon={
              <Landmark
                className="h-6 w-6 text-slate-300"
                strokeWidth={1.5}
                aria-hidden
              />
            }
            title="未精算の支出はありません"
            description="清潔な状態からはじめられます"
          />
        ) : (
          <ExpenseFeedWithMonthFilter
            items={unpaidFeedItems}
            groupId={id}
            membersForEdit={membersForExpenseEdit}
          />
        )}
      </section>
    </div>
  );

  const registerSlot = (
    <div className="flex flex-col gap-8">
      <section id="expense-form" className="flex scroll-mt-36 flex-col gap-5">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            支出を追加
          </h2>
          <p className="mt-1 text-sm text-slate-500">手入力で登録</p>
        </div>

        <div className="card-glass p-6">
          <form className="flex flex-col gap-5" action={createExpenseAction}>
            <input type="hidden" name="group_id" value={id} />
            <label className="flex min-w-0 flex-col gap-2 text-sm">
              <span className="font-semibold text-slate-700">金額（円）</span>
              <input
                className="input-field"
                type="number"
                name="amount"
                min={1}
                step={1}
                required
              />
            </label>
            <label className="flex min-w-0 flex-col gap-2 text-sm">
              <span className="font-semibold text-slate-700">支出日</span>
              <input
                className="input-field"
                type="date"
                name="expense_date"
                required
                defaultValue={todayJstYmd()}
              />
            </label>
            <label className="flex min-w-0 flex-col gap-2 text-sm">
              <span className="font-semibold text-slate-700">摘要</span>
              <input
                className="input-field"
                name="title"
                placeholder="例: スーパー"
              />
            </label>
            <div className="flex min-w-0 flex-col gap-2 text-sm">
              <span className="font-semibold text-slate-700">カテゴリ</span>
              <ExpenseCategoryPickField defaultValue="" />
            </div>
            <ExpenseParticipantSharesSection
              members={membersForExpenseEdit}
              initialPayerId={user.id}
            />
            <button type="submit" className="btn-primary w-full">
              登録
            </button>
          </form>
        </div>
      </section>
    </div>
  );

  const historySlot = (
    <div className="flex flex-col gap-8">
      <section id="settled-expenses" className="scroll-mt-36 space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          精算済みの支出
        </h2>
        {settledFeedItems.length === 0 ? (
          <EmptyState
            icon={
              <History
                className="h-6 w-6 text-slate-300"
                strokeWidth={1.5}
                aria-hidden
              />
            }
            title="精算済みの支出はまだありません"
          />
        ) : (
          <ExpenseFeedWithMonthFilter items={settledFeedItems} />
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          精算履歴
        </h2>
        {batches.length === 0 ? (
          <EmptyState
            icon={
              <History
                className="h-6 w-6 text-slate-300"
                strokeWidth={1.5}
                aria-hidden
              />
            }
            title="精算履歴はまだありません"
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {batches.map((b) => {
              const transfers = b.settlement_transfers ?? [];
              return (
                <li key={b.id} className="card-glass p-5">
                  <p className="font-semibold text-slate-900">
                    {b.target_month}{" "}
                    <span className="font-normal text-slate-400">
                      · {new Date(b.created_at).toLocaleString("ja-JP")}
                    </span>
                  </p>
                  {transfers.length === 0 ? (
                    <p className="mt-3 text-sm text-slate-500">送金ペアなし</p>
                  ) : (
                    <ul className="mt-3 space-y-2 text-sm text-slate-600">
                      {transfers.map((t, i) => (
                        <li key={i} className="font-medium">
                          {nameById.get(t.from_user_id) ?? t.from_user_id}{" "}
                          <span className="text-slate-400">→</span>{" "}
                          {nameById.get(t.to_user_id) ?? t.to_user_id}{" "}
                          <span className="font-mono font-black tracking-tighter text-slate-900">
                            {formatYen(t.amount)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );

  return (
    <div className="flex flex-col gap-8">
      <header className="sticky top-0 z-30 -mx-6 border-b border-slate-100 bg-white/80 px-6 pb-6 pt-2 backdrop-blur-md shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <Link
              href="/groups"
              aria-label="グループ一覧へ"
              className="inline-block rounded-md text-slate-950 no-underline transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
            >
              <h1 className="text-xl font-black tracking-tight text-slate-950">
                みんなの精算
              </h1>
            </Link>
            <div className="mt-0.5 flex items-center gap-1">
              <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-emerald-500" />
              <span className="truncate text-[10px] font-bold uppercase tracking-widest text-slate-500">
                {groupLabel}
              </span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/groups"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 transition-all active:scale-95"
              aria-label="グループ一覧"
            >
              <Users className="h-5 w-5 text-slate-600" strokeWidth={1.75} />
            </Link>
            <GroupDetailOverflowMenu
              groupId={id}
              isOwner={membershipRole === "owner"}
              initialDisplayName={initialDisplayName}
              members={menuMembers}
            />
          </div>
        </div>
      </header>

      {queryError ? (
        <p className="rounded-3xl border border-red-100 bg-red-50/80 px-5 py-4 text-sm text-red-800">
          {queryError}
        </p>
      ) : null}
      {settledMonth ? (
        <p className="rounded-3xl border border-indigo-100 bg-indigo-50/70 px-5 py-4 text-sm font-medium text-indigo-900">
          {settledMonth} の精算を確定しました
        </p>
      ) : null}

      <GroupDetailTabs
        dashboard={dashboardSlot}
        register={registerSlot}
        history={historySlot}
      />
    </div>
  );
}
