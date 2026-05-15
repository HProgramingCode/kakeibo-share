import { confirmMonthlySettlementAction } from "@/features/settlement/actions/settlement-actions";

type Props = {
  groupId: string;
  defaultTargetMonth: string;
};

export function MonthlySettlementConfirmSection({
  groupId,
  defaultTargetMonth,
}: Props) {
  return (
    <section id="monthly-settle" className="scroll-mt-36 space-y-5">
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          月次精算の確定のみ
        </h2>
      </div>
      <div className="card-glass p-6">
        <form className="flex flex-col gap-5" action={confirmMonthlySettlementAction}>
          <input type="hidden" name="group_id" value={groupId} />
          <label className="flex min-w-0 flex-col gap-2 text-sm">
            <span className="font-semibold text-slate-700">対象月（JST）</span>
            <input
              className="input-field"
              type="month"
              name="target_month"
              required
              defaultValue={defaultTargetMonth}
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
  );
}
