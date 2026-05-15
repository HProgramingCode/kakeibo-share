"use client";

import { PendingButton } from "@/shared/ui/PendingButton";
import { useFormStatus } from "react-dom";

type Props = {
  label: string;
  pendingLabel: string;
  className?: string;
};

export function FormSubmitButton({
  label,
  pendingLabel,
  className = "btn-primary w-full",
}: Props) {
  const { pending } = useFormStatus();

  return (
    <PendingButton
      type="submit"
      pending={pending}
      pendingLabel={pendingLabel}
      className={className}
    >
      {label}
    </PendingButton>
  );
}
