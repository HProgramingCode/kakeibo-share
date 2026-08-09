"use client";

import { confirmGroupSettlementAction } from "@/features/settlement/actions/settlement-actions";
import { BottomSheetDialog } from "@/shared/components/BottomSheetDialog";
import { FormSubmitButton } from "@/shared/components/FormSubmitButton";
import { useId, useState } from "react";

type Props = { groupId: string };

export function MonthlySettlementConfirmSection({ groupId }: Props) {
  const [confirming, setConfirming] = useState(false);
  const titleId = useId();

  return (
    <section id="monthly-settle" className="scroll-mt-36 space-y-5">
      <div><h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">精算期間を確定</h2></div>
      <div className="card-glass p-6">
        <button type="button" onClick={() => setConfirming(true)} className="w-full rounded-[24px] bg-slate-950 py-6 text-xs font-black uppercase tracking-[0.2em] text-white shadow-2xl transition-all active:scale-[0.98]">
          送金額を確定して記録する
        </button>
        <p className="mt-5 text-center text-sm leading-relaxed text-slate-500">いま残っている未精算支出をまとめて確定します。実際の送金はアプリ外で行ってください。</p>
      </div>

      <BottomSheetDialog open={confirming} onClose={() => setConfirming(false)} titleId={titleId} title="精算を確定しますか？" compact>
        <div className="space-y-5">
          <p className="text-sm leading-relaxed text-slate-600">現在の未精算支出をすべて精算済みにします。確定後は支出を編集・削除できません。</p>
          <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900">送金額を記録する操作です。実際の振込はアプリ外で行ってください。</p>
          <form className="flex flex-col gap-3" action={confirmGroupSettlementAction}>
            <input type="hidden" name="group_id" value={groupId} />
            <FormSubmitButton label="確定する" pendingLabel="確定中..." className="btn-primary w-full" />
            <button type="button" onClick={() => setConfirming(false)} className="btn-secondary w-full">キャンセル</button>
          </form>
        </div>
      </BottomSheetDialog>
    </section>
  );
}
