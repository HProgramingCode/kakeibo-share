type Props = {
  queryError?: string;
  settledMonth?: string;
};

/** クエリパラメータ由来のエラー・成功メッセージ */
export function GroupDetailFlashAlerts({ queryError, settledMonth }: Props) {
  return (
    <>
      {queryError ? (
        <p className="rounded-3xl border border-red-100 bg-red-50/80 px-5 py-4 text-sm text-red-800">
          {queryError}
        </p>
      ) : null}
      {settledMonth ? (
        <p className="rounded-3xl border border-indigo-100 bg-indigo-50/70 px-5 py-4 text-sm font-medium text-indigo-900">
          {settledMonth} の精算を確定しました
        </p>
      ) : null}
    </>
  );
}
