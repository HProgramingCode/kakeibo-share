import { ROUTES } from "@/shared/navigation/routes";
import Link from "next/link";
import type { GroupDetailMenuMember } from "./GroupDetailOverflowMenu";
import { GroupDetailOverflowMenu } from "./GroupDetailOverflowMenu";
import { Users } from "lucide-react";

type Props = {
  groupLabel: string;
  groupId: string;
  isOwner: boolean;
  initialDisplayName: string;
  menuMembers: GroupDetailMenuMember[];
};

export function GroupDetailScreenHeader({
  groupLabel,
  groupId,
  isOwner,
  initialDisplayName,
  menuMembers,
}: Props) {
  return (
    <header className="sticky top-0 z-30 -mx-6 border-b border-slate-100 bg-white/80 px-6 pb-6 pt-2 backdrop-blur-md shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={ROUTES.groups}
            aria-label="グループ一覧へ"
            className="inline-block rounded-md text-slate-950 no-underline transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          >
            <h1 className="text-xl font-black tracking-tight text-slate-950">
              みんなの精算
            </h1>
          </Link>
          <div className="mt-0.5 flex items-center gap-1">
            <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-emerald-500" />
            <span className="truncate text-[10px] font-bold uppercase tracking-widest text-slate-500">
              {groupLabel}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={ROUTES.groups}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 transition-all active:scale-95"
            aria-label="グループ一覧"
          >
            <Users className="h-5 w-5 text-slate-600" strokeWidth={1.75} />
          </Link>
          <GroupDetailOverflowMenu
            groupId={groupId}
            isOwner={isOwner}
            initialDisplayName={initialDisplayName}
            members={menuMembers}
          />
        </div>
      </div>
    </header>
  );
}
