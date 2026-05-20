"use client";

import { cn } from "@/lib/utils";
import { LayoutDashboard, NotebookPen, ScrollText } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

export type GroupDetailTabId = "dashboard" | "register" | "history";

type Props = {
  dashboard: ReactNode;
  register: ReactNode;
  history: ReactNode;
};

function tabFromHash(hash: string): GroupDetailTabId {
  if (hash === "monthly-settle") return "dashboard";
  if (hash === "expense-form") return "register";
  if (hash === "settled-expenses") return "history";
  if (hash === "history-unpaid-expenses") return "history";
  if (hash === "recent-expenses") return "dashboard";
  return "dashboard";
}

export function GroupDetailTabs({ dashboard, register, history }: Props) {
  const [tab, setTab] = useState<GroupDetailTabId>("dashboard");

  useEffect(() => {
    function applyHash() {
      const raw = window.location.hash.replace(/^#/, "");
      setTab(tabFromHash(raw));
      if (!raw) return;
      window.setTimeout(() => {
        const el = document.getElementById(raw);
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    }
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  const panels: Record<GroupDetailTabId, ReactNode> = {
    dashboard,
    register,
    history,
  };

  return (
    <div className="flex flex-col gap-6">
      <div
        className="-mx-1 flex rounded-[20px] border border-slate-100 bg-slate-50/80 p-1 shadow-inner"
        role="tablist"
        aria-label="グループ詳細のセクション"
      >
        <TabButton
          id="tab-dashboard"
          selected={tab === "dashboard"}
          onClick={() => setTab("dashboard")}
          icon={LayoutDashboard}
          label="ダッシュボード"
        />
        <TabButton
          id="tab-register"
          selected={tab === "register"}
          onClick={() => setTab("register")}
          icon={NotebookPen}
          label="支払い登録"
        />
        <TabButton
          id="tab-history"
          selected={tab === "history"}
          onClick={() => setTab("history")}
          icon={ScrollText}
          label="履歴"
        />
      </div>

      <div
        role="tabpanel"
        hidden={tab !== "dashboard"}
        className={tab === "dashboard" ? "" : "hidden"}
      >
        {panels.dashboard}
      </div>
      <div
        role="tabpanel"
        hidden={tab !== "register"}
        className={tab === "register" ? "" : "hidden"}
      >
        {panels.register}
      </div>
      <div
        role="tabpanel"
        hidden={tab !== "history"}
        className={tab === "history" ? "" : "hidden"}
      >
        {panels.history}
      </div>
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
