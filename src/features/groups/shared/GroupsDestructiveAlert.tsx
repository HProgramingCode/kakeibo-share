import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

/** グループ系画面で共通のエラー・警告パネル（赤枠） */
export function GroupsDestructiveAlert({ children }: Props) {
  return (
    <div className="rounded-3xl border border-red-100 bg-red-50/80 p-5 text-sm text-red-800">
      {children}
    </div>
  );
}
