"use client";

import type { GroupDetailTabId } from "./group-detail-tab-id";
import type { ReactNode } from "react";

type Props = {
  activeTab: GroupDetailTabId;
  dashboard: ReactNode;
  register: ReactNode;
  history: ReactNode;
};

export function GroupDetailTabPanels({
  activeTab,
  dashboard,
  register,
  history,
}: Props) {
  return (
    <>
      <div
        role="tabpanel"
        hidden={activeTab !== "dashboard"}
        className={activeTab === "dashboard" ? "" : "hidden"}
      >
        {dashboard}
      </div>
      <div
        role="tabpanel"
        hidden={activeTab !== "register"}
        className={activeTab === "register" ? "" : "hidden"}
      >
        {register}
      </div>
      <div
        role="tabpanel"
        hidden={activeTab !== "history"}
        className={activeTab === "history" ? "" : "hidden"}
      >
        {history}
      </div>
    </>
  );
}
