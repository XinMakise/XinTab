import { useLayoutEffect, useRef, useState } from "react";

const GRID_GAP = 12; // gap-3
const STANDARD_PAGE_CARD_MIN_WIDTH = 80;

export function getResponsiveGridTemplateColumns(
  containerWidth: number,
  columnsPerRow: number,
) {
  if (containerWidth <= 0) {
    return `repeat(${columnsPerRow}, minmax(0, 1fr))`;
  }

  const maxColumnWidth = Math.max(
    STANDARD_PAGE_CARD_MIN_WIDTH,
    Math.floor(
      (containerWidth - GRID_GAP * (columnsPerRow - 1)) / columnsPerRow,
    ),
  );

  return `repeat(auto-fill, minmax(min(100%, ${STANDARD_PAGE_CARD_MIN_WIDTH}px), ${maxColumnWidth}px))`;
}

export function useResponsiveGridStyle(columnsPerRow: number) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width) setContainerWidth(width);
    });

    ro.observe(el);
    setContainerWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const gridStyle = {
    gridTemplateColumns: getResponsiveGridTemplateColumns(
      containerWidth,
      columnsPerRow,
    ),
  };

  return { containerRef, gridStyle };
}
