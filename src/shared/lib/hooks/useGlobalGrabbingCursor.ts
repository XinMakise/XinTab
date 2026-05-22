import { useEffect } from "react";

let activeCursorUsers = 0;

function ensureCursorStyle() {
  const existing = document.querySelector<HTMLStyleElement>('style[data-xintab-drag-cursor="true"]');
  if (existing) return existing;

  const style = document.createElement("style");
  style.setAttribute("data-xintab-drag-cursor", "true");
  style.textContent = `
    html, body, body * {
      cursor: grabbing !important;
    }
  `;
  document.head.appendChild(style);
  return style;
}

export function useGlobalGrabbingCursor(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    activeCursorUsers += 1;
    const style = ensureCursorStyle();

    return () => {
      activeCursorUsers = Math.max(0, activeCursorUsers - 1);
      if (activeCursorUsers === 0) {
        style.remove();
      }
    };
  }, [enabled]);
}
