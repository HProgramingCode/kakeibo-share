import Link from "next/link";
import { signupAction } from "@/features/auth/actions/signup-actions";
import { UserPlus } from "lucide-react";

type Props = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function SignupPage({ searchParams }: Props) {
  const params = await searchParams;
  const error = params?.error;

  return (
    <div className="card-glass p-7">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <UserPlus className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">アカウント作成</h1>
          <p className="mt-1 text-sm text-slate-500">
            メール確認が有効な場合は、メール内リンク後にログインしてください。
          </p>
        </div>
      </div>

      {error ? (
        <p className="mt-5 rounded-2xl border border-red-100 bg-red-50/80 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <form className="mt-7 flex flex-col gap-5" action={signupAction}>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-semibold text-slate-700">メール</span>
          <input className="input-field" type="email" name="email" autoComplete="email" required />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-semibold text-slate-700">パスワード（8文字以上）</span>
          <input
            className="input-field"
            type="password"
            name="password"
            autoComplete="new-password"
            required
            minLength={8}
          />
        </label>
        <button className="btn-primary w-full" type="submit">
          作成する
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        すでにアカウントがある場合は{" "}
        <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
          ログイン
        </Link>
      </p>
    </div>
  );
}
