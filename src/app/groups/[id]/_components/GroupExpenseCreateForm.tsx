"use client";

import { createExpenseAction } from "@/features/expenses/actions/expense-actions";
import type { ExpenseMember } from "@/features/expenses/form/model/expense-member";
import { ExpenseFormFields } from "@/features/expenses/form/components/ExpenseFormFields";
import { ExpenseParticipantSharesSection } from "@/features/expenses/form/components/ExpenseParticipantSharesSection";
import { FormSubmitButton } from "@/shared/components/FormSubmitButton";
import { useState } from "react";

type Props = {
  groupId: string;
  currentUserId: string;
  membersForEdit: ExpenseMember[];
  defaultExpenseDate: string;
  clientRequestId: string;
};

export function GroupExpenseCreateForm({
  groupId,
  currentUserId,
  membersForEdit,
  defaultExpenseDate,
  clientRequestId,
}: Props) {
  const [canSubmitShares, setCanSubmitShares] = useState(true);

  return (
    <form className="flex flex-col gap-5" action={createExpenseAction}>
      <input type="hidden" name="group_id" value={groupId} />
      <input type="hidden" name="client_request_id" value={clientRequestId} />
      <ExpenseFormFields
        defaultValues={{ expense_date: defaultExpenseDate }}
      />
      <ExpenseParticipantSharesSection
        members={membersForEdit}
        initialPayerId={currentUserId}
        onCanSubmitChange={setCanSubmitShares}
      />
      <FormSubmitButton
        label="登録"
        pendingLabel="登録中..."
        disabled={!canSubmitShares}
      />
    </form>
  );
}
