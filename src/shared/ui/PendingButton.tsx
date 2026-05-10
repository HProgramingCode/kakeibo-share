"use client";

import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** 処理中は disabled・aria-busy・スピナー＋文言を表示 */
  pending: boolean;
  pendingLabel: string;
  children: ReactNode;
};

/**
 * Server Action／fetch などの保留中でも同じ視覚・a11y パターンに揃えるためのボタン。
 */
export function PendingButton({ pending, pendingLabel, children, className, disabled, ...rest }: Props) {
  return (
    <button
      {...rest}
      disabled={pending || !!disabled}
      aria-busy={pending}
      className={className}
    >
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2
            className="h-4 w-4 shrink-0 animate-spin motion-reduce:animate-none"
            aria-hidden
          />
          {pendingLabel}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
