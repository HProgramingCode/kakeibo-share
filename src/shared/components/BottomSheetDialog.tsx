"use client";

import { useBodyScrollLock } from "@/shared/hooks/use-body-scroll-lock";
import { cn } from "@/shared/utils/utils";
import { X } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useState, type ReactNode } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  titleId: string;
  title: string;
  children: ReactNode;
  zIndex?: number;
  /** スクロール可能な本文（EditSheet / OverflowMenu 用） */
  scrollable?: boolean;
  panelId?: string;
  /** コンパクトな確認ダイアログ（Logout / Delete 用） */
  compact?: boolean;
  className?: string;
};

export function BottomSheetDialog({
  open,
  onClose,
  titleId,
  title,
  children,
  zIndex = 100,
  scrollable = false,
  panelId,
  compact = false,
  className,
}: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useBodyScrollLock(open, onClose);

  if (!open || !mounted) return null;

  const panelClass = compact
    ? "relative z-10 w-full max-w-md rounded-t-[28px] border border-slate-100 bg-white p-6 shadow-2xl sm:rounded-[28px]"
    : "relative z-10 flex max-h-[min(90dvh,100dvh)] w-full max-w-md min-h-0 flex-col overflow-hidden rounded-t-[28px] border border-slate-100 bg-white shadow-2xl sm:max-h-[min(85dvh,100dvh)] sm:rounded-[28px]";

  const content = (
    <div
      className="fixed inset-0 flex items-end justify-center sm:items-center sm:p-4"
      style={{ zIndex }}
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
        aria-label="閉じる"
        onClick={onClose}
      />
      <div
        id={panelId}
        className={cn(panelClass, className)}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        style={{
          paddingBottom: "max(1.5rem, env(safe-area-inset-bottom, 0px))",
        }}
      >
        {compact ? (
          children
        ) : (
          <>
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-6 pb-4 pt-6">
              <h2 id={titleId} className="text-base font-black text-slate-900">
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                aria-label="閉じる"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <div
              className={cn(
                scrollable &&
                  "min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-6 pb-6 pt-5 touch-pan-y",
                !scrollable && "px-6 pb-6 pt-5",
              )}
            >
              {children}
            </div>
          </>
        )}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
