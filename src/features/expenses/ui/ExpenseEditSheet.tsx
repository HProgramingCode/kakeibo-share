"use client";

import {
  deleteExpenseAction,
  updateExpenseAction,
} from "@/features/expenses/actions/expense-actions";
import type { ExpenseFeedItemData } from "@/features/expenses/lib/expense-feed-item";
import { ExpenseCategoryPickField } from "@/features/expenses/ui/ExpenseCategoryPickField";
import { ExpenseDatePickField } from "@/features/expenses/ui/ExpenseDatePickField";
import { ExpenseParticipantSharesSection } from "@/features/expenses/ui/ExpenseParticipantSharesSection";
import { FormSubmitButton } from "@/features/shared/ui/FormSubmitButton";
import { X } from "lucide-react";
import { useEffect } from "react";

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

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

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
        className="relative z-10 flex max-h-[min(90dvh,100dvh)] w-full max-w-md min-h-0 flex-col overflow-hidden rounded-t-[28px] border border-slate-100 bg-white shadow-2xl sm:max-h-[min(85dvh,100dvh)] sm:rounded-[28px]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="expense-edit-title"
        style={{
          paddingBottom: "max(1.5rem, env(safe-area-inset-bottom, 0px))",
        }}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-6 pb-4 pt-6">
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

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-6 pb-6 pt-5 touch-pan-y">
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
            <div className="flex min-w-0 flex-col gap-2 text-sm">
              <span className="font-semibold text-slate-700">支出日</span>
              <ExpenseDatePickField
                name="expense_date"
                defaultValue={item.expense_date}
                required
              />
            </div>
            <label className="flex min-w-0 flex-col gap-2 text-sm">
              <span className="font-semibold text-slate-700">摘要</span>
              <input
                className="input-field"
                name="title"
                placeholder="例: スーパー"
                defaultValue={item.title ?? ""}
              />
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
              <button
                type="submit"
                formAction={deleteExpenseAction}
                className="order-2 w-full rounded-3xl border border-red-200/90 bg-red-50/90 px-5 py-3 text-sm font-semibold text-red-800 shadow-card transition-all duration-200 hover:border-red-300 hover:bg-red-50 focus-visible:outline focus-visible:ring-2 focus-visible:ring-red-400/55 focus-visible:ring-offset-2 active:scale-[0.98] motion-reduce:active:scale-100 sm:order-1 sm:w-auto"
              >
                削除
              </button>
              <FormSubmitButton
                label="更新"
                pendingLabel="更新中..."
                className="btn-primary order-1 w-full sm:order-2 sm:w-auto"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
