"use client";

import type { ExpenseMember, PayerPickMember } from "@/features/expenses/form/model/expense-member";
import { ExpensePickerListbox } from "@/features/expenses/form/components/ExpensePickerListbox";
import { cn } from "@/shared/utils/utils";
import { useMemo, useState } from "react";

export type { PayerPickMember };

type Props = {
  members: PayerPickMember[];
  /** 非制御の既定値（value 未指定時のみ有効） */
  defaultUserId?: string;
  /** 制御モード */
  value?: string;
  onValueChange?: (userId: string) => void;
  name?: string;
  /** true のとき legend を視覚的に隠し、外側の見出しと二重にならないようにする */
  legendScreenReaderOnly?: boolean;
  /** true のときメニューを document.body に描画 */
  portal?: boolean;
  menuZIndex?: number;
};

/**
 * 立替者選択（カスタム listbox）。フォーム送信は hidden の name=payer_id（変更可）。
 */
export function PayerPickField({
  members,
  defaultUserId,
  value,
  onValueChange,
  name = "payer_id",
  legendScreenReaderOnly = false,
  portal = false,
  menuZIndex = 50,
}: Props) {
  const controlled = value !== undefined;
  const fallbackId = members[0]?.user_id ?? "";

  const [internalId, setInternalId] = useState(
    () => defaultUserId ?? fallbackId,
  );

  const rawSelected = controlled ? (value ?? fallbackId) : internalId;

  const resolvedId = useMemo(() => {
    if (members.some((m) => m.user_id === rawSelected)) return rawSelected;
    return fallbackId;
  }, [members, rawSelected, fallbackId]);

  const items = useMemo(
    () => members.map((m) => ({ id: m.user_id, label: m.label })),
    [members],
  );

  function handleValueChange(userId: string) {
    if (!controlled) setInternalId(userId);
    onValueChange?.(userId);
  }

  return (
    <fieldset className="min-w-0 space-y-2">
      <legend
        className={cn(
          "px-0.5 text-sm font-semibold text-slate-700",
          legendScreenReaderOnly && "sr-only",
        )}
      >
        立替者
      </legend>
      <ExpensePickerListbox
        items={items}
        value={resolvedId}
        onValueChange={handleValueChange}
        hiddenInputName={name}
        hiddenInputRequired
        placeholder="メンバーを選んでください"
        emptyLabel="メンバーを選んでください"
        portal={portal}
        menuZIndex={menuZIndex}
      />
    </fieldset>
  );
}

export type { ExpenseMember };
