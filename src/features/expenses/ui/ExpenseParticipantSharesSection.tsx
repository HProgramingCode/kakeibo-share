"use client";

import { PayerPickField } from "@/features/expenses/ui/PayerPickField";
import { computeParticipantShares } from "@/features/settlement/lib/dashboard-balances";
import { formatYen } from "@/shared/lib/format-yen";
import { useEffect, useMemo, useRef, useState } from "react";

export type ParticipantPickMember = { user_id: string; label: string };

type Props = {
  members: ParticipantPickMember[];
  initialPayerId: string;
  /** 編集時のみ。負担に含まれていたユーザー ID（支払者は UI に出ないがリストに含まれる） */
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
  const others = members.filter((m) => m.user_id !== payerId);
  for (const m of others) {
    included[m.user_id] = initialParticipantIds
      ? initialParticipantIds.includes(m.user_id)
      : false;
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

    form.addEventListener("input", readAmount);
    form.addEventListener("change", readAmount);
    readAmount();

    return () => {
      form.removeEventListener("input", readAmount);
      form.removeEventListener("change", readAmount);
    };
  }, []);

  const others = useMemo(
    () => members.filter((m) => m.user_id !== payerId),
    [members, payerId],
  );

  const activeParticipantIds = useMemo(() => {
    const ids = [payerId, ...others.filter((m) => included[m.user_id]).map((m) => m.user_id)];
    return [...new Set(ids)];
  }, [payerId, others, included]);

  const shares = useMemo(
    () => computeParticipantShares(amount, payerId, activeParticipantIds),
    [amount, payerId, activeParticipantIds],
  );

  const payerLabel = members.find((m) => m.user_id === payerId)?.label ?? "（未設定）";
  const payerShare = shares.get(payerId) ?? 0;

  return (
    <div ref={containerRef} className="flex flex-col gap-4">
      <PayerPickField
        members={members}
        value={payerId}
        onValueChange={(id) => {
          setPayerId(id);
          const nextOthers = members.filter((m) => m.user_id !== id);
          setIncluded(Object.fromEntries(nextOthers.map((m) => [m.user_id, false])));
        }}
        legendScreenReaderOnly={payerLegendScreenReaderOnly}
        portal={payerPickerPortal}
        menuZIndex={payerPickerMenuZIndex}
      />

      <input type="hidden" name="participant" value={payerId} />

      <fieldset className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5">
        <legend className="px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          負担に含めるメンバー
        </legend>
        <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
          支払者は均等割に必ず含まれます（下のチェックリストには出しません）。1円未満の端数は支払者の負担にまとめます。
        </p>

        <div className="mt-4 rounded-xl border border-slate-200/80 bg-white/80 px-4 py-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="font-medium text-slate-800">
              <span className="mr-2 text-[10px] font-black uppercase tracking-wider text-indigo-500">
                支払者
              </span>
              <span className="truncate">{payerLabel}</span>
            </span>
            <span className="shrink-0 font-mono text-sm font-semibold tabular-nums text-slate-900">
              {amount > 0 ? formatYen(payerShare) : "—"}
            </span>
          </div>
        </div>

        {others.length === 0 ? (
          <p className="mt-4 text-xs text-slate-500">
            他にメンバーがいないため、この支出の負担は支払者のみになります。
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {others.map((m) => {
              const on = included[m.user_id];
              const rowShare = shares.get(m.user_id) ?? 0;
              return (
                <li key={m.user_id}>
                  <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-800">
                    <input
                      type="checkbox"
                      name="participant"
                      value={m.user_id}
                      checked={on}
                      onChange={(e) =>
                        setIncluded((p) => ({ ...p, [m.user_id]: e.target.checked }))
                      }
                      className="h-5 w-5 shrink-0 rounded-lg border-slate-200 text-indigo-600 transition-all duration-200 focus:ring-2 focus:ring-indigo-500/30"
                    />
                    <span className="min-w-0 flex-1 truncate font-medium">{m.label}</span>
                    <span className="shrink-0 font-mono text-sm font-semibold tabular-nums text-slate-600">
                      {amount > 0 && on ? formatYen(rowShare) : "—"}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}

        {amount <= 0 ? (
          <p className="mt-3 text-[11px] text-slate-400">金額を入力すると負担額の目安が表示されます。</p>
        ) : (
          <p className="mt-3 text-[11px] text-slate-400">表示は送信前の試算です（登録後の精算計算と同じ均等割です）。</p>
        )}
      </fieldset>
    </div>
  );
}
