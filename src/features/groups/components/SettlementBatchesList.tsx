import type { BatchRow } from "@/features/groups/lib/types/group-detail-screen.types";
import { formatYen } from "@/shared/lib/format-yen";

type Props = {
  batches: BatchRow[];
  nameByUserId: Map<string, string>;
};

export function SettlementBatchesList({ batches, nameByUserId }: Props) {
  return (
    <ul className="flex flex-col gap-3">
      {batches.map((b) => {
        const transfers = b.settlement_transfers ?? [];
        return (
          <li key={b.id} className="card-glass p-5">
            <p className="font-semibold text-slate-900">
              {b.target_month}{" "}
              <span className="font-normal text-slate-400">
                · {new Date(b.created_at).toLocaleString("ja-JP")}
              </span>
            </p>
            {transfers.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">送金ペアなし</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {transfers.map((t, i) => (
                  <li key={i} className="font-medium">
                    {nameByUserId.get(t.from_user_id) ?? t.from_user_id}{" "}
                    <span className="text-slate-400">→</span>{" "}
                    {nameByUserId.get(t.to_user_id) ?? t.to_user_id}{" "}
                    <span className="font-mono font-black tracking-tighter text-slate-900">
                      {formatYen(t.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}
