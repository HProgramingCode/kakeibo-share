/** 支出フォーム系ドロップダウンで共通利用（カテゴリ・支払者など） */

export type ExpensePickerPortalMenuGeom = {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
};

/** メニューを body にポータルするときの fixed 座標（はみ出し防止・上下フリップ） */
export function computeExpensePickerPortalMenuGeom(
  trigger: DOMRect,
): ExpensePickerPortalMenuGeom {
  const GAP = 8;
  const PAD = 12;
  const MAX_PREF = 288;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const width = Math.min(trigger.width, vw - PAD * 2);
  let left = trigger.left + (trigger.width - width) / 2;
  left = Math.max(PAD, Math.min(left, vw - width - PAD));

  const spaceBelow = vh - trigger.bottom - GAP - PAD;
  const spaceAbove = trigger.top - GAP - PAD;

  let maxHeight: number;
  let top: number;
  if (spaceBelow >= 160 || spaceBelow >= spaceAbove) {
    maxHeight = Math.min(MAX_PREF, Math.max(spaceBelow, 80));
    top = trigger.bottom + GAP;
  } else {
    maxHeight = Math.min(MAX_PREF, Math.max(spaceAbove, 80));
    top = trigger.top - GAP - maxHeight;
    top = Math.max(PAD, top);
  }

  return { top, left, width, maxHeight };
}

export const EXPENSE_PICKER_MENU_PANEL_CLASS =
  "overflow-y-auto overscroll-contain rounded-2xl border-2 border-slate-100 bg-white py-2 shadow-xl outline-none";
