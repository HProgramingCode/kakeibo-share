/**
 * `/groups/**` の遷移時 loading UI。一覧・詳細・作成で共通のカラム幅内レイアウトに近い骨組み。
 */
export function GroupsSegmentSkeleton() {
  const bar = "animate-pulse rounded-xl bg-slate-200/90 motion-reduce:animate-none";
  return (
    <div className="flex flex-col gap-8" role="status" aria-label="読み込み中">
      <header className="sticky top-0 z-30 -mx-6 border-b border-slate-100 bg-white/80 px-6 pb-6 pt-2 backdrop-blur-md shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-2">
            <div className={`${bar} h-6 w-40`} />
            <div className={`${bar} h-3 w-28`} />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className={`${bar} h-10 w-10 shrink-0 rounded-full`} />
            <div className={`${bar} h-10 w-10 shrink-0 rounded-full`} />
          </div>
        </div>
      </header>

      <div className="-mx-1 flex gap-1 rounded-[20px] border border-slate-100 bg-slate-50/80 p-1 shadow-inner">
        <div className={`${bar} h-11 flex-1 rounded-2xl`} />
        <div className={`${bar} h-11 flex-1 rounded-2xl`} />
        <div className={`${bar} h-11 flex-1 rounded-2xl`} />
      </div>

      <div className="card-glass space-y-4 p-6">
        <div className={`${bar} h-5 w-48`} />
        <div className={`${bar} h-[120px] w-full rounded-2xl`} />
        <div className={`${bar} h-4 w-full max-w-[80%]`} />
      </div>

      <ul className="flex flex-col gap-3">
        {[0, 1, 2].map((key) => (
          <li
            key={key}
            className="flex items-center justify-between gap-4 rounded-3xl border border-slate-100 bg-white px-5 py-5 shadow-card"
          >
            <div className="min-w-0 flex-1 space-y-2">
              <div className={`${bar} h-4 w-[55%]`} />
              <div className={`${bar} h-3 w-[35%]`} />
            </div>
            <div className={`${bar} h-5 w-5 shrink-0 rounded-md`} />
          </li>
        ))}
      </ul>
    </div>
  );
}
