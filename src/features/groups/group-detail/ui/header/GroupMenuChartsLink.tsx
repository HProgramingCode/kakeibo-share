"use client";

import { groupChartsPath } from "@/lib/routes";
import { BarChart3, ChevronRight } from "lucide-react";
import Link from "next/link";

type Props = {
  groupId: string;
  onNavigate: () => void;
};

export function GroupMenuChartsLink({ groupId, onNavigate }: Props) {
  return (
    <section className="space-y-3" aria-label="このグループ">
      <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
        このグループ
      </h3>
      <Link
        href={groupChartsPath(groupId)}
        onClick={onNavigate}
        className="group flex items-center gap-4 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 transition-all hover:border-indigo-200 active:scale-[0.99]"
      >
        <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600 shadow-inner">
          <BarChart3 className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-900">支出の推移</p>
          <p className="text-xs text-slate-500">
            月ごとの合計と開始からの平均月額
          </p>
        </div>
        <ChevronRight
          className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5"
          strokeWidth={1.75}
          aria-hidden
        />
      </Link>
    </section>
  );
}
