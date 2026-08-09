import { groupDetailPath } from "@/shared/navigation/routes";
import { BarChart3, ChevronLeft } from "lucide-react";
import Link from "next/link";

type Props = {
  groupId: string;
  groupLabel: string;
};

export function GroupSpendChartsScreenHeader({ groupId, groupLabel }: Props) {
  return (
    <header className="sticky top-0 z-30 -mx-6 border-b border-slate-100 bg-white/80 px-6 pb-6 pt-2 backdrop-blur-md shadow-sm">
      <div className="flex items-center gap-3">
        <Link
          href={groupDetailPath(groupId)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 transition-all active:scale-95"
          aria-label="グループ詳細へ戻る"
        >
          <ChevronLeft
            className="h-5 w-5 text-slate-600"
            strokeWidth={1.75}
          />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <BarChart3
              className="h-5 w-5 shrink-0 text-indigo-600"
              strokeWidth={1.75}
              aria-hidden
            />
            <h1 className="text-xl font-black tracking-tight text-slate-950">
              支出の推移
            </h1>
          </div>
          <div className="mt-0.5 flex items-center gap-1">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
            <span className="truncate text-[10px] font-bold uppercase tracking-widest text-slate-500">
              {groupLabel}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
