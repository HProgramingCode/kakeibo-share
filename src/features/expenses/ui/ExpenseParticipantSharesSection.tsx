"use client";

import { PayerPickField } from "@/features/expenses/ui/PayerPickField";
import { computeParticipantShares } from "@/features/settlement/lib/dashboard-balances";
import { formatYen } from "@/lib/format-yen";
import { useEffect, useMemo, useRef, useState } from "react";

export type ParticipantPickMember = { user_id: string; label: string };

type Props = {
  members: ParticipantPickMember[];
  initialPayerId: string;
  /** 編集時のみ。負担に含まれていたユーザー ID */
  initialParticipantIds?: string[];
  payerLegendScreenReaderOnly?: boolean;
  /** 編集シートなどスクロール領域内では true にするとメニューがクリップされにくい */
  payerPickerPortal?: boolean;
  payerPickerMenuZIndex?: number;
};

function resolveIncluded(
  members: ParticipantPickMember[],
  payerId: string,
  initialParticipantIds?: string[],
): Record<string, boolean> {
  const included: Record<string, boolean> = {};
  for (const m of members) {
    included[m.user_id] = initialParticipantIds
      ? initialParticipantIds.includes(m.user_id)
      : m.user_id === payerId;
  }
  return included;
}

export function ExpenseParticipantSharesSection({
  members,
  initialPayerId,
  initialParticipantIds,
  payerLegendScreenReaderOnly = false,
  payerPickerPortal = false,
  payerPickerMenuZIndex = 50,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [payerId, setPayerId] = useState(initialPayerId);
  const [included, setIncluded] = useState<Record<string, boolean>>(() =>
    resolveIncluded(members, initialPayerId, initialParticipantIds),
  );
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    const form = containerRef.current?.closest("form");
    if (!form) return undefined;

    const readAmount = () => {
      const el = form.querySelector<HTMLInputElement>('input[name="amount"]');
      const raw = el?.value?.trim() ?? "";
      const v = Number.parseInt(raw, 10);
      setAmount(Number.isFinite(v) && v > 0 ? v : 0);
    };

    const resetSharesState = () => {
      setPayerId(initialPayerId);
      setIncluded(
        resolveIncluded(members, initialPayerId, initialParticipantIds),
      );
      readAmount();
    };

    form.addEventListener("input", readAmount);
    form.addEventListener("change", readAmount);
    form.addEventListener("reset", resetSharesState);
    readAmount();

    return () => {
      form.removeEventListener("input", readAmount);
      form.removeEventListener("change", readAmount);
      form.removeEventListener("reset", resetSharesState);
    };
  }, [members, initialPayerId, initialParticipantIds]);

  const activeParticipantIds = useMemo(
    () =>
      members
        .filter((m) => included[m.user_id])
        .map((m) => m.user_id),
    [members, included],
  );

  const shares = useMemo(
    () => computeParticipantShares(amount, payerId, activeParticipantIds),
    [amount, payerId, activeParticipantIds],
  );

  return (
    <div ref={containerRef} className="flex flex-col gap-4">
      <PayerPickField
        members={members}
        value={payerId}
        onValueChange={(id) => {
          setPayerId(id);
          setIncluded(
            Object.fromEntries(
              members.map((m) => [m.user_id, m.user_id === id]),
            ),
          );
        }}
        legendScreenReaderOnly={payerLegendScreenReaderOnly}
        portal={payerPickerPortal}
        menuZIndex={payerPickerMenuZIndex}
      />

      <fieldset className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5">
        <legend className="px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          負担に含めるメンバー
        </legend>
        <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
          立替者は実際に支払った人です。負担に含めない場合も、1円未満の端数は立替者の負担になります。
        </p>

        {members.length === 0 ? (
          <p className="mt-4 text-xs text-slate-500">メンバーがいません。</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {members.map((m) => {
              const isPayer = m.user_id === payerId;
              const on = included[m.user_id];
              const rowShare = shares.get(m.user_id) ?? 0;
              const showShare =
                amount > 0 && (on || (isPayer && rowShare > 0));
              return (
                <li key={m.user_id}>
                  <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-800">
                    <input
                      type="checkbox"
                      name="participant"
                      value={m.user_id}
                      checked={on}
                      onChange={(e) =>
                        setIncluded((p) => ({
                          ...p,
                          [m.user_id]: e.target.checked,
                        }))
                      }
                      className="h-5 w-5 shrink-0 rounded-lg border-slate-200 text-indigo-600 transition-all duration-200 focus:ring-2 focus:ring-indigo-500/30"
                    />
                    <span className="min-w-0 flex-1 truncate font-medium">
                      {isPayer ? (
                        <>
                          <span className="mr-2 text-[10px] font-black uppercase tracking-wider text-indigo-500">
                            立替
                          </span>
                          {m.label}
                        </>
                      ) : (
                        m.label
                      )}
                    </span>
                    <span className="shrink-0 font-mono text-sm font-semibold tabular-nums text-slate-600">
                      {showShare ? formatYen(rowShare) : "—"}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}

        {amount <= 0 ? (
          <p className="mt-3 text-[11px] text-slate-400">
            金額を入力すると負担額の目安が表示されます。
          </p>
        ) : (
          <p className="mt-3 text-[11px] text-slate-400">
            表示は送信前の試算です（登録後の精算計算と同じ均等割です）。
          </p>
        )}
      </fieldset>
    </div>
  );
}
