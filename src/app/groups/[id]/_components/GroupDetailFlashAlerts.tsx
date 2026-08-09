type Props = {
  queryError?: string;
  settlementConfirmed?: boolean;
  expenseCreated?: boolean;
};

/** クエリパラメータ由来のエラー・成功メッセージ */
export function GroupDetailFlashAlerts({ queryError, settlementConfirmed, expenseCreated }: Props) {
  return (
    <>
      {queryError ? (
        <p className="rounded-3xl border border-red-100 bg-red-50/80 px-5 py-4 text-sm text-red-800">
          {queryError}
        </p>
      ) : null}
      {settlementConfirmed ? (
        <p className="rounded-3xl border border-indigo-100 bg-indigo-50/70 px-5 py-4 text-sm font-medium text-indigo-900">
          精算を確定しました。送金額は精算履歴に記録されています。
        </p>
      ) : null}
      {expenseCreated ? (
        <p className="rounded-3xl border border-emerald-100 bg-emerald-50/70 px-5 py-4 text-sm font-medium text-emerald-900">
          支出を登録しました。
        </p>
      ) : null}
    </>
  );
}
