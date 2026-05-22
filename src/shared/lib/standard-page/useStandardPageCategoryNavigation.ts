import { useCallback, useEffect, useMemo, useRef } from "react";

import { useWheelCategorySwitch } from "./useWheelCategorySwitch";

type CategoryNavigationItem = {
  id: string;
};

type UseStandardPageCategoryNavigationOptions<T extends CategoryNavigationItem> = {
  items: T[];
  activeId?: string;
  onChange: (id: string) => void;
  wheelEnabled: boolean;
  scrollOnChange?: boolean;
};

export function useStandardPageCategoryNavigation<T extends CategoryNavigationItem>({
  items,
  activeId,
  onChange,
  wheelEnabled,
  scrollOnChange = false,
}: UseStandardPageCategoryNavigationOptions<T>) {
  const categoryBarRef = useRef<HTMLDivElement>(null);
  const categoryNavRef = useRef<HTMLDivElement>(null);

  const activeItem = useMemo(
    () => items.find((item) => item.id === activeId) ?? items[0],
    [activeId, items],
  );

  const scrollToItem = useCallback((itemId: string) => {
    if (!scrollOnChange) return;
    const nav = categoryNavRef.current;
    if (!nav) return;

    const button = nav.querySelector(`[data-category-id="${itemId}"]`);
    if (button instanceof HTMLElement) {
      button.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    }
  }, [scrollOnChange]);

  const handleActiveItemChange = useCallback((nextId: string) => {
    onChange(nextId);
    scrollToItem(nextId);
  }, [onChange, scrollToItem]);

  useWheelCategorySwitch({
    containerRef: categoryBarRef,
    items,
    activeId,
    onChange: handleActiveItemChange,
    enabled: wheelEnabled,
  });

  useEffect(() => {
    if (!activeItem) return;
    if (activeId && items.some((item) => item.id === activeId)) return;

    onChange(activeItem.id);
    scrollToItem(activeItem.id);
  }, [activeId, activeItem, items, onChange, scrollToItem]);

  return {
    activeItem,
    categoryBarRef,
    categoryNavRef,
    handleActiveItemChange,
  };
}
