import { createExpenseAction } from "@/features/expenses/actions/expense-actions";
import { ExpenseCategoryPickField } from "@/features/expenses/ui/ExpenseCategoryPickField";
import { ExpenseParticipantSharesSection } from "@/features/expenses/ui/ExpenseParticipantSharesSection";
import { FormSubmitButton } from "@/shared/ui/FormSubmitButton";

type Props = {
  groupId: string;
  currentUserId: string;
  membersForEdit: { user_id: string; label: string }[];
  defaultExpenseDate: string;
};

export function GroupExpenseCreateSection({
  groupId,
  currentUserId,
  membersForEdit,
  defaultExpenseDate,
}: Props) {
  const clientRequestId = crypto.randomUUID();

  return (
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
            <input type="hidden" name="group_id" value={groupId} />
            <input type="hidden" name="client_request_id" value={clientRequestId} />
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
                defaultValue={defaultExpenseDate}
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
              members={membersForEdit}
              initialPayerId={currentUserId}
            />
            <FormSubmitButton label="登録" pendingLabel="登録中..." />
          </form>
        </div>
      </section>
    </div>
  );
}
