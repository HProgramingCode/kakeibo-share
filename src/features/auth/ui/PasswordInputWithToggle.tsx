"use client";

import { Eye, EyeOff, Lock } from "lucide-react";
import { useState } from "react";
import type { ComponentProps } from "react";

type Props = Omit<ComponentProps<"input">, "type" | "className">;

/**
 * パスワードの表示切替。type=button でフォーム送信を起こさない。
 */
export function PasswordInputWithToggle(props: Props) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative isolate">
      <Lock
        className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-[18px] w-[18px] -translate-y-1/2 text-slate-400"
        strokeWidth={2}
        aria-hidden
      />
      <input
        type={show ? "text" : "password"}
        className="input-field relative z-0 pl-10 pr-12 active:scale-100"
        {...props}
      />
      <button
        type="button"
        className="absolute right-1 top-1/2 z-20 flex h-11 min-h-[44px] w-11 min-w-[44px] -translate-y-1/2 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 focus-visible:outline focus-visible:ring-2 focus-visible:ring-indigo-400/60 focus-visible:ring-offset-0"
        onClick={() => setShow((s) => !s)}
        aria-pressed={show}
        aria-label={show ? "パスワードを隠す" : "パスワードを表示"}
      >
        {show ? (
          <EyeOff className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />
        ) : (
          <Eye className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />
        )}
      </button>
    </div>
  );
}
