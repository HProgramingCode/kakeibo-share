import Link from "next/link";
import { loginAction } from "@/features/auth/actions/login-actions";
import { LogIn } from "lucide-react";

type Props = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const error = params?.error;

  return (
    <div className="card-glass p-7">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <LogIn className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">ログイン</h1>
          <p className="mt-1 text-sm text-slate-500">みんなの精算</p>
        </div>
      </div>

      {error ? (
        <p className="mt-5 rounded-2xl border border-red-100 bg-red-50/80 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <form className="mt-7 flex flex-col gap-5" action={loginAction}>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-semibold text-slate-700">メール</span>
          <input className="input-field" type="email" name="email" autoComplete="email" required />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-semibold text-slate-700">パスワード</span>
          <input
            className="input-field"
            type="password"
            name="password"
            autoComplete="current-password"
            required
          />
        </label>
        <button className="btn-primary w-full" type="submit">
          ログイン
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        はじめての方は{" "}
        <Link href="/signup" className="font-semibold text-indigo-600 hover:text-indigo-500">
          アカウント作成
        </Link>
      </p>
    </div>
  );
}
