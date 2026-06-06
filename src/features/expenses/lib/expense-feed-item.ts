import type { ExpenseSplitMode } from "@/features/expenses/lib/split-mode";

export type ExpenseFeedItemData = {
  id: string;
  amount: number;
  expense_date: string;
  title: string | null;
  category: string | null;
  payerLabel: string;
  participantsLine: string;
  participantCount: number;
  payerId?: string;
  participantIds?: string[];
  splitMode?: ExpenseSplitMode;
  participantShares?: Record<string, number>;
  editable?: boolean;
};
