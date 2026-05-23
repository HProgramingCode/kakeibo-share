import { LogoutConfirmForm } from "@/features/auth/ui/LogoutConfirmForm";
import { requireAuthContext } from "@/features/auth/lib/require-auth-context";
import { loadGroupListPageData } from "@/features/groups/lib/services/group-list-service";
import { GroupsDestructiveAlert } from "@/features/groups/shared/GroupsDestructiveAlert";
import { DeleteGroupConfirmForm } from "@/features/groups/ui/DeleteGroupConfirmForm";
import Link from "next/link";
import { EmptyState } from "@/features/shared/ui/EmptyState";
import { Plus, UsersRound } from "lucide-react";
import { groupDetailPath, ROUTES } from "@/lib/routes";

export default async function GroupsPage() {
  const { supabase, user } = await requireAuthContext();

  const loadResult = await loadGroupListPageData(supabase, user.id);

  if (loadResult.kind === "error") {
    return (
      <GroupsDestructiveAlert>
        読み込みに失敗しました: {loadResult.message}
      </GroupsDestructiveAlert>
    );
  }

  const rows = loadResult.rows;

  return (
    <div className="flex flex-col gap-8">
      <header className="sticky top-0 z-30 -mx-6 border-b border-slate-100 bg-white/80 px-6 pb-6 pt-2 backdrop-blur-md shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-black tracking-tight text-slate-950">
              みんなの精算
            </h1>
            <div className="mt-0.5 flex items-center gap-1">
              <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-emerald-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                グループ一覧
              </span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3 sm:gap-4">
            <Link
              href={ROUTES.groupsNew}
              className="inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-2xl border border-indigo-200/90 bg-indigo-50/90 px-3.5 text-sm font-semibold text-indigo-800 shadow-sm transition-all hover:border-indigo-300 hover:bg-indigo-50 focus-visible:outline focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-[0.98] motion-reduce:active:scale-100 sm:px-4"
            >
              <Plus
                className="h-4 w-4 shrink-0"
                strokeWidth={2.25}
                aria-hidden
              />
              <span>作成</span>
            </Link>
            <span className="h-7 w-px shrink-0 bg-slate-200" aria-hidden />
            <LogoutConfirmForm />
          </div>
        </div>
      </header>

      {rows.length === 0 ? (
        <EmptyState
          icon={
            <UsersRound
              className="h-6 w-6 text-slate-300"
              strokeWidth={1.5}
              aria-hidden
            />
          }
          title="グループがまだありません"
          description="「作成」から新しいグループを作れます"
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((row) => {
            const gid = row.groups?.id ?? row.group_id;
            const groupName = row.groups?.name ?? "（無題）";
            const isOwner = row.role === "owner";

            return (
              <li key={row.group_id}>
                <div className="flex items-stretch gap-1 rounded-3xl border border-slate-100 bg-white shadow-card transition-all duration-200 hover:shadow-card-hover">
                  <Link
                    href={groupDetailPath(gid)}
                    className="flex min-w-0 flex-1 items-center justify-between gap-4 px-5 py-5 active:scale-[0.98]"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">
                        {groupName}
                      </p>
                      <p className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-400">
                        {row.role}
                      </p>
                    </div>
                  </Link>
                  {isOwner ? (
                    <DeleteGroupConfirmForm
                      groupId={gid}
                      groupName={groupName}
                      className="flex shrink-0 items-center pr-3"
                    />
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
