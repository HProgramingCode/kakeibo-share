import { useEffect } from "react";

/** モーダル表示中に body スクロールをロックし Escape で onClose を呼ぶ */
export function useBodyScrollLock(active: boolean, onClose: () => void) {
  useEffect(() => {
    if (!active) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [active, onClose]);
}
