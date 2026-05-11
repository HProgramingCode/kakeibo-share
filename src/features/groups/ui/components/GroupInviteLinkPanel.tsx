"use client";

import { createGroupInviteAction } from "@/features/groups/actions/group-invite-actions";
import { PendingButton } from "@/shared/ui/PendingButton";
import { Link2 } from "lucide-react";
import { useState } from "react";

type Props = {
  groupId: string;
};

export function GroupInviteLinkPanel({ groupId }: Props) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);

  async function onCreate() {
    setPending(true);
    setMessage(null);
    setUrl(null);
    const res = await createGroupInviteAction(groupId);
    setPending(false);
    if (res.error) {
      setMessage(res.error);
      return;
    }
    if (res.url) {
      setUrl(res.url);
      setMessage("リンクを発行しました。7日間有効です。");
    }
  }

  async function onCopy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setMessage("クリップボードにコピーしました");
    } catch {
      setMessage("コピーに失敗しました。手で選択してください");
    }
  }

  return (
    <div className="card-glass p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <Link2 className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-slate-900">メンバー招待</h3>
          <p className="mt-1 text-xs text-slate-500">
            共有リンクから参加できます（新しいリンクを発行するたびに別URLになります）
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-3">
        <PendingButton
          type="button"
          onClick={onCreate}
          pending={pending}
          pendingLabel="発行中…"
          className="btn-primary w-full text-sm disabled:opacity-60"
        >
          招待リンクを発行
        </PendingButton>
        {url ? (
          <div className="flex flex-col gap-2">
            <textarea
              readOnly
              className="input-field min-h-[72px] resize-y font-mono text-xs"
              value={url}
              aria-label="招待URL"
            />
            <button
              type="button"
              onClick={onCopy}
              className="rounded-2xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              URL をコピー
            </button>
          </div>
        ) : null}
        {message ? (
          <p className={`text-sm ${message.includes("失敗") || message.includes("のみ") ? "text-red-700" : "text-slate-600"}`}>
            {message}
          </p>
        ) : null}
      </div>
    </div>
  );
}
