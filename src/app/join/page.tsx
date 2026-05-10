import Link from "next/link";
import { acceptGroupInviteAction } from "@/features/groups/actions/group-invite-actions";
import { safeAuthRedirectPath } from "@/shared/lib/auth-redirect";
import { createClient } from "@/shared/supabase/server";
import { LogIn, UserPlus } from "lucide-react";

type Props = {
  searchParams?: Promise<{ token?: string; error?: string }>;
};

export default async function JoinPage({ searchParams }: Props) {
  const sp = await searchParams;
  const token = (sp?.token ?? "").trim();
  const err = sp?.error;

  if (!token) {
    return (
      <div className="card-glass p-7">
        <h1 className="text-xl font-bold text-slate-900">グループに参加</h1>
        <p className="mt-3 text-sm text-slate-600">招待リンクが無効です（token がありません）。</p>
        <Link href="/groups" className="mt-6 inline-block font-semibold text-indigo-600">
          グループ一覧へ
        </Link>
      </div>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const nextJoin = safeAuthRedirectPath(`/join?token=${encodeURIComponent(token)}`);

  if (!user) {
    const loginHref = `/login?next=${encodeURIComponent(nextJoin)}`;
    const signupHref = `/signup?next=${encodeURIComponent(nextJoin)}`;
    return (
      <div className="card-glass p-7">
        <h1 className="text-xl font-bold text-slate-900">グループに参加</h1>
        <p className="mt-3 text-sm text-slate-600">参加するにはログインまたはアカウント作成が必要です。</p>
        {err ? (
          <p className="mt-4 rounded-2xl border border-red-100 bg-red-50/80 px-4 py-3 text-sm text-red-800">
            {err}
          </p>
        ) : null}
        <div className="mt-7 flex flex-col gap-3">
          <Link
            href={loginHref}
            className="flex min-h-[44px] items-center justify-center gap-2 rounded-2xl bg-slate-950 py-3 text-sm font-semibold text-white"
          >
            <LogIn className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            ログインして参加
          </Link>
          <Link
            href={signupHref}
            className="flex min-h-[44px] items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-800"
          >
            <UserPlus className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            アカウントを作成して参加
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card-glass p-7">
      <h1 className="text-xl font-bold text-slate-900">グループに参加</h1>
      <p className="mt-3 text-sm text-slate-600">招待を承諾すると、このグループのメンバーに追加されます。</p>
      {err ? (
        <p className="mt-4 rounded-2xl border border-red-100 bg-red-50/80 px-4 py-3 text-sm text-red-800">
          {err}
        </p>
      ) : null}
      <form className="mt-7 flex flex-col gap-4" action={acceptGroupInviteAction}>
        <input type="hidden" name="token" value={token} />
        <button type="submit" className="btn-primary w-full">
          参加する
        </button>
      </form>
    </div>
  );
}
