import { GroupExpenseCreateForm } from "./GroupExpenseCreateForm";

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
          <GroupExpenseCreateForm
            groupId={groupId}
            currentUserId={currentUserId}
            membersForEdit={membersForEdit}
            defaultExpenseDate={defaultExpenseDate}
            clientRequestId={clientRequestId}
          />
        </div>
      </section>
    </div>
  );
}
