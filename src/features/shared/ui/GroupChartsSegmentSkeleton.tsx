/**
 * `/groups/[id]/charts` 遷移時の loading UI。戻る・見出し・チャート領域の骨組み。
 */
export function GroupChartsSegmentSkeleton() {
  const bar = "animate-pulse rounded-xl bg-slate-200/90 motion-reduce:animate-none";
  return (
    <div className="flex flex-col gap-8" role="status" aria-label="読み込み中">
      <header className="sticky top-0 z-30 -mx-6 border-b border-slate-100 bg-white/80 px-6 pb-6 pt-2 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-3">
          <div className={`${bar} h-10 w-10 shrink-0 rounded-full`} />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <div className={`${bar} h-5 w-5 shrink-0 rounded-lg`} />
              <div className={`${bar} h-7 w-48`} />
            </div>
            <div className="flex items-center gap-1 pl-0.5">
              <div className={`${bar} h-1.5 w-1.5 shrink-0 rounded-full`} />
              <div className={`${bar} h-3 w-32`} />
            </div>
          </div>
        </div>
      </header>

      <div className="space-y-6">
        <div className={`${bar} h-[220px] w-full rounded-3xl`} />
        <div className={`${bar} h-4 w-3/4 max-w-md`} />
        <div className={`${bar} h-[180px] w-full rounded-3xl`} />
      </div>
    </div>
  );
}
