"use client";

import { EXPENSE_PICKER_MENU_PANEL_CLASS } from "@/features/expenses/lib/expense-picker-portal-geometry";
import {
  useExpensePickerListbox,
  type ExpensePickerItem,
} from "@/features/expenses/lib/hooks/use-expense-picker-listbox";
import { cn } from "@/lib/utils";
import { Check, ChevronDown } from "lucide-react";
import { createPortal } from "react-dom";

type Props = {
  items: ExpensePickerItem[];
  value: string;
  onValueChange: (id: string) => void;
  hiddenInputName: string;
  hiddenInputRequired?: boolean;
  placeholder?: string;
  portal?: boolean;
  menuZIndex?: number;
  disabled?: boolean;
  className?: string;
  emptyLabel?: string;
};

export function ExpensePickerListbox({
  items,
  value,
  onValueChange,
  hiddenInputName,
  hiddenInputRequired = false,
  placeholder = "選択してください",
  portal = false,
  menuZIndex = 50,
  disabled = false,
  className,
  emptyLabel,
}: Props) {
  const picker = useExpensePickerListbox({
    items,
    value,
    onValueChange,
    portal,
    disabled,
  });

  const displayLabel =
    items.length === 0 && emptyLabel
      ? emptyLabel
      : picker.displayLabel === "選択してください" && placeholder
        ? placeholder
        : picker.displayLabel;

  const triggerClass = cn(
    "flex min-h-[48px] w-full max-w-full min-w-0 cursor-pointer items-center justify-between gap-2 rounded-2xl border-2 border-slate-100 bg-white px-4 py-2.5 text-left text-sm font-semibold text-slate-800 shadow-sm outline-none transition-all duration-200",
    "hover:border-indigo-200 hover:bg-indigo-50/35 focus-visible:border-indigo-200 focus-visible:ring-2 focus-visible:ring-indigo-500/20",
    picker.open && "border-indigo-200 ring-2 ring-indigo-500/20",
    (disabled || items.length === 0) && "cursor-not-allowed opacity-60",
  );

  const menuPanel = (
    <div
      ref={picker.menuRef}
      id={picker.listId}
      role="listbox"
      tabIndex={-1}
      aria-labelledby={`${picker.baseId}-trigger`}
      aria-activedescendant={`${picker.baseId}-opt-${picker.highlight}`}
      className={cn(
        EXPENSE_PICKER_MENU_PANEL_CLASS,
        portal
          ? "fixed"
          : "absolute left-0 right-0 top-full z-10 mt-1.5 max-h-[min(18rem,calc(100dvh-10rem))] w-full min-w-0",
      )}
      style={
        portal && picker.portalGeom
          ? {
              top: picker.portalGeom.top,
              left: picker.portalGeom.left,
              width: picker.portalGeom.width,
              maxHeight: picker.portalGeom.maxHeight,
              zIndex: menuZIndex,
            }
          : undefined
      }
      onKeyDown={picker.onMenuKeyDown}
    >
      {items.map((item, i) => (
        <button
          key={item.id || "__none__"}
          id={`${picker.baseId}-opt-${i}`}
          type="button"
          role="option"
          aria-selected={value === item.id}
          className={cn(
            "flex w-full min-w-0 items-center justify-between gap-2 px-4 py-3 text-left text-sm font-semibold transition-colors",
            i === picker.highlight
              ? "bg-indigo-50 text-indigo-950"
              : "text-slate-800",
            value === item.id && "text-indigo-700",
          )}
          onMouseEnter={() => picker.setHighlight(i)}
          onClick={() => picker.commitSelection(item.id)}
        >
          <span className="min-w-0 flex-1 truncate">{item.label}</span>
          {value === item.id ? (
            <Check
              className="h-4 w-4 shrink-0 text-indigo-600"
              strokeWidth={2}
              aria-hidden
            />
          ) : (
            <span className="w-4 shrink-0" aria-hidden />
          )}
        </button>
      ))}
    </div>
  );

  return (
    <div
      className={cn("relative min-w-0", className)}
      style={{ zIndex: picker.open && !portal ? menuZIndex : undefined }}
    >
      <input
        type="hidden"
        name={hiddenInputName}
        value={value}
        required={hiddenInputRequired && items.length > 0}
      />
      <button
        ref={picker.btnRef}
        type="button"
        id={`${picker.baseId}-trigger`}
        className={triggerClass}
        aria-haspopup="listbox"
        aria-expanded={picker.open}
        aria-controls={picker.listId}
        disabled={disabled || items.length === 0}
        onClick={picker.toggleOpen}
        onKeyDown={picker.onButtonKeyDown}
      >
        <span className="truncate">{displayLabel}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-slate-400 transition-transform",
            picker.open && "rotate-180",
          )}
          strokeWidth={2}
          aria-hidden
        />
      </button>
      {picker.showAttachedPanel ? menuPanel : null}
      {picker.showPortalPanel
        ? createPortal(menuPanel, document.body)
        : null}
    </div>
  );
}
