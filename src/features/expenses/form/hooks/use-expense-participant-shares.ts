import {
  buildShareAmountsFromEqual,
  resolveIncluded,
} from "@/features/expenses/form/model/participant-shares-state";
import {
  parseShareAmountForSum,
  parseShareAmountInput,
} from "@/features/expenses/form/model/parse-share-amount-input";
import type { ExpenseSplitMode } from "@/features/expenses/form/model/split-mode";
import type { ExpenseMember } from "@/features/expenses/form/model/expense-member";
import { isExactShareSumValid } from "@/features/expenses/form/model/validate-participant-shares";
import {
  computeExpenseShares,
  computeParticipantShares,
} from "@/features/settlement/balance/model/dashboard-balances";
import { useCallback, useEffect, useMemo, useState } from "react";

type Options = {
  members: ExpenseMember[];
  initialPayerId: string;
  initialParticipantIds?: string[];
  initialSplitMode?: ExpenseSplitMode;
  initialShareAmounts?: Record<string, number>;
  onCanSubmitChange?: (canSubmit: boolean) => void;
};

export function useExpenseParticipantShares({
  members,
  initialPayerId,
  initialParticipantIds,
  initialSplitMode = "equal",
  initialShareAmounts,
  onCanSubmitChange,
}: Options) {
  const [payerId, setPayerId] = useState(initialPayerId);
  const [splitMode, setSplitMode] = useState<ExpenseSplitMode>(initialSplitMode);
  const [included, setIncluded] = useState<Record<string, boolean>>(() =>
    resolveIncluded(members, initialPayerId, initialParticipantIds),
  );
  const [shareAmounts, setShareAmounts] = useState<
    Record<string, number | "">
  >(() => {
    if (initialSplitMode === "exact" && initialShareAmounts) {
      return { ...initialShareAmounts };
    }
    return {};
  });
  const [amount, setAmount] = useState(0);

  const resetState = useCallback(() => {
    setPayerId(initialPayerId);
    setSplitMode(initialSplitMode);
    setIncluded(resolveIncluded(members, initialPayerId, initialParticipantIds));
    setShareAmounts(
      initialSplitMode === "exact" && initialShareAmounts
        ? { ...initialShareAmounts }
        : {},
    );
  }, [
    initialPayerId,
    initialParticipantIds,
    initialShareAmounts,
    initialSplitMode,
    members,
  ]);

  const activeParticipantIds = useMemo(
    () => members.filter((m) => included[m.user_id]).map((m) => m.user_id),
    [members, included],
  );

  const equalShares = useMemo(
    () => computeParticipantShares(amount, payerId, activeParticipantIds),
    [amount, payerId, activeParticipantIds],
  );

  const displayShares = useMemo(() => {
    if (splitMode === "exact") {
      return computeExpenseShares({
        amount,
        payerId,
        participantIds: activeParticipantIds,
        splitMode: "exact",
        shareAmounts: Object.fromEntries(
          activeParticipantIds
            .map((uid) => {
              const parsed = parseShareAmountInput(shareAmounts[uid]);
              return parsed != null ? ([uid, parsed] as const) : null;
            })
            .filter((x): x is readonly [string, number] => x != null),
        ),
      });
    }
    return equalShares;
  }, [splitMode, amount, payerId, activeParticipantIds, shareAmounts, equalShares]);

  const shareSum = useMemo(() => {
    if (splitMode !== "exact") return 0;
    return activeParticipantIds.reduce(
      (sum, uid) => sum + parseShareAmountForSum(shareAmounts[uid]),
      0,
    );
  }, [splitMode, activeParticipantIds, shareAmounts]);

  const exactSumValid = useMemo(
    () =>
      splitMode !== "exact" ||
      isExactShareSumValid(amount, shareAmounts, activeParticipantIds),
    [splitMode, amount, shareAmounts, activeParticipantIds],
  );

  const canSubmit =
    activeParticipantIds.length > 0 &&
    (splitMode === "equal" || exactSumValid);

  useEffect(() => {
    onCanSubmitChange?.(canSubmit);
  }, [canSubmit, onCanSubmitChange]);

  const handleSplitModeChange = useCallback(
    (next: ExpenseSplitMode) => {
      if (next === splitMode) return;
      if (next === "exact" && amount > 0 && activeParticipantIds.length > 0) {
        setShareAmounts(
          buildShareAmountsFromEqual(amount, payerId, activeParticipantIds),
        );
      }
      if (next === "equal") {
        setShareAmounts({});
      }
      setSplitMode(next);
    },
    [splitMode, amount, payerId, activeParticipantIds],
  );

  const handleIncludedChange = useCallback(
    (userId: string, checked: boolean) => {
      setIncluded((prev) => {
        const next = { ...prev, [userId]: checked };
        if (splitMode === "exact" && amount > 0) {
          const nextActive = members
            .filter((m) => next[m.user_id])
            .map((m) => m.user_id);
          if (checked && !shareAmounts[userId]) {
            const remaining = Math.max(
              0,
              amount -
                nextActive
                  .filter((uid) => uid !== userId)
                  .reduce(
                    (sum, uid) => sum + parseShareAmountForSum(shareAmounts[uid]),
                    0,
                  ),
            );
            setShareAmounts((p) => ({
              ...p,
              [userId]: remaining > 0 ? remaining : "",
            }));
          }
          if (!checked) {
            setShareAmounts((p) => {
              const copy = { ...p };
              delete copy[userId];
              return copy;
            });
          }
        }
        return next;
      });
    },
    [splitMode, amount, members, shareAmounts],
  );

  const handlePayerChange = useCallback(
    (id: string) => {
      setPayerId(id);
      setIncluded(
        Object.fromEntries(members.map((m) => [m.user_id, m.user_id === id])),
      );
      if (splitMode === "exact") {
        setShareAmounts({});
      }
    },
    [members, splitMode],
  );

  return {
    payerId,
    splitMode,
    included,
    shareAmounts,
    amount,
    displayShares,
    shareSum,
    exactSumValid,
    canSubmit,
    setAmount,
    resetState,
    setShareAmounts,
    handleSplitModeChange,
    handleIncludedChange,
    handlePayerChange,
  };
}
