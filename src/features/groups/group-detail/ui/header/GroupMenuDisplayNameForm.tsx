"use client";

import { updateProfileDisplayNameAction } from "@/features/auth/actions/profile-actions";
import { PendingButton } from "@/features/shared/ui/PendingButton";
import { useRouter } from "next/navigation";
import { useState } from "react";

const DISPLAY_NAME_MAX = 80;

type Props = {
  groupId: string;
  initialDisplayName: string;
};

export function GroupMenuDisplayNameForm({
  groupId,
  initialDisplayName,
}: Props) {
  const router = useRouter();
  const [nameMessage, setNameMessage] = useState<string | null>(null);
  const [pendingName, setPendingName] = useState(false);

  return (
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
  );
}
