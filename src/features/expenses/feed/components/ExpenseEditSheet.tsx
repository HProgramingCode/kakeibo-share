"use client";

import {
  deleteExpenseAction,
  updateExpenseAction,
} from "@/features/expenses/actions/expense-actions";
import type { ExpenseFeedItemData } from "@/features/expenses/feed/model/expense-feed-item";
import type { MemberForExpenseEdit } from "@/features/expenses/form/model/expense-member";
import { ExpenseFormFields } from "@/features/expenses/form/components/ExpenseFormFields";
import { ExpenseParticipantSharesSection } from "@/features/expenses/form/components/ExpenseParticipantSharesSection";
import { BottomSheetDialog } from "@/shared/components/BottomSheetDialog";
import { FormSubmitButton } from "@/shared/components/FormSubmitButton";
import { useId, useState } from "react";

export type { MemberForExpenseEdit };

type Props = {
  groupId: string;
  members: MemberForExpenseEdit[];
  item: ExpenseFeedItemData;
  onClose: () => void;
};

export function ExpenseEditSheet({ groupId, members, item, onClose }: Props) {
  const titleId = useId();
  const payerId = item.payerId;
  const participantIds = item.participantIds;
  const [canSubmitShares, setCanSubmitShares] = useState(true);

  if (!payerId || !participantIds) return null;

  return (
    <BottomSheetDialog
      open
      onClose={onClose}
      titleId={titleId}
      title="支出を編集"
      zIndex={100}
      scrollable
      className="pb-[max(1.5rem,env(safe-area-inset-bottom,0px))]"
    >
      <form className="flex flex-col gap-5" action={updateExpenseAction}>
        <input type="hidden" name="group_id" value={groupId} />
        <input type="hidden" name="expense_id" value={item.id} />
        <ExpenseFormFields
          defaultValues={{
            amount: item.amount,
            expense_date: item.expense_date,
            title: item.title ?? "",
            category: item.category ?? "",
          }}
          categoryPortal
          categoryMenuZIndex={140}
        />
        <ExpenseParticipantSharesSection
          key={item.id}
          members={members}
          initialPayerId={payerId}
          initialParticipantIds={participantIds}
          initialSplitMode={item.splitMode ?? "equal"}
          initialShareAmounts={item.participantShares}
          payerLegendScreenReaderOnly={false}
          payerPickerPortal
          payerPickerMenuZIndex={140}
          onCanSubmitChange={setCanSubmitShares}
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
            disabled={!canSubmitShares}
            className="btn-primary order-1 w-full sm:order-2 sm:w-auto"
          />
        </div>
      </form>
    </BottomSheetDialog>
  );
}
