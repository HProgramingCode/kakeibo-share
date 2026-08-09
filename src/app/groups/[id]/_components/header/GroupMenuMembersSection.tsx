"use client";

import { GroupInviteLinkPanel } from "./GroupInviteLinkPanel";
import type { GroupDetailMenuMember } from "./group-detail-menu-member";

type Props = {
  groupId: string;
  isOwner: boolean;
  members: GroupDetailMenuMember[];
};

export function GroupMenuMembersSection({
  groupId,
  isOwner,
  members,
}: Props) {
  return (
    <section className="space-y-3" aria-label="メンバー">
      <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
        メンバー
      </h3>
      <ul className="flex flex-col gap-2 rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
        {members.map((m) => (
          <li
            key={m.user_id}
            className="flex items-center justify-between gap-2 text-sm font-medium text-slate-800"
          >
            <span className="min-w-0 truncate">{m.label}</span>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                m.role === "owner"
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {m.role === "owner" ? "オーナー" : "メンバー"}
            </span>
          </li>
        ))}
      </ul>
      {isOwner ? (
        <div className="max-w-full [&_.card-glass]:shadow-none">
          <GroupInviteLinkPanel groupId={groupId} />
        </div>
      ) : null}
    </section>
  );
}
