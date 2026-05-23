"use client";

import { GroupDetailTabBar } from "@/features/groups/group-detail/ui/GroupDetailTabBar";
import { GroupDetailTabPanels } from "@/features/groups/group-detail/ui/GroupDetailTabPanels";
import { tabFromHash } from "@/features/groups/group-detail/ui/group-detail-tab-id";
import type { GroupDetailTabId } from "@/features/groups/group-detail/ui/group-detail-tab-id";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

type Props = {
  dashboard: ReactNode;
  register: ReactNode;
  history: ReactNode;
};

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

  return (
    <div className="flex flex-col gap-6">
      <GroupDetailTabBar activeTab={tab} onTabChange={setTab} />
      <GroupDetailTabPanels
        activeTab={tab}
        dashboard={dashboard}
        register={register}
        history={history}
      />
    </div>
  );
}

export type { GroupDetailTabId } from "@/features/groups/group-detail/ui/group-detail-tab-id";
