import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

/** OAuth との境界（主フォームから副オプションへ視線を段階的に誘導）。 */
export function AuthOAuthDivider() {
  return (
    <div className="relative py-1" role="separator" aria-label="別のログイン方法">
      <div className="absolute inset-0 flex items-center" aria-hidden>
        <span className="w-full border-t border-slate-200/90" />
      </div>
      <div className="relative flex justify-center">
        <span className="rounded-full border border-slate-100/90 bg-white/95 px-3 py-0.5 text-xs font-medium text-slate-400 shadow-sm">
          または
        </span>
      </div>
    </div>
  );
}

/** 認証ページ用。背景に淡い indigo 層、カードに内側ハイライトと入場のリズム。 */
export function AuthPageShell({ children }: Props) {
  return (
    <div className="relative isolate w-full overflow-x-clip pb-1">
      <div className="pointer-events-none absolute inset-x-0 -top-6 z-0 flex justify-center" aria-hidden>
        <div className="h-44 w-[min(100%,24rem)] rounded-[50%] bg-gradient-to-b from-indigo-100/45 via-indigo-50/25 to-transparent blur-2xl" />
      </div>
      <div
        className="pointer-events-none absolute -bottom-10 left-[55%] z-0 h-36 w-40 -translate-x-1/2 rounded-full bg-violet-100/30 blur-3xl sm:left-[60%]"
        aria-hidden
      />
      <div className="relative z-10 card-glass auth-card-enter p-8 ring-1 ring-inset ring-white/50 hover:!shadow-card sm:p-9">
        {children}
      </div>
    </div>
  );
}
