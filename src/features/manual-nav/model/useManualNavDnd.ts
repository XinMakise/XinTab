import { useCallback } from "react";
import {
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";

import type { Category } from "@/shared/types/category";
import type { ManualNavState } from "@/shared/types/manual-nav";
import {
  moveLinkById,
  reorderCategoriesById,
  reorderLinksInCategory,
} from "@/shared/lib/dnd/dndMove";
import { resolveStandardPageDragEndAction } from "@/shared/lib/dnd/dndDropResolvers";
import { resolveStandardDropCategoryId } from "@/shared/lib/dnd/dndTargets";
import { useStandardPageDndSession } from "@/shared/lib/standard-page/useStandardPageDndSession";

interface UseManualNavDndOptions {
  state: ManualNavState;
  setState: React.Dispatch<React.SetStateAction<ManualNavState>>;
  categoryById: Map<string, Category>;
  setActiveCategoryId: (id: string) => void;
}

export function useManualNavDnd({
  state,
  setState,
  categoryById,
  setActiveCategoryId,
}: UseManualNavDndOptions) {
  const {
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
  } = useStandardPageDndSession({
    categories: state.categories,
    categoryById,
    collisionOptions: {
      enableCategoryBarZone: true,
      recentLinkUsesContainerPointer: true,
    },
  });

  const reorderLink = useCallback(
    (categoryId: string, fromIndex: number, toIndex: number) => {
      if (fromIndex === toIndex) return;
      setState((prev) => ({
        ...prev,
        categories: reorderLinksInCategory(prev.categories, categoryId, fromIndex, toIndex),
      }));
    },
    [setState],
  );

  const moveLink = useCallback(
    (linkId: string, fromCategoryId: string, toCategoryId: string, toIndex: number) => {
      setState((prev) => {
        return {
          ...prev,
          categories: moveLinkById(
            prev.categories,
            linkId,
            fromCategoryId,
            toCategoryId,
            toIndex,
          ),
        };
      });
    },
    [setState],
  );

  const resolveDropCategoryId = useCallback((overId: UniqueIdentifier | null | undefined) => {
    return resolveStandardDropCategoryId(
      overId ?? lastOverIdRef.current,
      categoryByIdRef.current,
      categoriesRef.current,
    );
  }, [categoriesRef, categoryByIdRef, lastOverIdRef]);

  const onDragEnd = useCallback(
    (e: DragEndEvent) => {
      const overId = e.over?.id ?? lastOverIdRef.current;
      const action = resolveStandardPageDragEndAction({
        categories: categoriesRef.current,
        categoryById: categoryByIdRef.current,
        activeId: e.active.id,
        activeType: e.active.data.current?.type,
        overId,
      });
      resetDragState();
      if (!action) return;

      if (action.kind === "reorder-category") {
        setState((prev) => ({
          ...prev,
          categories: reorderCategoriesById(
            prev.categories,
            action.activeCategoryId,
            action.overCategoryId,
          ),
        }));
        return;
      }

      if (action.resolution.kind === "same-category") {
        reorderLink(
          action.resolution.categoryId,
          action.resolution.fromIndex,
          action.resolution.toIndex,
        );
        return;
      }

      moveLink(
        action.linkId,
        action.resolution.fromCategoryId,
        action.resolution.toCategoryId,
        action.resolution.toIndex,
      );
      setActiveCategoryId(action.resolution.toCategoryId);
    },
    [
      categoriesRef,
      categoryByIdRef,
      lastOverIdRef,
      moveLink,
      reorderLink,
      resetDragState,
      setActiveCategoryId,
      setState,
    ],
  );

  const onDragCancel = useCallback(() => {
    resetDragState();
  }, [resetDragState]);

  return {
    sensors,
    customCollisionDetection,
    activeDragLink,
    activeDragCategory,
    dragSourceCategoryId,
    dragOverZone,
    moveLink,
    resolveDropCategoryId,
    onDragStart: handleDragStart,
    onDragEnd,
    onDragOver: handleDragOver,
    onDragCancel,
  };
}

