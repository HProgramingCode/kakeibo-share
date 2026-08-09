"use client";

import { useExpenseParticipantShares } from "@/features/expenses/form/hooks/use-expense-participant-shares";
import { useFormAmountSync } from "@/features/expenses/form/hooks/use-form-amount-sync";
import type { ExpenseSplitMode } from "@/features/expenses/form/model/split-mode";
import type {
  ExpenseMember,
  ParticipantPickMember,
} from "@/features/expenses/form/model/expense-member";
import { PayerPickField } from "@/features/expenses/form/components/PayerPickField";
import { ParticipantSharesFieldset } from "@/features/expenses/form/components/participant-shares/ParticipantSharesFieldset";
import { SplitModeToggle } from "@/features/expenses/form/components/SplitModeToggle";
import { useRef } from "react";

export type { ParticipantPickMember };

type Props = {
  members: ParticipantPickMember[];
  initialPayerId: string;
  /** 編集時のみ。負担に含まれていたユーザー ID */
  initialParticipantIds?: string[];
  initialSplitMode?: ExpenseSplitMode;
  initialShareAmounts?: Record<string, number>;
  payerLegendScreenReaderOnly?: boolean;
  payerPickerPortal?: boolean;
  payerPickerMenuZIndex?: number;
  onCanSubmitChange?: (canSubmit: boolean) => void;
};

export function ExpenseParticipantSharesSection({
  members,
  initialPayerId,
  initialParticipantIds,
  initialSplitMode = "equal",
  initialShareAmounts,
  payerLegendScreenReaderOnly = false,
  payerPickerPortal = false,
  payerPickerMenuZIndex = 50,
  onCanSubmitChange,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const shares = useExpenseParticipantShares({
    members,
    initialPayerId,
    initialParticipantIds,
    initialSplitMode,
    initialShareAmounts,
    onCanSubmitChange,
  });

  useFormAmountSync(containerRef, {
    members,
    initialPayerId,
    initialParticipantIds,
    initialSplitMode,
    initialShareAmounts,
    onAmount: shares.setAmount,
    onReset: shares.resetState,
  });

  return (
    <div ref={containerRef} className="flex flex-col gap-4">
      <PayerPickField
        members={members}
        value={shares.payerId}
        onValueChange={shares.handlePayerChange}
        legendScreenReaderOnly={payerLegendScreenReaderOnly}
        portal={payerPickerPortal}
        menuZIndex={payerPickerMenuZIndex}
      />

      <SplitModeToggle
        value={shares.splitMode}
        onValueChange={shares.handleSplitModeChange}
      />

      <ParticipantSharesFieldset
        members={members}
        payerId={shares.payerId}
        splitMode={shares.splitMode}
        included={shares.included}
        shareAmounts={shares.shareAmounts}
        amount={shares.amount}
        displayShares={shares.displayShares}
        shareSum={shares.shareSum}
        exactSumValid={shares.exactSumValid}
        onIncludedChange={shares.handleIncludedChange}
        onShareAmountChange={(userId, value) =>
          shares.setShareAmounts((p) => ({ ...p, [userId]: value }))
        }
      />
    </div>
  );
}

export type { ExpenseMember };
