"use client";

import type { ExpenseSplitMode } from "@/features/expenses/lib/split-mode";
import type { ExpenseMember } from "@/features/expenses/lib/types/expense-member";
import { ParticipantMemberShareRow } from "@/features/expenses/ui/participant-shares/ParticipantMemberShareRow";
import { ExactShareSumFooter } from "@/features/expenses/ui/participant-shares/ExactShareSumFooter";

type Props = {
  members: ExpenseMember[];
  payerId: string;
  splitMode: ExpenseSplitMode;
  included: Record<string, boolean>;
  shareAmounts: Record<string, number | "">;
  amount: number;
  displayShares: Map<string, number>;
  shareSum: number;
  exactSumValid: boolean;
  onIncludedChange: (userId: string, checked: boolean) => void;
  onShareAmountChange: (userId: string, value: number | "") => void;
};

export function ParticipantSharesFieldset({
  members,
  payerId,
  splitMode,
  included,
  shareAmounts,
  amount,
  displayShares,
  shareSum,
  exactSumValid,
  onIncludedChange,
  onShareAmountChange,
}: Props) {
  return (
    <fieldset className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5">
      <legend className="px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
        負担に含めるメンバー
      </legend>
      <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
        立替者は実際に支払った人です。
        {splitMode === "equal"
          ? "負担に含めない場合も、1円未満の端数は立替者の負担になります。"
          : "チェックしたメンバーの負担額合計が支出金額と一致する必要があります。"}
      </p>

      {members.length === 0 ? (
        <p className="mt-4 text-xs text-slate-500">メンバーがいません。</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {members.map((m) => (
            <ParticipantMemberShareRow
              key={m.user_id}
              member={m}
              payerId={payerId}
              included={included[m.user_id]}
              splitMode={splitMode}
              amount={amount}
              shareAmount={shareAmounts[m.user_id]}
              rowShare={displayShares.get(m.user_id) ?? 0}
              onIncludedChange={onIncludedChange}
              onShareAmountChange={onShareAmountChange}
            />
          ))}
        </ul>
      )}

      {amount <= 0 ? (
        <p className="mt-3 text-[11px] text-slate-400">
          金額を入力すると負担額の目安が表示されます。
        </p>
      ) : splitMode === "equal" ? (
        <p className="mt-3 text-[11px] text-slate-400">
          表示は送信前の試算です（登録後の精算計算と同じ均等割です）。
        </p>
      ) : (
        <ExactShareSumFooter
          amount={amount}
          shareSum={shareSum}
          exactSumValid={exactSumValid}
        />
      )}
    </fieldset>
  );
}
