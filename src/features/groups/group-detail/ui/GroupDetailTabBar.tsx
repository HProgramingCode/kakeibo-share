"use client";

import type { GroupDetailTabId } from "@/features/groups/group-detail/ui/group-detail-tab-id";
import { cn } from "@/lib/utils";
import { LayoutDashboard, NotebookPen, ScrollText } from "lucide-react";

export type { GroupDetailTabId } from "@/features/groups/group-detail/ui/group-detail-tab-id";

type Props = {
  activeTab: GroupDetailTabId;
  onTabChange: (tab: GroupDetailTabId) => void;
};

export function GroupDetailTabBar({ activeTab, onTabChange }: Props) {
  return (
    <div
      className="-mx-1 flex rounded-[20px] border border-slate-100 bg-slate-50/80 p-1 shadow-inner"
      role="tablist"
      aria-label="グループ詳細のセクション"
    >
      <TabButton
        id="tab-dashboard"
        selected={activeTab === "dashboard"}
        onClick={() => onTabChange("dashboard")}
        icon={LayoutDashboard}
        label="ダッシュボード"
      />
      <TabButton
        id="tab-register"
        selected={activeTab === "register"}
        onClick={() => onTabChange("register")}
        icon={NotebookPen}
        label="支払い登録"
      />
      <TabButton
        id="tab-history"
        selected={activeTab === "history"}
        onClick={() => onTabChange("history")}
        icon={ScrollText}
        label="履歴"
      />
    </div>
  );
}

function TabButton({
  id,
  selected,
  onClick,
  icon: Icon,
  label,
}: {
  id: string;
  selected: boolean;
  onClick: () => void;
  icon: typeof LayoutDashboard;
  label: string;
}) {
  return (
    <button
      id={id}
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={onClick}
      className={cn(
        "flex min-h-[44px] flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl px-2 py-2 text-[10px] font-black uppercase tracking-wider transition-all duration-200",
        selected
          ? "bg-white text-indigo-600 shadow-md"
          : "text-slate-500 hover:bg-white/60 hover:text-slate-700",
      )}
    >
      <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
      <span className="leading-tight">{label}</span>
    </button>
  );
}
