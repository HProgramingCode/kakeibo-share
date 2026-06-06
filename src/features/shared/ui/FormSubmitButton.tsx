"use client";

import { PendingButton } from "@/features/shared/ui/PendingButton";
import { useFormStatus } from "react-dom";

type Props = {
  label: string;
  pendingLabel: string;
  className?: string;
  disabled?: boolean;
};

export function FormSubmitButton({
  label,
  pendingLabel,
  className = "btn-primary w-full",
  disabled = false,
}: Props) {
  const { pending } = useFormStatus();

  return (
    <PendingButton
      type="submit"
      pending={pending}
      pendingLabel={pendingLabel}
      disabled={disabled}
      className={className}
    >
      {label}
    </PendingButton>
  );
}
