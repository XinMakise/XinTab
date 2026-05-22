import { useCallback, useMemo, useRef, useState } from "react";
import {
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";

import { createQuickEditCollisionDetection } from "@/shared/lib/dnd/dndCollision";
import { parseQeManualCategoryId, parseQeNavLinkId } from "@/shared/lib/dnd/dndUtils";
import { useDefaultPointerSensors } from "@/shared/lib/dnd/dndSensors";
import { useGlobalGrabbingCursor } from "@/shared/lib/hooks/useGlobalGrabbingCursor";
import { useDndLifecycleState } from "@/shared/lib/hooks/useDndLifecycleState";
import type { Category } from "@/shared/types/category";
import type { SiteLink } from "@/shared/types/link";

type UseQuickEditDndSessionOptions = {
  categories: Category[];
};

export function useQuickEditDndSession({
  categories,
}: UseQuickEditDndSessionOptions) {
  const {
    activeDragItem,
    dragSourceCategoryId,
    lastOverIdRef,
    beginDrag,
    rememberOverId,
    resetDragLifecycle,
  } = useDndLifecycleState<SiteLink>();
  const [bookmarkDropTargetId, setBookmarkDropTargetId] = useState<string | null>(null);

  const categoriesRef = useRef(categories);
  categoriesRef.current = categories;

  const sensors = useDefaultPointerSensors();
  const collisionDetection = useMemo(() => createQuickEditCollisionDetection(), []);
  useGlobalGrabbingCursor(Boolean(activeDragItem));

  const resetDragState = useCallback(() => {
    setBookmarkDropTargetId(null);
    resetDragLifecycle();
  }, [resetDragLifecycle]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current;
    if ((data?.type === "bookmark-link" || data?.type === "nav-link") && data.link) {
      beginDrag(
        data.link as SiteLink,
        data.type === "nav-link" ? parseQeNavLinkId(event.active.id)?.categoryId ?? null : null,
      );
      return;
    }

    beginDrag(null);
  }, [beginDrag]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    rememberOverId(event.over?.id);

    if (!event.active.data.current || event.active.data.current.type !== "bookmark-link") {
      setBookmarkDropTargetId(null);
      return;
    }

    if (!event.over) {
      setBookmarkDropTargetId(null);
      return;
    }

    const overId = String(event.over.id);
    const navTarget = parseQeNavLinkId(overId);
    const categoryTarget = parseQeManualCategoryId(overId);
    setBookmarkDropTargetId(navTarget || categoryTarget ? overId : null);
  }, [rememberOverId]);

  return {
    sensors,
    collisionDetection,
    categoriesRef,
    activeDragItem,
    dragSourceCategoryId,
    lastOverIdRef,
    bookmarkDropTargetId,
    resetDragState,
    handleDragStart,
    handleDragOver,
  };
}

