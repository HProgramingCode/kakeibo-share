import { LogoutConfirmForm } from "@/features/auth/ui/components/LogoutConfirmForm";
import Link from "next/link";
import { createGroupAction } from "@/features/groups/actions/create-group-action";
import { FolderKanban } from "lucide-react";

type Props = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function NewGroupPage({ searchParams }: Props) {
  const params = await searchParams;
  const error = params?.error;

  return (
    <div className="flex flex-col gap-8">
      <header className="sticky top-0 z-30 -mx-6 border-b border-slate-100 bg-white/80 px-6 pb-6 pt-2 backdrop-blur-md shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-black tracking-tight text-slate-950">
              みんなの精算
            </h1>
            <div className="mt-0.5 flex items-center gap-1">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                グループ作成
              </span>
            </div>
          </div>
          <LogoutConfirmForm
            buttonClassName="inline-flex min-h-[44px] items-center justify-center rounded-2xl px-3 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus-visible:outline focus-visible:ring-2 focus-visible:ring-indigo-400/55 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-[0.98] motion-reduce:active:scale-100"
            showIcon={false}
          />
        </div>
      </header>

      <div id="group-form" className="card-glass p-7">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <FolderKanban className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              新しいグループ
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              作成するとあなたがオーナーとして参加します。
            </p>
          </div>
        </div>

        {error ? (
          <p className="mt-5 rounded-2xl border border-red-100 bg-red-50/80 px-4 py-3 text-sm text-red-800">
            {error}
          </p>
        ) : null}

        <form className="mt-7 flex flex-col gap-5" action={createGroupAction}>
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-semibold text-slate-700">グループ名</span>
            <input
              className="input-field"
              name="name"
              required
              placeholder="例: 山田家"
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <button className="btn-primary" type="submit">
              作成
            </button>
            <Link href="/groups" className="btn-secondary">
              戻る
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
