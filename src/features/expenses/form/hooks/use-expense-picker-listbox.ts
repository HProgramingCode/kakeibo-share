import { computeExpensePickerPortalMenuGeom } from "@/features/expenses/form/model/expense-picker-portal-geometry";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type RefObject,
} from "react";

export type ExpensePickerItem = { id: string; label: string };

type Options = {
  items: ExpensePickerItem[];
  value: string;
  onValueChange: (id: string) => void;
  portal?: boolean;
  disabled?: boolean;
};

type Return = {
  baseId: string;
  listId: string;
  open: boolean;
  highlight: number;
  mounted: boolean;
  btnRef: RefObject<HTMLButtonElement | null>;
  menuRef: RefObject<HTMLDivElement | null>;
  portalGeom: ReturnType<typeof computeExpensePickerPortalMenuGeom> | null;
  displayLabel: string;
  toggleOpen: () => void;
  commitSelection: (id: string) => void;
  onButtonKeyDown: (e: ReactKeyboardEvent<HTMLButtonElement>) => void;
  onMenuKeyDown: (e: ReactKeyboardEvent<HTMLDivElement>) => void;
  setHighlight: (index: number) => void;
  showPortalPanel: boolean;
  showAttachedPanel: boolean;
};

export function useExpensePickerListbox({
  items,
  value,
  onValueChange,
  portal = false,
  disabled = false,
}: Options): Return {
  const baseId = useId();
  const listId = `${baseId}-listbox`;
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [mounted, setMounted] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [portalGeom, setPortalGeom] = useState<ReturnType<
    typeof computeExpensePickerPortalMenuGeom
  > | null>(null);

  useEffect(() => setMounted(true), []);

  const updatePortalGeom = useCallback(() => {
    const el = btnRef.current;
    if (!el) return;
    setPortalGeom(
      computeExpensePickerPortalMenuGeom(el.getBoundingClientRect()),
    );
  }, []);

  useLayoutEffect(() => {
    if (!open || !portal) {
      setPortalGeom(null);
      return;
    }
    updatePortalGeom();
  }, [open, portal, updatePortalGeom]);

  useEffect(() => {
    if (!open || !portal) return;
    function onResize() {
      updatePortalGeom();
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [open, portal, updatePortalGeom]);

  useEffect(() => {
    if (!open) return;
    function closeOnScroll() {
      setOpen(false);
    }
    window.addEventListener("scroll", closeOnScroll, true);
    return () => window.removeEventListener("scroll", closeOnScroll, true);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onDocPointerDown(e: MouseEvent | PointerEvent) {
      const t = e.target as Node;
      if (btnRef.current?.contains(t)) return;
      if (menuRef.current?.contains(t)) return;
      setOpen(false);
    }
    document.addEventListener("pointerdown", onDocPointerDown);
    return () => document.removeEventListener("pointerdown", onDocPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const i = items.findIndex((item) => item.id === value);
    setHighlight(i >= 0 ? i : 0);
  }, [open, items, value]);

  const displayLabel =
    items.find((item) => item.id === value)?.label ?? "選択してください";

  const commitSelection = useCallback(
    (id: string) => {
      onValueChange(id);
      setOpen(false);
      btnRef.current?.focus();
    },
    [onValueChange],
  );

  const toggleOpen = useCallback(() => {
    if (disabled || items.length === 0) return;
    const next = !open;
    if (next && portal && btnRef.current) {
      setPortalGeom(
        computeExpensePickerPortalMenuGeom(
          btnRef.current.getBoundingClientRect(),
        ),
      );
    }
    if (!next) {
      setPortalGeom(null);
    }
    setOpen(next);
  }, [disabled, items.length, open, portal]);

  const onButtonKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLButtonElement>) => {
      if (disabled || items.length === 0) return;
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        if (!open) {
          if (portal) updatePortalGeom();
          setOpen(true);
          const i = items.findIndex((item) => item.id === value);
          setHighlight(i >= 0 ? i : 0);
        }
      }
    },
    [disabled, items, open, portal, updatePortalGeom, value],
  );

  const onMenuKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLDivElement>) => {
      const n = items.length;
      if (n === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlight((h) => Math.min(n - 1, h + 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlight((h) => Math.max(0, h - 1));
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const row = items[highlight];
        if (row) commitSelection(row.id);
      } else if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        btnRef.current?.focus();
      }
    },
    [commitSelection, highlight, items],
  );

  const showPortalPanel =
    portal && mounted && open && portalGeom != null && items.length > 0;
  const showAttachedPanel = !portal && open && items.length > 0;

  return {
    baseId,
    listId,
    open,
    highlight,
    mounted,
    btnRef,
    menuRef,
    portalGeom,
    displayLabel,
    toggleOpen,
    commitSelection,
    onButtonKeyDown,
    onMenuKeyDown,
    setHighlight,
    showPortalPanel,
    showAttachedPanel,
  };
}
