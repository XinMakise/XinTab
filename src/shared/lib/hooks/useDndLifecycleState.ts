import { useCallback, useRef, useState } from "react";
import type { UniqueIdentifier } from "@dnd-kit/core";

export function useDndLifecycleState<TItem>() {
  const [activeDragItem, setActiveDragItem] = useState<TItem | null>(null);
  const [dragSourceCategoryId, setDragSourceCategoryId] = useState<string | null>(null);
  const lastOverIdRef = useRef<UniqueIdentifier | null>(null);

  const beginDrag = useCallback((item: TItem | null, sourceCategoryId: string | null = null) => {
    lastOverIdRef.current = null;
    setActiveDragItem(item);
    setDragSourceCategoryId(sourceCategoryId);
  }, []);

  const rememberOverId = useCallback((overId: UniqueIdentifier | null | undefined) => {
    if (overId == null) return;
    lastOverIdRef.current = overId;
  }, []);

  const resetDragLifecycle = useCallback(() => {
    setActiveDragItem(null);
    setDragSourceCategoryId(null);
    lastOverIdRef.current = null;
  }, []);

  return {
    activeDragItem,
    dragSourceCategoryId,
    lastOverIdRef,
    beginDrag,
    rememberOverId,
    resetDragLifecycle,
  };
}
