import { DragOverlay, type Modifier } from "@dnd-kit/core";

import { CompactLinkDragPreview } from "@/shared/ui/links/CompactLinkDragPreview";
import { Button } from "@/shared/ui/primitives/button";
import type { Category } from "@/shared/types/category";
import type { SiteLink } from "@/shared/types/link";

type BookmarksDragOverlayProps = {
  activeDragLink: SiteLink | null;
  activeDragCategory: Category | null;
  modifiers: Modifier[];
};

export function BookmarksDragOverlay({
  activeDragLink,
  activeDragCategory,
  modifiers,
}: BookmarksDragOverlayProps) {
  return (
    <DragOverlay dropAnimation={null} modifiers={modifiers}>
      {activeDragLink ? (
        <CompactLinkDragPreview
          title={activeDragLink.title}
          url={activeDragLink.url}
          icon={activeDragLink.icon}
        />
      ) : activeDragCategory ? (
        <Button variant="default" className="cursor-grabbing scale-105 shadow-lg ring-2 ring-primary/50">
          <span className="truncate">{activeDragCategory.name}</span>
          {activeDragCategory.links.length > 0 ? (
            <span className="ml-2 rounded-sm bg-muted px-1.5 py-0.5 text-[10px] leading-none text-muted-foreground">
              {activeDragCategory.links.length}
            </span>
          ) : null}
        </Button>
      ) : null}
    </DragOverlay>
  );
}


