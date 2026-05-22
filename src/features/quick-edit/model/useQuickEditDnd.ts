import { useCallback } from "react";
import { type DragEndEvent } from "@dnd-kit/core";

import { toast } from "@/shared/ui/primitives/use-toast";
import { useQuickEditDndSession } from "@/features/quick-edit/model/useQuickEditDndSession";
import { resolveQuickEditDragEndAction } from "@/shared/lib/dnd/dndDropResolvers";
import type { Category } from "@/shared/types/category";
import type { SiteLink } from "@/shared/types/link";

interface UseQuickEditDndOptions {
  categories: Category[];
  onAddLink: (categoryId: string, link: SiteLink) => void;
  onMoveLink?: (
    linkId: string,
    fromCategoryId: string,
    toCategoryId: string,
    toIndex: number,
  ) => void;
}

export function useQuickEditDnd({
  categories,
  onAddLink,
  onMoveLink,
}: UseQuickEditDndOptions) {
  const {
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
  } = useQuickEditDndSession({ categories });

  const onDragEnd = useCallback(
    (e: DragEndEvent) => {
      const activeType = e.active.data.current?.type;
      const action = resolveQuickEditDragEndAction({
        categories: categoriesRef.current,
        activeId: e.active.id,
        activeLink: (e.active.data.current?.link as SiteLink | undefined) ?? null,
        overId: activeType === "bookmark-link" ? e.over?.id : (e.over?.id ?? lastOverIdRef.current),
      });
      resetDragState();
      if (!action) return;

      if (action.kind === "duplicate-bookmark") {
        toast({
          title: "已存在",
          description: "该分类里已有相同 URL 的链接",
        });
        return;
      }

      if (action.kind === "add-bookmark") {
        const newLink: SiteLink = {
          id: crypto.randomUUID(),
          title: action.link.title,
          url: action.link.url,
        };

        onAddLink(action.targetCategoryId, newLink);

        if (action.targetIndex >= 0 && onMoveLink) {
          onMoveLink(
            newLink.id,
            action.targetCategoryId,
            action.targetCategoryId,
            action.targetIndex,
          );
        }

        toast({
          title: "已添加",
          description: `"${newLink.title}" 已添加到分类`,
        });
        return;
      }

      if (!onMoveLink) return;

      onMoveLink(
        action.linkId,
        action.fromCategoryId,
        action.toCategoryId,
        action.toIndex,
      );
    },
    [categoriesRef, lastOverIdRef, onAddLink, onMoveLink, resetDragState],
  );

  const onDragCancel = useCallback(() => {
    resetDragState();
  }, [resetDragState]);

  return {
    sensors,
    collisionDetection,
    onDragStart: handleDragStart,
    onDragOver: handleDragOver,
    onDragEnd,
    onDragCancel,
    activeDragItem,
    dragSourceCategoryId,
    bookmarkDropTargetId,
  };
}


