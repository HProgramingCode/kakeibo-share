"use client";

import {
  deleteGroupAction,
  type DeleteGroupResult,
} from "@/features/groups/actions/delete-group-action";
import { BottomSheetDialog } from "@/shared/components/BottomSheetDialog";
import { PendingButton } from "@/shared/components/PendingButton";
import { Trash2, X } from "lucide-react";
import {
  useCallback,
  useId,
  useState,
  type ReactNode,
} from "react";
import { useFormStatus } from "react-dom";
import { useActionState } from "react";

type Props = {
  groupId: string;
  groupName: string;
  className?: string;
  buttonClassName?: string;
  children?: ReactNode;
};

const initialState: DeleteGroupResult = { ok: true };

const defaultButtonClass =
  "inline-flex min-h-[44px] shrink-0 items-center justify-center gap-1.5 rounded-2xl border border-red-200/90 bg-red-50/90 px-3.5 text-sm font-semibold text-red-800 transition-colors hover:border-red-300 hover:bg-red-50 focus-visible:outline focus-visible:ring-2 focus-visible:ring-red-400/55 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-[0.98] motion-reduce:active:scale-100";

function DeleteGroupFormFields({
  titleId,
  groupName,
  onClose,
  errorMessage,
}: {
  titleId: string;
  groupName: string;
  onClose: () => void;
  errorMessage: string | null;
}) {
  const { pending } = useFormStatus();

  return (
    <>
      <div className="mb-4 flex items-start justify-between gap-3">
        <h2 id={titleId} className="text-base font-black text-slate-900">
          グループを削除しますか？
        </h2>
        <button
          type="button"
          onClick={onClose}
          disabled={pending}
          className="shrink-0 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:pointer-events-none disabled:opacity-50"
          aria-label="閉じる"
        >
          <X className="h-5 w-5" aria-hidden />
        </button>
      </div>

      <p className="mb-5 text-sm leading-relaxed text-slate-600">
        <span className="font-semibold text-slate-900">{groupName}</span>
        の精算データもすべて削除され、取り消せません。
      </p>

      {errorMessage ? (
        <p className="mb-4 rounded-2xl border border-red-100 bg-red-50/80 px-4 py-3 text-sm text-red-800">
          {errorMessage}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          disabled={pending}
          className="btn-secondary order-2 w-full sm:order-1 sm:w-auto"
        >
          キャンセル
        </button>
        <PendingButton
          type="submit"
          pending={pending}
          pendingLabel="削除中…"
          className="order-1 w-full rounded-2xl border border-red-300 bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 focus-visible:outline focus-visible:ring-2 focus-visible:ring-red-400/55 focus-visible:ring-offset-2 disabled:opacity-60 sm:order-2 sm:w-auto"
        >
          削除する
        </PendingButton>
      </div>
    </>
  );
}

/**
 * 誤タップ防止のため、POST 前にアプリ内モーダルで確認する。
 */
export function DeleteGroupConfirmForm({
  groupId,
  groupName,
  className,
  buttonClassName = defaultButtonClass,
  children,
}: Props) {
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(deleteGroupAction, initialState);
  const errorMessage = state.ok === false ? state.error : null;

  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <div className={className}>
        <button
          type="button"
          className={buttonClassName}
          onClick={() => setOpen(true)}
        >
          <Trash2
            className="h-4 w-4 shrink-0 opacity-90"
            strokeWidth={2}
            aria-hidden
          />
          {children ?? "削除"}
        </button>
      </div>
      <BottomSheetDialog
        open={open}
        onClose={close}
        titleId={titleId}
        title="グループを削除しますか？"
        zIndex={220}
        compact
      >
        <form action={formAction}>
          <input type="hidden" name="group_id" value={groupId} />
          <DeleteGroupFormFields
            titleId={titleId}
            groupName={groupName}
            onClose={close}
            errorMessage={errorMessage}
          />
        </form>
      </BottomSheetDialog>
    </>
  );
}
