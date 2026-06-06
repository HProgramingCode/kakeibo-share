"use client";

import { ExpenseCategoryPickField } from "@/features/expenses/ui/ExpenseCategoryPickField";
import { ExpenseDatePickField } from "@/features/expenses/ui/ExpenseDatePickField";

type DefaultValues = {
  amount?: number;
  expense_date?: string;
  title?: string;
  category?: string;
};

type Props = {
  defaultValues?: DefaultValues;
  categoryPortal?: boolean;
  categoryMenuZIndex?: number;
};

export function ExpenseFormFields({
  defaultValues,
  categoryPortal = false,
  categoryMenuZIndex = 50,
}: Props) {
  return (
    <>
      <label className="flex min-w-0 flex-col gap-2 text-sm">
        <span className="font-semibold text-slate-700">金額（円）</span>
        <input
          className="input-field"
          type="number"
          name="amount"
          min={1}
          step={1}
          required
          defaultValue={defaultValues?.amount}
        />
      </label>
      <div className="flex min-w-0 flex-col gap-2 text-sm">
        <span className="font-semibold text-slate-700">支出日</span>
        <ExpenseDatePickField
          name="expense_date"
          defaultValue={defaultValues?.expense_date ?? ""}
          required
        />
      </div>
      <label className="flex min-w-0 flex-col gap-2 text-sm">
        <span className="font-semibold text-slate-700">摘要</span>
        <input
          className="input-field"
          name="title"
          placeholder="例: スーパー"
          defaultValue={defaultValues?.title ?? ""}
        />
      </label>
      <div className="flex min-w-0 flex-col gap-2 text-sm">
        <span className="font-semibold text-slate-700">カテゴリ</span>
        <ExpenseCategoryPickField
          defaultValue={defaultValues?.category ?? ""}
          menuZIndex={categoryMenuZIndex}
          portal={categoryPortal}
        />
      </div>
    </>
  );
}
