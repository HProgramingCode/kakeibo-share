export function GroupDetailHistoryPanelSkeleton() {
  const bar = "animate-pulse rounded-xl bg-slate-200/90 motion-reduce:animate-none";

  return (
    <div className="flex flex-col gap-8" role="status" aria-label="履歴を読み込み中">
      <div className={`${bar} h-11 w-full max-w-xs rounded-2xl`} />
      <div className={`${bar} h-11 w-full rounded-2xl`} />
      <ul className="flex flex-col gap-3">
        {[0, 1, 2].map((key) => (
          <li
            key={key}
            className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm"
          >
            <div className={`${bar} h-4 w-[55%]`} />
            <div className={`${bar} mt-2 h-3 w-[35%]`} />
          </li>
        ))}
      </ul>
    </div>
  );
}
