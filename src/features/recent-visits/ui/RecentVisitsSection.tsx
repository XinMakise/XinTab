import { useLayoutEffect, useRef, useState } from "react";
import { History } from "lucide-react";

import { RecentVisitCard } from "@/features/recent-visits/ui/RecentVisitCard";
import {
  estimateRecentVisitsContentWidth,
  getRecentVisitsMinColumnWidth,
  getRecentVisitsVisibleCount,
  normalizeRecentVisitsCardSize,
  normalizeRecentVisitsRows,
} from "@/features/recent-visits";
import type { RecentVisitItem } from "@/shared/types/recent-visit";

export function RecentVisitsSection({
  items,
  rows,
  cardSize,
  onRemoveItem,
}: {
  items: RecentVisitItem[];
  rows?: number;
  cardSize?: number;
  onRemoveItem?: (itemId: string) => void;
}) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(() =>
    estimateRecentVisitsContentWidth(typeof window === "undefined" ? undefined : window.innerWidth),
  );
  const normalizedCardSize = normalizeRecentVisitsCardSize(cardSize);
  const normalizedRows = normalizeRecentVisitsRows(rows);
  const minColumnWidth = getRecentVisitsMinColumnWidth(normalizedCardSize);
  const visibleCount = getRecentVisitsVisibleCount(containerWidth, normalizedRows, normalizedCardSize);
  const visibleItems = items.slice(0, visibleCount);

  useLayoutEffect(() => {
    const updateWidth = () => {
      setContainerWidth(
        sectionRef.current?.clientWidth ||
          estimateRecentVisitsContentWidth(typeof window === "undefined" ? undefined : window.innerWidth),
      );
    };

    updateWidth();
    if (typeof window === "undefined") return;

    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  if (!items.length) return null;

  return (
    <section ref={sectionRef} className="mb-6 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <History className="h-4 w-4 text-primary" />
          <span>最近访问网站</span>
        </div>
      </div>

      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: `repeat(auto-fit, minmax(${minColumnWidth}px, 1fr))` }}
      >
        {visibleItems.map((item) => (
          <RecentVisitCard
            key={item.id}
            item={item}
            cardSize={normalizedCardSize}
            onRemove={onRemoveItem}
          />
        ))}
      </div>
    </section>
  );
}


