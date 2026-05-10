"use client";

import { LogOut, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

type Props = {
  /** トリガー直下のラッパー（例: display 調整） */
  className?: string;
  /** 開くボタン（variant 既定を上書き） */
  buttonClassName?: string;
  /** false のときアイコンなし（狭いヘッダー用） */
  showIcon?: boolean;
  children?: ReactNode;
};

const defaultButtonClass =
  "inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-2xl px-3 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus-visible:outline focus-visible:ring-2 focus-visible:ring-indigo-400/55 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-[0.98] motion-reduce:active:scale-100";

/**
 * 誤タップ防止のため、POST 前にアプリ内モーダルで確認する。
 */
export function LogoutConfirmForm({
  className,
  buttonClassName = defaultButtonClass,
  showIcon = true,
  children,
}: Props) {
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  const overlay =
    open && mounted ? (
      <div
        className="fixed inset-0 z-[220] flex items-end justify-center sm:items-center sm:p-4"
        role="presentation"
      >
        <button
          type="button"
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
          aria-label="閉じる"
          onClick={close}
        />
        <div
          className="relative z-10 w-full max-w-md rounded-t-[28px] border border-slate-100 bg-white p-6 shadow-2xl sm:rounded-[28px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          style={{
            paddingBottom: "max(1.5rem, env(safe-area-inset-bottom, 0px))",
          }}
        >
          <div className="mb-5 flex items-start justify-between gap-3">
            <h2 id={titleId} className="text-base font-black text-slate-900">
              ログアウトしますか？
            </h2>
            <button
              type="button"
              onClick={close}
              className="shrink-0 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              aria-label="閉じる"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
          <form
            action="/logout"
            method="post"
            className="flex flex-col gap-3 sm:flex-row sm:justify-end"
          >
            <button
              type="button"
              onClick={close}
              className="btn-secondary order-2 w-full sm:order-1 sm:w-auto"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="btn-primary order-1 w-full sm:order-2 sm:w-auto"
            >
              ログアウト
            </button>
          </form>
        </div>
      </div>
    ) : null;

  return (
    <>
      <div className={className}>
        <button
          type="button"
          className={buttonClassName}
          onClick={() => setOpen(true)}
        >
          {showIcon ? (
            <LogOut
              className="h-4 w-4 shrink-0 opacity-80"
              strokeWidth={2}
              aria-hidden
            />
          ) : null}
          {children ?? "ログアウト"}
        </button>
      </div>
      {mounted && overlay ? createPortal(overlay, document.body) : null}
    </>
  );
}
