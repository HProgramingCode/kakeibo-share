"use client";

import { LogoutConfirmForm } from "@/features/auth/common/LogoutConfirmForm";
import { GroupMenuChartsLink } from "./GroupMenuChartsLink";
import { GroupMenuDisplayNameForm } from "./GroupMenuDisplayNameForm";
import { GroupMenuMembersSection } from "./GroupMenuMembersSection";
import { BottomSheetDialog } from "@/shared/components/BottomSheetDialog";
import { MoreVertical } from "lucide-react";
import { useCallback, useId, useState } from "react";

import type { GroupDetailMenuMember } from "./group-detail-menu-member";

const panelId = "group-detail-overflow-panel";

type Props = {
  groupId: string;
  isOwner: boolean;
  initialDisplayName: string;
  members: GroupDetailMenuMember[];
};

export function GroupDetailOverflowMenu({
  groupId,
  isOwner,
  initialDisplayName,
  members,
}: Props) {
  const titleId = useId();
  const [open, setOpen] = useState(false);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <>
      <button
        type="button"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 transition-all active:scale-95"
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="dialog"
        aria-label="その他のメニュー"
        onClick={() => setOpen(true)}
      >
        <MoreVertical
          className="h-5 w-5 text-slate-600"
          strokeWidth={1.75}
          aria-hidden
        />
      </button>
      <BottomSheetDialog
        open={open}
        onClose={close}
        titleId={titleId}
        title="メニュー"
        zIndex={200}
        scrollable
        panelId={panelId}
        className="pb-[max(1.5rem,env(safe-area-inset-bottom,0px))]"
      >
        <div className="flex flex-col gap-8 pb-2">
          <GroupMenuChartsLink groupId={groupId} onNavigate={close} />
          <GroupMenuMembersSection
            groupId={groupId}
            isOwner={isOwner}
            members={members}
          />
          <GroupMenuDisplayNameForm
            groupId={groupId}
            initialDisplayName={initialDisplayName}
          />
          <section aria-label="ログアウト" className="pb-2">
            <LogoutConfirmForm
              className="block w-full"
              buttonClassName="w-full rounded-2xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:ring-2 focus-visible:ring-indigo-400/55 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              showIcon={false}
            />
          </section>
        </div>
      </BottomSheetDialog>
    </>
  );
}

export type { GroupDetailMenuMember };
