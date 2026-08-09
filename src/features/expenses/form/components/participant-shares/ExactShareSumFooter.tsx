"use client";

import { formatYen } from "@/shared/format/format-yen";
import { AlertCircle } from "lucide-react";

type Props = {
  amount: number;
  shareSum: number;
  exactSumValid: boolean;
};

export function ExactShareSumFooter({
  amount,
  shareSum,
  exactSumValid,
}: Props) {
  return (
    <div
      className="mt-3 flex flex-col gap-1"
      aria-live="polite"
      aria-atomic="true"
    >
      <p
        className={`flex items-center gap-1.5 text-[11px] font-semibold tabular-nums ${
          exactSumValid ? "text-emerald-600" : "text-red-600"
        }`}
      >
        {!exactSumValid ? (
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
        ) : null}
        合計 {formatYen(shareSum)} / {formatYen(amount)}
      </p>
      {!exactSumValid ? (
        <p className="text-[11px] text-red-600">
          合計が一致するまで登録できません。
        </p>
      ) : null}
    </div>
  );
}
