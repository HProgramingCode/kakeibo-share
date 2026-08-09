"use client";

import type { ExpenseFeedItemData } from "@/features/expenses/feed/model/expense-feed-item";
import {
  buildHistoryMonthOptions,
  filterBatchesByMonth,
  filterExpensesByMonth,
} from "../../_lib/history-filter";
import type { BatchRow } from "../../_lib/types";
import { EmptyState } from "@/shared/components/EmptyState";
import { History } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  HistoryStatusToggle,
  type HistoryStatusView,
} from "./HistoryStatusToggle";
import { SettlementBatchesList } from "./SettlementBatchesList";
import { SettledExpensesSection } from "./SettledExpensesSection";
import { UnpaidExpensesSection } from "./UnpaidExpensesSection";

function statusFromHash(hash: string): HistoryStatusView | null {
  if (hash === "settled-expenses") return "settled";
  if (hash === "history-unpaid-expenses") return "unpaid";
  return null;
}

type Props = {
  groupId: string;
  settledFeedItems: ExpenseFeedItemData[];
  unpaidFeedItems: ExpenseFeedItemData[];
  membersForExpenseEdit: { user_id: string; label: string }[];
  batches: BatchRow[];
  nameByUserId: Record<string, string>;
  initialMonth: string;
};

export function GroupDetailHistoryPanelClient({
  groupId,
  settledFeedItems,
  unpaidFeedItems,
  membersForExpenseEdit,
  batches,
  nameByUserId,
  initialMonth,
}: Props) {
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [statusView, setStatusView] = useState<HistoryStatusView>("unpaid");

  useEffect(() => {
    function applyHash() {
      const raw = window.location.hash.replace(/^#/, "");
      const fromHash = statusFromHash(raw);
      if (fromHash) setStatusView(fromHash);
    }
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  const monthOptions = useMemo(
    () =>
      buildHistoryMonthOptions(
        settledFeedItems,
        unpaidFeedItems,
        batches,
        initialMonth,
      ),
    [settledFeedItems, unpaidFeedItems, batches, initialMonth],
  );

  const filteredSettled = useMemo(
    () => filterExpensesByMonth(settledFeedItems, selectedMonth),
    [settledFeedItems, selectedMonth],
  );

  const filteredUnpaid = useMemo(
    () => filterExpensesByMonth(unpaidFeedItems, selectedMonth),
    [unpaidFeedItems, selectedMonth],
  );

  const filteredBatches = useMemo(
    () => filterBatchesByMonth(batches, selectedMonth),
    [batches, selectedMonth],
  );

  return (
    <div className="flex flex-col gap-8">
      {monthOptions.length > 0 ? (
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-semibold text-slate-700">月で絞り込み</span>
          <select
            className="input-field"
            value={selectedMonth}
            onChange={(ev) => setSelectedMonth(ev.target.value)}
            aria-label="月で絞り込み"
          >
            {monthOptions.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <HistoryStatusToggle
        value={statusView}
        onChange={setStatusView}
        settledCount={filteredSettled.length}
        unpaidCount={filteredUnpaid.length}
      />

      {statusView === "unpaid" ? (
        <UnpaidExpensesSection
          groupId={groupId}
          items={filteredUnpaid}
          membersForEdit={membersForExpenseEdit}
          selectedMonth={selectedMonth}
        />
      ) : (
        <>
          <SettledExpensesSection
            items={filteredSettled}
            selectedMonth={selectedMonth}
          />

          <section className="space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              精算履歴
            </h2>
            {filteredBatches.length === 0 ? (
              <EmptyState
                icon={
                  <History
                    className="h-6 w-6 text-slate-300"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                }
                title={`${selectedMonth} の精算履歴はまだありません`}
              />
            ) : (
              <SettlementBatchesList
                batches={filteredBatches}
                settledFeedItems={settledFeedItems}
                nameByUserId={nameByUserId}
              />
            )}
          </section>
        </>
      )}
    </div>
  );
}
