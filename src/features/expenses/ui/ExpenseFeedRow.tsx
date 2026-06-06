"use client";

import type { ExpenseFeedItemData } from "@/features/expenses/lib/expense-feed-item";
import { formatExpenseDate } from "@/features/expenses/lib/format-expense-date";
import type { ExpenseCategory } from "@/lib/expense-categories";
import { formatYen } from "@/lib/format-yen";
import {
  ChevronRight,
  Gamepad2,
  MoreHorizontal,
  Pencil,
  Receipt,
  ShoppingBag,
  TrainFront,
  Utensils,
} from "lucide-react";

function categoryIcon(category: string | null) {
  switch (category as ExpenseCategory | null) {
    case "食費":
      return Utensils;
    case "日用品":
      return ShoppingBag;
    case "交通":
      return TrainFront;
    case "娯楽":
      return Gamepad2;
    case "その他":
      return MoreHorizontal;
    default:
      return Receipt;
  }
}

type Props = {
  item: ExpenseFeedItemData;
  canEdit: boolean;
  onEdit: () => void;
};

export function ExpenseFeedRow({ item, canEdit, onEdit }: Props) {
  const Icon = categoryIcon(item.category);
  const title = item.title?.trim() || "（摘要なし）";
  const showEdit = Boolean(item.editable && canEdit);

  return (
    <div className="group flex items-center justify-between rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md active:bg-slate-50">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] border border-slate-100 bg-slate-50 text-indigo-600 grayscale transition-all group-hover:grayscale-0">
          <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </div>
        <div className="min-w-0">
          <h3 className="line-clamp-1 text-sm font-bold text-slate-800">
            {title}
          </h3>
          <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {item.payerLabel} · {formatExpenseDate(item.expense_date)}
            {item.category ? ` · ${item.category}` : ""}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 pl-2">
        <div className="text-right">
          <p className="text-sm font-black tabular-nums text-slate-950">
            {formatYen(item.amount)}
          </p>
          <p className="text-[9px] font-bold text-slate-400">
            負担:{item.participantCount}人
          </p>
        </div>
        {showEdit ? (
          <button
            type="button"
            onClick={(ev) => {
              ev.preventDefault();
              ev.stopPropagation();
              onEdit();
            }}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-slate-500 transition-colors hover:border-indigo-100 hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline focus-visible:ring-2 focus-visible:ring-indigo-400"
            aria-label="支出を編集"
          >
            <Pencil className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </button>
        ) : null}
        <ChevronRight
          className="h-4 w-4 text-slate-300 transition-colors group-hover:text-indigo-600"
          strokeWidth={1.75}
          aria-hidden
        />
      </div>
    </div>
  );
}
