type Props = {
  showPayerHint: boolean;
};

export function GroupSpendChartLegend({ showPayerHint }: Props) {
  return (
    <div className="mt-4 space-y-2 border-t border-slate-50 pt-4 text-[11px] leading-relaxed text-slate-500">
      <p className="font-semibold uppercase tracking-wider text-slate-400">
        グラフの見方
      </p>
      <ul className="list-inside list-disc space-y-1 pl-0.5">
        <li>棒は、その暦月のグループ支出の合計です。</li>
        <li>
          線は、その月までの平均月額（先頭の月から当該月までを月数で割った値）です。棒と同じ「いくら／月」で並べ読みできます。
        </li>
        {showPayerHint ? (
          <li>
            棒をタップすると色が変わり、その月を選べます。下に参加者ごとの自分の分担（均等割・端数は支払者負担）が出ます。
          </li>
        ) : (
          <li>棒をタップすると、選択した暦月が色で強調されます。</li>
        )}
      </ul>
    </div>
  );
}
