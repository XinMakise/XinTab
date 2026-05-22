import React, { useMemo } from "react";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { useDndContext } from "@dnd-kit/core";

import { SortableLinkCard } from "@/shared/ui/links/SortableLinkCard";
import { AddWebsiteDialog } from "@/features/manual-nav/ui/AddWebsiteDialog";
import { CategoryDropTarget } from "@/shared/ui/standard-page/CategoryDropTarget";
import { DropIndicator } from "@/shared/ui/standard-page/DropIndicator";
import { useResponsiveGridStyle } from "@/shared/lib/standard-page/useResponsiveGridStyle";
import { dndContainerId, dndLinkId, parseDndLinkId } from "@/shared/lib/dnd/dndUtils";
import { cn } from "@/shared/lib/cn";
import type { Category } from "@/shared/types/category";
import type { SiteLink } from "@/shared/types/link";

type CategoryLinksPanelProps = {
  categoryId: string;
  links: SiteLink[];
  categories: Category[];
  columnsPerRow: number;
  onRemove: (linkId: string) => void;
  onEdit: (link: SiteLink) => void;
  onAdd: (categoryId: string, link: SiteLink) => void;
  showAddCard?: boolean;
  enableCustomIcon?: boolean;
  highlightWhenOver?: boolean;
};

function useDropIndicatorIndex(
  links: SiteLink[],
  categoryId: string,
): number | null {
  const { active, over } = useDndContext();

  if (!active || !over) return null;

  const activeType = active.data.current?.type;
  if (
    activeType !== "link" &&
    activeType !== "nav-link" &&
    activeType !== "recent-link"
  ) {
    return null;
  }

  if (over.id === dndContainerId(categoryId)) {
    return links.length === 0 ? 0 : null;
  }

  const overLinkId = parseDndLinkId(over.id);
  if (!overLinkId) return null;

  const overIndex = links.findIndex((l) => l.id === overLinkId);
  if (overIndex < 0) return null;

  // 同分类内拖拽：rectSortingStrategy 的 transform 会将拖拽卡片自身移动到间隙位置，
  // SortableLinkCard 在 isDragging 时渲染为虚线占位符，无需额外指示器
  const activeLinkId = parseDndLinkId(active.id);
  if (activeLinkId && links.some((l) => l.id === activeLinkId)) {
    return null;
  }

  // 外部拖入（跨分类 / 最近访问）：在 over 卡片位置插入 DropIndicator
  return overIndex;
}

export function CategoryLinksPanel({
  categoryId,
  links,
  categories,
  columnsPerRow,
  onRemove,
  onEdit,
  onAdd,
  showAddCard = true,
  enableCustomIcon = true,
  highlightWhenOver = false,
}: CategoryLinksPanelProps) {
  const { containerRef, gridStyle } = useResponsiveGridStyle(columnsPerRow);
  const dropBeforeIndex = useDropIndicatorIndex(links, categoryId);

  const sortableIds = useMemo(
    () => links.map((link) => dndLinkId(link.id)),
    [links],
  );

  return (
    <CategoryDropTarget id={dndContainerId(categoryId)}>
      {({ setNodeRef, isOver }) => (
        <div
          ref={setNodeRef}
          className={cn(
            highlightWhenOver && isOver && "rounded-lg ring-2 ring-primary ring-offset-2 ring-offset-background",
          )}
        >
          <SortableContext
            id={dndContainerId(categoryId)}
            items={sortableIds}
            strategy={rectSortingStrategy}
          >
            <div ref={containerRef} className="grid gap-3" style={gridStyle}>
              {links.map((link, index) => (
                <React.Fragment key={link.id}>
                  {index === dropBeforeIndex && <DropIndicator />}
                  <SortableLinkCard
                    id={dndLinkId(link.id)}
                    link={link}
                    onRemove={onRemove}
                    onEdit={onEdit}
                  />
                </React.Fragment>
              ))}
              {dropBeforeIndex === links.length && <DropIndicator />}
              {showAddCard ? (
                <AddWebsiteDialog
                  categories={categories}
                  defaultCategoryId={categoryId}
                  onAdd={onAdd}
                  enableCustomIcon={enableCustomIcon}
                />
              ) : null}
            </div>
          </SortableContext>
        </div>
      )}
    </CategoryDropTarget>
  );
}
