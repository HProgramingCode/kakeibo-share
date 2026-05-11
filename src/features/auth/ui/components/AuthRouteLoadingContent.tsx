/**
 * ログイン等の認証ルート遷移時・ログアウト送信中に使う骨組み。
 * `AuthPageShell` 内に置く想定。
 */
export function AuthRouteLoadingContent() {
  const bar =
    "animate-pulse rounded-xl bg-slate-200/90 motion-reduce:animate-none";
  return (
    <div className="space-y-6" role="status" aria-label="読み込み中">
      <div className="space-y-2">
        <div className={`${bar} h-3 w-28`} />
        <div className={`${bar} h-9 w-36`} />
        <div className={`${bar} h-4 w-full max-w-[15rem]`} />
      </div>
      <div className="flex flex-col gap-4">
        <div className={`${bar} h-11 w-full rounded-2xl`} />
        <div className={`${bar} h-11 w-full rounded-2xl`} />
        <div className={`${bar} h-12 w-full rounded-2xl`} />
      </div>
      <div className={`${bar} h-px w-full opacity-60`} />
      <div className={`${bar} h-11 w-full rounded-2xl`} />
    </div>
  );
}
