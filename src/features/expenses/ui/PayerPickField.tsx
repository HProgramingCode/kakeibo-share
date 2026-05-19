"use client";

import {
  computeExpensePickerPortalMenuGeom,
  EXPENSE_PICKER_MENU_PANEL_CLASS,
} from "@/features/expenses/lib/expense-picker-portal-geometry";
import { cn } from "@/lib/utils";
import { Check, ChevronDown } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
} from "react";
import { createPortal } from "react-dom";

export type PayerPickMember = { user_id: string; label: string };

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
 * 支払者選択（カスタム listbox）。フォーム送信は hidden の name=payer_id（変更可）。
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

  const baseId = useId();
  const listId = `${baseId}-listbox`;
  const [open, setOpen] = useState(false);
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
    const i = members.findIndex((m) => m.user_id === resolvedId);
    setHighlight(i >= 0 ? i : 0);
  }, [open, members, resolvedId]);

  const displayLabel =
    members.find((m) => m.user_id === resolvedId)?.label ??
    "メンバーを選んでください";

  function commitSelection(userId: string) {
    if (!controlled) setInternalId(userId);
    onValueChange?.(userId);
    setOpen(false);
    btnRef.current?.focus();
  }

  function onButtonKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (members.length === 0) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) {
        if (portal) updatePortalGeom();
        setOpen(true);
        const i = members.findIndex((m) => m.user_id === resolvedId);
        setHighlight(i >= 0 ? i : 0);
      }
    }
  }

  function onMenuKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const n = members.length;
    if (n === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(n - 1, h + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(0, h - 1));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const row = members[highlight];
      if (row) commitSelection(row.user_id);
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
    members.length === 0 && "cursor-not-allowed opacity-60",
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
        {members.map((m, i) => (
          <button
            key={m.user_id}
            id={`${baseId}-opt-${i}`}
            type="button"
            role="option"
            aria-selected={resolvedId === m.user_id}
            className={cn(
              "flex w-full min-w-0 items-center justify-between gap-2 px-4 py-3 text-left text-sm font-semibold transition-colors",
              i === highlight
                ? "bg-indigo-50 text-indigo-950"
                : "text-slate-800",
              resolvedId === m.user_id && "text-indigo-700",
            )}
            onMouseEnter={() => setHighlight(i)}
            onClick={() => commitSelection(m.user_id)}
          >
            <span className="min-w-0 flex-1 truncate">{m.label}</span>
            {resolvedId === m.user_id ? (
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

  const showPortalPanel =
    portal && mounted && open && portalGeom && members.length > 0;
  const showAttachedPanel = !portal && open && members.length > 0;

  return (
    <fieldset className="min-w-0 space-y-2">
      <legend
        className={cn(
          "px-0.5 text-sm font-semibold text-slate-700",
          legendScreenReaderOnly && "sr-only",
        )}
      >
        支払者
      </legend>
      <div
        className="relative min-w-0"
        style={{ zIndex: open && !portal ? menuZIndex : undefined }}
      >
        <input
          type="hidden"
          name={name}
          value={resolvedId}
          required={members.length > 0}
        />
        <button
          ref={btnRef}
          type="button"
          id={`${baseId}-trigger`}
          className={triggerClass}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          disabled={members.length === 0}
          onClick={() => {
            if (members.length === 0) return;
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
          <span className="truncate">{displayLabel}</span>
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
        {showPortalPanel
          ? createPortal(renderMenuPanel(), document.body)
          : null}
      </div>
    </fieldset>
  );
}
