"use client";

import { FormSubmitButton } from "@/features/shared/ui/FormSubmitButton";

type Props = {
  label: string;
  pendingLabel: string;
  /** 未指定時は認証フォーム用のサイズ・太さ */
  className?: string;
};

const authFormClass =
  "btn-primary w-full py-4 text-[0.9375rem] font-bold tracking-tight";

export function AuthSubmitButton({ label, pendingLabel, className }: Props) {
  const cls = className ?? authFormClass;

  return <FormSubmitButton label={label} pendingLabel={pendingLabel} className={cls} />;
}
