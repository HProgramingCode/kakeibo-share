import { useEffect, type RefObject } from "react";

type ResetDeps = {
  initialPayerId: string;
  initialSplitMode: string;
  initialParticipantIds?: string[];
  initialShareAmounts?: Record<string, number>;
  members: { user_id: string; label: string }[];
  onAmount: (amount: number) => void;
  onReset: () => void;
};

/** 親 form の input[name="amount"] を監視し、reset 時に状態を戻す */
export function useFormAmountSync(
  containerRef: RefObject<HTMLElement | null>,
  {
    members,
    initialPayerId,
    initialParticipantIds,
    initialShareAmounts,
    initialSplitMode,
    onAmount,
    onReset,
  }: ResetDeps,
) {
  useEffect(() => {
    const form = containerRef.current?.closest("form");
    if (!form) return undefined;

    const readAmount = () => {
      const el = form.querySelector<HTMLInputElement>('input[name="amount"]');
      const raw = el?.value?.trim() ?? "";
      const v = Number.parseInt(raw, 10);
      onAmount(Number.isFinite(v) && v > 0 ? v : 0);
    };

    const resetSharesState = () => {
      onReset();
      readAmount();
    };

    form.addEventListener("input", readAmount);
    form.addEventListener("change", readAmount);
    form.addEventListener("reset", resetSharesState);
    readAmount();

    return () => {
      form.removeEventListener("input", readAmount);
      form.removeEventListener("change", readAmount);
      form.removeEventListener("reset", resetSharesState);
    };
  }, [
    containerRef,
    initialPayerId,
    initialParticipantIds,
    initialShareAmounts,
    initialSplitMode,
    members,
    onAmount,
    onReset,
  ]);
}
