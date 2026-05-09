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
  editable?: boolean;
};
