"use client";

import { displayExpenseCategoryLabel } from "@/features/expenses/lib/domain/expense-category-display";
import { ExpensePickerListbox } from "@/features/expenses/ui/ExpensePickerListbox";
import { EXPENSE_CATEGORY_OPTIONS } from "@/lib/expense-categories";
import { useMemo, useState } from "react";

const OPTIONS: readonly string[] = ["", ...EXPENSE_CATEGORY_OPTIONS];

type Props = {
  name?: string;
  defaultValue?: string;
  /** ポータル時はオーバーレイより前面に */
  menuZIndex?: number;
  /** true のときメニューを document.body に描画（overflow 内でのクリップを避ける） */
  portal?: boolean;
  className?: string;
};

export function ExpenseCategoryPickField({
  name = "category",
  defaultValue = "",
  menuZIndex = 50,
  portal = false,
  className,
}: Props) {
  const [value, setValue] = useState(defaultValue);

  const items = useMemo(
    () =>
      OPTIONS.map((opt) => ({
        id: opt,
        label: displayExpenseCategoryLabel(opt),
      })),
    [],
  );

  return (
    <ExpensePickerListbox
      items={items}
      value={value}
      onValueChange={setValue}
      hiddenInputName={name}
      portal={portal}
      menuZIndex={menuZIndex}
      className={className}
    />
  );
}
