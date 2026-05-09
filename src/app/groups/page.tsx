import Link from "next/link";
import { createClient } from "@/shared/supabase/server";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ChevronRight, UsersRound } from "lucide-react";
import { redirect } from "next/navigation";

type GroupRow = {
  group_id: string;
  role: string;
  groups: { id: string; name: string; created_at: string } | null;
};

export default async function GroupsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("group_members")
    .select("group_id, role, groups ( id, name, created_at )")
    .eq("user_id", user.id);

  if (error) {
    return (
      <div className="rounded-3xl border border-red-100 bg-red-50/80 p-5 text-sm text-red-800">
        読み込みに失敗しました: {error.message}
      </div>
    );
  }

  const rows = (data ?? []) as unknown as GroupRow[];

  return (
    <div className="flex flex-col gap-8">
      <header className="sticky top-0 z-30 -mx-6 border-b border-slate-100 bg-white/80 px-6 pb-6 pt-2 backdrop-blur-md shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-black tracking-tight text-slate-950">みんなの精算</h1>
            <div className="mt-0.5 flex items-center gap-1">
              <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-emerald-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                グループ一覧
              </span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <Link
              href="/groups/new"
              className="inline-flex min-h-[2.5rem] items-center text-[10px] font-black uppercase tracking-widest leading-none text-indigo-600 opacity-80 transition-opacity hover:opacity-100"
            >
              作成
            </Link>
            <form action="/logout" method="post" className="inline-flex items-center">
              <button
                type="submit"
                className="inline-flex min-h-[2.5rem] items-center text-[10px] font-black uppercase tracking-widest leading-none text-slate-400 transition-colors hover:text-slate-600 active:scale-95"
              >
                ログアウト
              </button>
            </form>
          </div>
        </div>
      </header>

      {rows.length === 0 ? (
        <EmptyState
          icon={<UsersRound className="h-6 w-6 text-slate-300" strokeWidth={1.5} aria-hidden />}
          title="グループがまだありません"
          description="「作成」から新しいグループを作れます"
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((row) => {
            const gid = row.groups?.id ?? row.group_id;
            return (
              <li key={row.group_id}>
                <Link
                  href={`/groups/${gid}`}
                  className="flex items-center justify-between gap-4 rounded-3xl border border-slate-100 bg-white px-5 py-5 shadow-card transition-all duration-200 hover:shadow-card-hover active:scale-[0.98]"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">
                      {row.groups?.name ?? "（無題）"}
                    </p>
                    <p className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-400">
                      {row.role}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-50">
                    <ChevronRight className="h-5 w-5 text-slate-400" strokeWidth={1.75} />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
