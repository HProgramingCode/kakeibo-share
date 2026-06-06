"use client";

import { parseShareAmountFieldInput } from "@/features/expenses/lib/domain/parse-share-amount-input";
import { participantShareFieldName } from "@/features/expenses/lib/parse-expense-shares-form";
import type { ExpenseSplitMode } from "@/features/expenses/lib/split-mode";
import type { ExpenseMember } from "@/features/expenses/lib/types/expense-member";
import { formatYen } from "@/lib/format-yen";

type Props = {
  member: ExpenseMember;
  payerId: string;
  included: boolean;
  splitMode: ExpenseSplitMode;
  amount: number;
  shareAmount: number | "" | undefined;
  rowShare: number;
  onIncludedChange: (userId: string, checked: boolean) => void;
  onShareAmountChange: (userId: string, value: number | "") => void;
};

export function ParticipantMemberShareRow({
  member,
  payerId,
  included,
  splitMode,
  amount,
  shareAmount,
  rowShare,
  onIncludedChange,
  onShareAmountChange,
}: Props) {
  const isPayer = member.user_id === payerId;
  const showShare = amount > 0 && (included || (isPayer && rowShare > 0));
  const shareFieldName = participantShareFieldName(member.user_id);

  return (
    <li>
      <div className="flex items-center gap-3 text-sm text-slate-800">
        <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            name="participant"
            value={member.user_id}
            checked={included}
            onChange={(e) =>
              onIncludedChange(member.user_id, e.target.checked)
            }
            className="h-5 w-5 shrink-0 rounded-lg border-slate-200 text-indigo-600 transition-all duration-200 focus:ring-2 focus:ring-indigo-500/30"
          />
          <span className="min-w-0 flex-1 truncate font-medium">
            {isPayer ? (
              <>
                <span className="mr-2 text-[10px] font-black uppercase tracking-wider text-indigo-500">
                  立替
                </span>
                {member.label}
              </>
            ) : (
              member.label
            )}
          </span>
        </label>

        <div className="flex h-10 w-[6.5rem] shrink-0 items-center justify-end">
          {splitMode === "exact" && included ? (
            <input
              type="number"
              name={shareFieldName}
              min={1}
              step={1}
              inputMode="numeric"
              aria-label={`${member.label}の負担額`}
              value={shareAmount ?? ""}
              onChange={(e) =>
                onShareAmountChange(
                  member.user_id,
                  parseShareAmountFieldInput(e.target.value),
                )
              }
              className="input-field h-10 w-full px-2 py-1 text-right text-sm font-semibold tabular-nums"
            />
          ) : (
            <span className="font-mono text-sm font-semibold tabular-nums text-slate-600">
              {showShare ? formatYen(rowShare) : "—"}
            </span>
          )}
        </div>
      </div>
    </li>
  );
}
