import { DragOverlay } from "@dnd-kit/core";

import { snapOverlayToCursorCenter } from "@/shared/lib/dnd/dndModifiers";
import { CompactLinkDragPreview } from "@/shared/ui/links/CompactLinkDragPreview";
import type { SiteLink } from "@/shared/types/link";

export function QuickEditDragOverlay({
  activeDragItem,
}: {
  activeDragItem: SiteLink | null;
}) {
  return (
    <DragOverlay dropAnimation={null} modifiers={[snapOverlayToCursorCenter]}>
      {activeDragItem ? (
        <CompactLinkDragPreview
          title={activeDragItem.title}
          url={activeDragItem.url}
          icon={activeDragItem.icon}
        />
      ) : null}
    </DragOverlay>
  );
}

