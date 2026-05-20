"use client";

import {
  computeExpensePickerPortalMenuGeom,
  EXPENSE_PICKER_MENU_PANEL_CLASS,
} from "@/features/expenses/lib/expense-picker-portal-geometry";
import { EXPENSE_CATEGORY_OPTIONS } from "@/lib/expense-categories";
import { cn } from "@/lib/utils";
import { Check, ChevronDown } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactElement,
} from "react";
import { createPortal } from "react-dom";

const OPTIONS: readonly string[] = ["", ...EXPENSE_CATEGORY_OPTIONS];

function displayLabel(value: string): string {
  return value === "" ? "（なし）" : value;
}

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
  const baseId = useId();
  const listId = `${baseId}-listbox`;
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const [highlight, setHighlight] = useState(0);
  const [mounted, setMounted] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [portalGeom, setPortalGeom] = useState<ReturnType<
    typeof computeExpensePickerPortalMenuGeom
  > | null>(null);

  useEffect(() => setMounted(true), []);

  const updatePortalGeom = useCallback(() => {
    const el = btnRef.current;
    if (!el) return;
    setPortalGeom(
      computeExpensePickerPortalMenuGeom(el.getBoundingClientRect()),
    );
  }, []);

  useLayoutEffect(() => {
    if (!open || !portal) {
      setPortalGeom(null);
      return;
    }
    updatePortalGeom();
  }, [open, portal, updatePortalGeom]);

  useEffect(() => {
    if (!open || !portal) return;
    function onResize() {
      updatePortalGeom();
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [open, portal, updatePortalGeom]);

  useEffect(() => {
    if (!open) return;
    function closeOnScroll() {
      setOpen(false);
    }
    window.addEventListener("scroll", closeOnScroll, true);
    return () => window.removeEventListener("scroll", closeOnScroll, true);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onDocPointerDown(e: MouseEvent | PointerEvent) {
      const t = e.target as Node;
      if (btnRef.current?.contains(t)) return;
      if (menuRef.current?.contains(t)) return;
      setOpen(false);
    }
    document.addEventListener("pointerdown", onDocPointerDown);
    return () => document.removeEventListener("pointerdown", onDocPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const i = OPTIONS.indexOf(value);
    setHighlight(i >= 0 ? i : 0);
  }, [open, value]);

  function commitSelection(next: string) {
    setValue(next);
    setOpen(false);
    btnRef.current?.focus();
  }

  function onButtonKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) {
        if (portal) updatePortalGeom();
        setOpen(true);
        const i = OPTIONS.indexOf(value);
        setHighlight(i >= 0 ? i : 0);
      }
    }
  }

  function onMenuKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(OPTIONS.length - 1, h + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(0, h - 1));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const opt = OPTIONS[highlight];
      if (opt !== undefined) commitSelection(opt);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      btnRef.current?.focus();
    }
  }

  const triggerClass = cn(
    "flex min-h-[48px] w-full max-w-full min-w-0 cursor-pointer items-center justify-between gap-2 rounded-2xl border-2 border-slate-100 bg-white px-4 py-2.5 text-left text-sm font-semibold text-slate-800 shadow-sm outline-none transition-all duration-200",
    "hover:border-indigo-200 hover:bg-indigo-50/35 focus-visible:border-indigo-200 focus-visible:ring-2 focus-visible:ring-indigo-500/20",
    open && "border-indigo-200 ring-2 ring-indigo-500/20",
  );

  function renderMenuPanel(): ReactElement {
    return (
      <div
        ref={menuRef}
        id={listId}
        role="listbox"
        tabIndex={-1}
        aria-labelledby={`${baseId}-trigger`}
        aria-activedescendant={`${baseId}-opt-${highlight}`}
        className={cn(
          EXPENSE_PICKER_MENU_PANEL_CLASS,
          portal
            ? "fixed"
            : "absolute left-0 right-0 top-full z-10 mt-1.5 max-h-[min(18rem,calc(100dvh-10rem))] w-full min-w-0",
        )}
        style={
          portal && portalGeom
            ? {
                top: portalGeom.top,
                left: portalGeom.left,
                width: portalGeom.width,
                maxHeight: portalGeom.maxHeight,
                zIndex: menuZIndex,
              }
            : undefined
        }
        onKeyDown={onMenuKeyDown}
      >
        {OPTIONS.map((opt, i) => (
          <button
            key={opt || "__none__"}
            id={`${baseId}-opt-${i}`}
            type="button"
            role="option"
            aria-selected={value === opt}
            className={cn(
              "flex w-full min-w-0 items-center justify-between gap-2 px-4 py-3 text-left text-sm font-semibold transition-colors",
              i === highlight
                ? "bg-indigo-50 text-indigo-950"
                : "text-slate-800",
              value === opt && "text-indigo-700",
            )}
            onMouseEnter={() => setHighlight(i)}
            onClick={() => commitSelection(opt)}
          >
            <span className="min-w-0 flex-1 truncate">{displayLabel(opt)}</span>
            {value === opt ? (
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
  }

  const showPortalPanel = portal && mounted && open && portalGeom;
  const showAttachedPanel = !portal && open;

  return (
    <div
      className={cn("relative min-w-0", className)}
      style={{ zIndex: open && !portal ? menuZIndex : undefined }}
    >
      <input type="hidden" name={name} value={value} />
      <button
        ref={btnRef}
        type="button"
        id={`${baseId}-trigger`}
        className={triggerClass}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => {
          const next = !open;
          if (next && portal && btnRef.current) {
            setPortalGeom(
              computeExpensePickerPortalMenuGeom(
                btnRef.current.getBoundingClientRect(),
              ),
            );
          }
          if (!next) {
            setPortalGeom(null);
          }
          setOpen(next);
        }}
        onKeyDown={onButtonKeyDown}
      >
        <span className="truncate">{displayLabel(value)}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-slate-400 transition-transform",
            open && "rotate-180",
          )}
          strokeWidth={2}
          aria-hidden
        />
      </button>
      {showAttachedPanel ? renderMenuPanel() : null}
      {showPortalPanel ? createPortal(renderMenuPanel(), document.body) : null}
    </div>
  );
}
