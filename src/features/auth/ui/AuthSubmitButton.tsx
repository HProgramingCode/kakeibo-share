"use client";

import { PendingButton } from "@/shared/ui/PendingButton";
import { useFormStatus } from "react-dom";

type Props = {
  label: string;
  pendingLabel: string;
  /** 未指定時は認証フォーム用のサイズ・太さ */
  className?: string;
};

const authFormClass =
  "btn-primary w-full py-4 text-[0.9375rem] font-bold tracking-tight";

export function AuthSubmitButton({ label, pendingLabel, className }: Props) {
  const { pending } = useFormStatus();
  const cls = className ?? authFormClass;

  return (
    <PendingButton type="submit" pending={pending} pendingLabel={pendingLabel} className={cls}>
      {label}
    </PendingButton>
  );
}
