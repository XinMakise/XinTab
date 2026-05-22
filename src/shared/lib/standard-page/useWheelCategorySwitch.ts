import { useCallback, useEffect, useMemo, useRef } from "react";

type WheelCategoryItem = { id: string };

type UseWheelCategorySwitchOptions<T extends WheelCategoryItem> = {
  containerRef: React.RefObject<HTMLElement>;
  items: T[];
  activeId?: string;
  onChange: (id: string) => void;
  onAfterChange?: (id: string) => void;
  enabled?: boolean;
  wheelStep?: number;
  minDelta?: number;
};

export function useWheelCategorySwitch<T extends WheelCategoryItem>({
  containerRef,
  items,
  activeId,
  onChange,
  onAfterChange,
  enabled = true,
  wheelStep = 100,
  minDelta = 5,
}: UseWheelCategorySwitchOptions<T>) {
  const accumulatedDeltaRef = useRef(0);
  const indexMap = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach((item, idx) => map.set(item.id, idx));
    return map;
  }, [items]);

  const onWheel = useCallback(
    (e: WheelEvent) => {
      if (!enabled) return;
      if (items.length < 2) return;
      if (!activeId) return;

      const delta = e.deltaY;
      if (Math.abs(delta) < minDelta) return;

      e.preventDefault();
      e.stopPropagation();

      accumulatedDeltaRef.current += delta;

      const steps = Math.trunc(accumulatedDeltaRef.current / wheelStep);
      if (steps === 0) return;

      accumulatedDeltaRef.current = accumulatedDeltaRef.current % wheelStep;
      const clampedSteps = Math.sign(steps);

      const idx = indexMap.get(activeId);
      if (idx == null) return;
      const len = items.length;
      const newIdx = ((idx + clampedSteps) % len + len) % len;

      if (newIdx !== idx) {
        const nextId = items[newIdx].id;
        onChange(nextId);
        onAfterChange?.(nextId);
      }
    },
    [enabled, items, activeId, indexMap, minDelta, onAfterChange, onChange, wheelStep],
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!enabled) return;

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
    };
  }, [containerRef, enabled, onWheel]);
}
