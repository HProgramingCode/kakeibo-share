import { useEffect, useState } from "react";

/** チャートデータ変更時に selectedMonth を最新月へ補正 */
export function useSelectedChartMonth(months: string[]) {
  const [selectedMonth, setSelectedMonth] = useState(
    () => months[months.length - 1] ?? "",
  );

  useEffect(() => {
    const latest = months[months.length - 1];
    if (!latest) return;
    if (!months.includes(selectedMonth)) {
      setSelectedMonth(latest);
    }
  }, [months, selectedMonth]);

  return { selectedMonth, setSelectedMonth };
}
