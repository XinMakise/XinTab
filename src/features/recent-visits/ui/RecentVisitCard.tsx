import React, { useMemo } from "react";
import { useDraggable, useDndContext } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Clock3, X } from "lucide-react";

import { SiteIcon } from "@/shared/ui/links/SiteIcon";
import { recentVisitLinkId } from "@/shared/lib/dnd/dndUtils";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/primitives/button";
import {
  formatRecentVisitTime,
  formatRecentVisitUrl,
  normalizeRecentVisitsCardSize,
} from "@/features/recent-visits";
import type { RecentVisitItem } from "@/shared/types/recent-visit";

export const RecentVisitCard = React.memo(function RecentVisitCard({
  item,
  cardSize,
  onRemove,
}: {
  item: RecentVisitItem;
  cardSize?: number;
  onRemove?: (itemId: string) => void;
}) {
  const { active } = useDndContext();
  const isAnyDragging = !!active;
  const normalizedCardSize = normalizeRecentVisitsCardSize(cardSize);
  const scale = normalizedCardSize / 100;
  const iconSize = Math.round(36 * scale);
  const iconStyle = useMemo(() => ({ width: `${iconSize}px`, height: `${iconSize}px` }), [iconSize]);
  const cardPadding = Math.round(12 * scale);
  const cardGap = Math.round(12 * scale);
  const cardMinHeight = Math.round(108 * scale);
  const titleFontSize = Number((14 * scale).toFixed(1));
  const titleLineHeight = Number((20 * scale).toFixed(1));
  const metaFontSize = Number((12 * scale).toFixed(1));
  const timeFontSize = Number((11 * scale).toFixed(1));
  const timeGap = Number((4 * scale).toFixed(1));
  const timeMarginTop = Math.round(12 * scale);
  const urlMarginTop = Math.round(4 * scale);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: recentVisitLinkId(item.id),
    data: { type: "recent-link", recentVisitId: item.id },
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0 : 1,
    touchAction: "none",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm",
        "cursor-grab active:cursor-grabbing",
        isDragging && "ring-2 ring-dashed ring-muted-foreground/50",
      )}
      {...attributes}
      {...listeners}
    >
      <a
        href={item.url}
        rel="noreferrer"
        className="flex h-full items-start"
        draggable={false}
        onDragStart={(event) => event.preventDefault()}
        style={{
          minHeight: `${cardMinHeight}px`,
          padding: `${cardPadding}px`,
          gap: `${cardGap}px`,
          userSelect: "none",
          pointerEvents: isAnyDragging ? "none" : "auto",
        }}
        onClick={(event) => {
          if (isAnyDragging) {
            event.preventDefault();
            event.stopPropagation();
          }
        }}
      >
        <SiteIcon
          url={item.url}
          title={item.title}
          style={iconStyle}
        />
        <div className="min-w-0 flex-1">
          <div
            className="line-clamp-2 font-medium"
            style={{ fontSize: `${titleFontSize}px`, lineHeight: `${titleLineHeight}px` }}
          >
            {item.title}
          </div>
          <div
            className="truncate text-muted-foreground"
            style={{ marginTop: `${urlMarginTop}px`, fontSize: `${metaFontSize}px` }}
          >
            {formatRecentVisitUrl(item.url)}
          </div>
          <div
            className="flex items-center text-muted-foreground"
            style={{
              marginTop: `${timeMarginTop}px`,
              gap: `${timeGap}px`,
              fontSize: `${timeFontSize}px`,
            }}
          >
            <Clock3
              className="shrink-0"
              style={{ width: `${Math.round(12 * scale)}px`, height: `${Math.round(12 * scale)}px` }}
            />
            <span>{formatRecentVisitTime(item.lastVisitedAt)}</span>
          </div>
        </div>
      </a>

      <div
        className="absolute right-1 top-1 opacity-0 transition-opacity group-hover:opacity-100"
        style={{ display: isAnyDragging ? "none" : undefined }}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`从首页隐藏 ${item.title}`}
          className="h-7 w-7"
          onPointerDown={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onRemove?.(item.id);
          }}
        >
          <X className="h-3.5 w-3.5 text-muted-foreground/80" />
        </Button>
      </div>
    </div>
  );
});


