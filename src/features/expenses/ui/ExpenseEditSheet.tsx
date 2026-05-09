"use client";

import { updateExpenseAction } from "@/features/expenses/actions/expense-actions";
import type { ExpenseFeedItemData } from "@/features/expenses/lib/expense-feed-item";
import { ExpenseParticipantSharesSection } from "@/features/expenses/ui/ExpenseParticipantSharesSection";
import { ExpenseCategoryPickField } from "@/features/expenses/ui/ExpenseCategoryPickField";
import { X } from "lucide-react";

export type MemberForExpenseEdit = { user_id: string; label: string };

type Props = {
  groupId: string;
  members: MemberForExpenseEdit[];
  item: ExpenseFeedItemData;
  onClose: () => void;
};

export function ExpenseEditSheet({ groupId, members, item, onClose }: Props) {
  const payerId = item.payerId;
  const participantIds = item.participantIds;
  if (!payerId || !participantIds) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
        aria-label="閉じる"
        onClick={onClose}
      />
      <div
        className="relative z-10 max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-[28px] border border-slate-100 bg-white p-6 pb-8 shadow-2xl sm:max-h-[85dvh] sm:rounded-[28px]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="expense-edit-title"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 id="expense-edit-title" className="text-base font-black text-slate-900">
            支出を編集
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="閉じる"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <form className="flex flex-col gap-5" action={updateExpenseAction}>
          <input type="hidden" name="group_id" value={groupId} />
          <input type="hidden" name="expense_id" value={item.id} />
          <label className="flex min-w-0 flex-col gap-2 text-sm">
            <span className="font-semibold text-slate-700">金額（円）</span>
            <input
              className="input-field"
              type="number"
              name="amount"
              min={1}
              step={1}
              required
              defaultValue={item.amount}
            />
          </label>
          <label className="flex min-w-0 flex-col gap-2 text-sm">
            <span className="font-semibold text-slate-700">支出日</span>
            <input className="input-field" type="date" name="expense_date" required defaultValue={item.expense_date} />
          </label>
          <label className="flex min-w-0 flex-col gap-2 text-sm">
            <span className="font-semibold text-slate-700">摘要</span>
            <input className="input-field" name="title" placeholder="例: スーパー" defaultValue={item.title ?? ""} />
          </label>
          <div className="flex min-w-0 flex-col gap-2 text-sm">
            <span className="font-semibold text-slate-700">カテゴリ</span>
            <ExpenseCategoryPickField
              defaultValue={item.category ?? ""}
              menuZIndex={140}
              portal
            />
          </div>
          <ExpenseParticipantSharesSection
            key={item.id}
            members={members}
            initialPayerId={payerId}
            initialParticipantIds={participantIds}
            payerLegendScreenReaderOnly={false}
            payerPickerPortal
            payerPickerMenuZIndex={140}
          />
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="btn-secondary order-2 w-full sm:order-1 sm:w-auto">
              キャンセル
            </button>
            <button type="submit" className="btn-primary order-1 w-full sm:order-2 sm:w-auto">
              更新
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
