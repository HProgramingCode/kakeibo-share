import Link from "next/link";
import { signupAction } from "@/features/auth/actions/signup-actions";
import { GoogleSignInButton } from "@/features/auth/ui/GoogleSignInButton";
import { safeAuthRedirectPath } from "@/shared/lib/auth-redirect";

type Props = {
  searchParams?: Promise<{ error?: string; next?: string }>;
};

export default async function SignupPage({ searchParams }: Props) {
  const params = await searchParams;
  const error = params?.error;
  const next = safeAuthRedirectPath(params?.next);

  const loginHref =
    next === "/groups" ? "/login" : `/login?next=${encodeURIComponent(next)}`;

  return (
    <div className="card-glass p-7">
      <header>
        <h1 className="text-xl font-black tracking-tight text-slate-950">みんなの精算</h1>
        <h2 className="mt-2 text-lg font-bold tracking-tight text-slate-900">アカウント作成</h2>
        <p className="mt-2 text-sm text-slate-500">
          メール確認が有効な場合は、メール内リンク後にログインしてください。
        </p>
      </header>

      {error ? (
        <p className="mt-5 rounded-2xl border border-red-100 bg-red-50/80 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <form className={`flex flex-col gap-5 ${error ? "mt-5" : "mt-7"}`} action={signupAction}>
        <input type="hidden" name="next" value={next} />
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-semibold text-slate-700">表示名</span>
          <input
            className="input-field"
            type="text"
            name="display_name"
            autoComplete="nickname"
            required
            maxLength={40}
            placeholder="グループ内で表示される名前"
          />
        </label>
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

      <div className="mt-7 flex flex-col gap-4">
        <p className="text-center text-[11px] font-semibold uppercase tracking-widest text-slate-400">
          または
        </p>
        <GoogleSignInButton nextPath={next} label="Google で登録" />
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        すでにアカウントがある場合は{" "}
        <Link href={loginHref} className="font-semibold text-indigo-600 hover:text-indigo-500">
          ログイン
        </Link>
      </p>
    </div>
  );
}
