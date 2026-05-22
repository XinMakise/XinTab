import { useCallback, useMemo, useRef, useState } from "react";
import type {
  DragOverEvent,
  DragStartEvent,
} from "@dnd-kit/core";

import { findCategoryIdByLinkIdFast, findLinkByIdFast } from "@/shared/lib/dnd/categoryUtils";
import { createCategoryFirstCollisionDetection } from "@/shared/lib/dnd/dndCollision";
import { useGlobalGrabbingCursor } from "@/shared/lib/hooks/useGlobalGrabbingCursor";
import { useDefaultPointerSensors } from "@/shared/lib/dnd/dndSensors";
import { parseDndLinkId } from "@/shared/lib/dnd/dndUtils";
import { isOverCategoryButton } from "@/shared/lib/dnd/dndTargets";
import { useDndLifecycleState } from "@/shared/lib/hooks/useDndLifecycleState";
import type { Category } from "@/shared/types/category";
import type { SiteLink } from "@/shared/types/link";

type UseStandardPageDndSessionOptions = {
  categories: Category[];
  categoryById: Map<string, Category>;
  collisionOptions?: {
    enableCategoryBarZone?: boolean;
    recentLinkUsesContainerPointer?: boolean;
  };
};

export function useStandardPageDndSession({
  categories,
  categoryById,
  collisionOptions,
}: UseStandardPageDndSessionOptions) {
  const {
    activeDragItem: activeDragLink,
    dragSourceCategoryId,
    lastOverIdRef,
    beginDrag,
    rememberOverId,
    resetDragLifecycle,
  } = useDndLifecycleState<SiteLink>();
  const [activeDragCategory, setActiveDragCategory] = useState<Category | null>(null);
  const [dragOverZone, setDragOverZone] = useState<"card-grid" | "category-bar">("card-grid");

  const sensors = useDefaultPointerSensors();
  const customCollisionDetection = useMemo(
    () => createCategoryFirstCollisionDetection(collisionOptions),
    [collisionOptions],
  );
  useGlobalGrabbingCursor(Boolean(activeDragLink || activeDragCategory));

  const categoriesRef = useRef(categories);
  categoriesRef.current = categories;

  const categoryByIdRef = useRef(categoryById);
  categoryByIdRef.current = categoryById;

  const resetDragState = useCallback(() => {
    setDragOverZone("card-grid");
    setActiveDragCategory(null);
    resetDragLifecycle();
  }, [resetDragLifecycle]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setDragOverZone("card-grid");
    setActiveDragCategory(null);

    if (event.active.data.current?.type === "category-button") {
      const category = categoriesRef.current.find((item) => item.id === event.active.id);
      beginDrag(null);
      if (category) {
        setActiveDragCategory(category);
      }
      return;
    }

    const linkId = parseDndLinkId(event.active.id);
    beginDrag(
      linkId ? findLinkByIdFast(categoriesRef.current, linkId) : null,
      linkId ? findCategoryIdByLinkIdFast(categoriesRef.current, linkId) : null,
    );
  }, [beginDrag]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    if (!event.over) return;
    rememberOverId(event.over.id);
    setDragOverZone(isOverCategoryButton(event.over.data.current) ? "category-bar" : "card-grid");
  }, [rememberOverId]);

  return {
    sensors,
    customCollisionDetection,
    activeDragLink,
    activeDragCategory,
    dragSourceCategoryId,
    dragOverZone,
    categoriesRef,
    categoryByIdRef,
    lastOverIdRef,
    resetDragState,
    handleDragStart,
    handleDragOver,
  };
}

