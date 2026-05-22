import { useCallback, useRef } from "react";
import {
  type DragEndEvent,
} from "@dnd-kit/core";

import type { Category } from "@/shared/types/category";
import { moveBookmark } from "@/features/bookmarks/lib/chromeBookmarkEditor";
import { toast } from "@/shared/ui/primitives/use-toast";
import {
  moveLinkById,
  reorderCategoriesById,
} from "@/shared/lib/dnd/dndMove";
import { resolveStandardPageDragEndAction } from "@/shared/lib/dnd/dndDropResolvers";
import { useStandardPageDndSession } from "@/shared/lib/standard-page/useStandardPageDndSession";

interface UseBookmarksDndOptions {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  categoryById: Map<string, Category>;
  setActiveCategoryId: (id: string) => void;
  onCategoryReorder: (newOrder: string[]) => void;
}

export function useBookmarksDnd({
  categories,
  setCategories,
  categoryById,
  setActiveCategoryId,
  onCategoryReorder,
}: UseBookmarksDndOptions) {
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
    categories,
    categoryById,
  });

  const snapshotRef = useRef<Category[]>([]);

  const rollback = useCallback(
    (err: unknown) => {
      setCategories(snapshotRef.current);
      toast({
        title: "操作失败",
        description: err instanceof Error ? err.message : "未知错误",
        variant: "destructive",
      });
    },
    [setCategories],
  );

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
        const reordered = reorderCategoriesById(
          categoriesRef.current,
          action.activeCategoryId,
          action.overCategoryId,
        );
        if (reordered === categoriesRef.current) return;
        onCategoryReorder(reordered.map((category) => category.id));
        return;
      }

      snapshotRef.current = categoriesRef.current;

      if (action.resolution.kind === "same-category") {
        const { categoryId, fromIndex, toIndex } = action.resolution;
        if (fromIndex === toIndex) return;

        setCategories((prev) =>
          moveLinkById(
            prev,
            action.linkId,
            categoryId,
            categoryId,
            toIndex,
          ),
        );

        moveBookmark(action.linkId, {
          parentId: categoryId,
          index: toIndex,
        }).catch(rollback);
        return;
      }

      const { fromCategoryId, toCategoryId, toIndex } = action.resolution;

      setCategories((prev) =>
        moveLinkById(
          prev,
          action.linkId,
          fromCategoryId,
          toCategoryId,
          toIndex,
        ),
      );
      setActiveCategoryId(toCategoryId);

      moveBookmark(action.linkId, {
        parentId: toCategoryId,
        index: toIndex,
      }).catch(rollback);
    },
    [
      categoriesRef,
      categoryByIdRef,
      lastOverIdRef,
      onCategoryReorder,
      resetDragState,
      rollback,
      setActiveCategoryId,
      setCategories,
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
    onDragStart: handleDragStart,
    onDragOver: handleDragOver,
    onDragEnd,
    onDragCancel,
  };
}


