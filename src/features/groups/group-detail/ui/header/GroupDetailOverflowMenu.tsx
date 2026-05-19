"use client";

import { updateProfileDisplayNameAction } from "@/features/auth/actions/profile-actions";
import { groupChartsPath } from "@/lib/routes";
import { PendingButton } from "@/features/shared/ui/PendingButton";
import { LogoutConfirmForm } from "@/features/auth/ui/LogoutConfirmForm";
import { GroupInviteLinkPanel } from "./GroupInviteLinkPanel";
import { BarChart3, ChevronRight, MoreVertical, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";

export type GroupDetailMenuMember = {
  user_id: string;
  label: string;
  role: "owner" | "member";
};

const DISPLAY_NAME_MAX = 80;

type Props = {
  groupId: string;
  isOwner: boolean;
  initialDisplayName: string;
  members: GroupDetailMenuMember[];
};

const panelId = "group-detail-overflow-panel";

export function GroupDetailOverflowMenu({
  groupId,
  isOwner,
  initialDisplayName,
  members,
}: Props) {
  const router = useRouter();
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [nameMessage, setNameMessage] = useState<string | null>(null);
  const [pendingName, setPendingName] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setNameMessage(null);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  const overlay =
    open && mounted ? (
      <div
        className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center sm:p-4"
        role="presentation"
      >
        <button
          type="button"
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
          aria-label="閉じる"
          onClick={close}
        />
        <div
          id={panelId}
          className="relative z-10 flex max-h-[min(90dvh,100dvh)] w-full max-w-md min-h-0 flex-col overflow-hidden rounded-t-[28px] border border-slate-100 bg-white shadow-2xl sm:max-h-[min(85dvh,100dvh)] sm:rounded-[28px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          style={{
            paddingBottom: "max(1.5rem, env(safe-area-inset-bottom, 0px))",
          }}
        >
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-6 pb-4 pt-6">
            <h2 id={titleId} className="text-base font-black text-slate-900">
              メニュー
            </h2>
            <button
              type="button"
              onClick={close}
              className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              aria-label="閉じる"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-6 pb-2 pt-5 touch-pan-y">
            <div className="flex flex-col gap-8">
              <section className="space-y-3" aria-label="このグループ">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  このグループ
                </h3>
                <Link
                  href={groupChartsPath(groupId)}
                  onClick={close}
                  className="group flex items-center gap-4 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 transition-all hover:border-indigo-200 active:scale-[0.99]"
                >
                  <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600 shadow-inner">
                    <BarChart3
                      className="h-5 w-5"
                      strokeWidth={1.75}
                      aria-hidden
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900">
                      支出の推移
                    </p>
                    <p className="text-xs text-slate-500">
                      月ごとの合計と開始からの平均月額
                    </p>
                  </div>
                  <ChevronRight
                    className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                </Link>
              </section>

              <section className="space-y-3" aria-label="メンバー">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  メンバー
                </h3>
                <ul className="flex flex-col gap-2 rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
                  {members.map((m) => (
                    <li
                      key={m.user_id}
                      className="flex items-center justify-between gap-2 text-sm font-medium text-slate-800"
                    >
                      <span className="min-w-0 truncate">{m.label}</span>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                          m.role === "owner"
                            ? "bg-indigo-100 text-indigo-700"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {m.role === "owner" ? "オーナー" : "メンバー"}
                      </span>
                    </li>
                  ))}
                </ul>
                {isOwner ? (
                  <div className="max-w-full [&_.card-glass]:shadow-none">
                    <GroupInviteLinkPanel groupId={groupId} />
                  </div>
                ) : null}
              </section>

              <section className="space-y-3" aria-label="アカウント">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  表示名
                </h3>
                <form
                  className="flex flex-col gap-3"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    setNameMessage(null);
                    setPendingName(true);
                    try {
                      const r = await updateProfileDisplayNameAction(fd);
                      if (r.error) {
                        setNameMessage(r.error);
                        return;
                      }
                      setNameMessage("保存しました");
                      router.refresh();
                    } finally {
                      setPendingName(false);
                    }
                  }}
                >
                  <input type="hidden" name="group_id" value={groupId} />
                  <label className="flex min-w-0 flex-col gap-2 text-sm">
                    <span className="font-semibold text-slate-700">
                      グループ内で表示される名前
                    </span>
                    <input
                      className="input-field"
                      name="display_name"
                      defaultValue={initialDisplayName}
                      maxLength={DISPLAY_NAME_MAX}
                      autoComplete="nickname"
                      placeholder="例: はる"
                    />
                  </label>
                  <PendingButton
                    type="submit"
                    pending={pendingName}
                    pendingLabel="保存中…"
                    className="btn-primary w-full text-sm disabled:opacity-60"
                  >
                    表示名を保存
                  </PendingButton>
                  {nameMessage ? (
                    <p
                      className={
                        nameMessage === "保存しました"
                          ? "text-sm text-slate-600"
                          : "text-sm text-red-700"
                      }
                    >
                      {nameMessage}
                    </p>
                  ) : null}
                </form>
              </section>

              <section aria-label="ログアウト" className="pb-2">
                <LogoutConfirmForm
                  className="block w-full"
                  buttonClassName="w-full rounded-2xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:ring-2 focus-visible:ring-indigo-400/55 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                  showIcon={false}
                />
              </section>
            </div>
          </div>
        </div>
      </div>
    ) : null;

  return (
    <>
      <button
        type="button"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 transition-all active:scale-95"
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="dialog"
        aria-label="その他のメニュー"
        onClick={() => setOpen(true)}
      >
        <MoreVertical
          className="h-5 w-5 text-slate-600"
          strokeWidth={1.75}
          aria-hidden
        />
      </button>
      {mounted && open ? createPortal(overlay, document.body) : null}
    </>
  );
}
