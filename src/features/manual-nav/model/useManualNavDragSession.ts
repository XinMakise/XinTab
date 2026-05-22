import { useCallback, useMemo, useRef, useState } from "react";

import type {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  Modifier,
  UniqueIdentifier,
} from "@dnd-kit/core";

import { parseDndLinkId, parseRecentVisitLinkId } from "@/shared/lib/dnd/dndUtils";
import { resolveLinkDropIndex } from "@/shared/lib/dnd/dndMove";
import { snapOverlayToCursorCenter } from "@/shared/lib/dnd/dndModifiers";
import { useGlobalGrabbingCursor } from "@/shared/lib/hooks/useGlobalGrabbingCursor";
import type { RecentVisitItem } from "@/shared/types/recent-visit";
import type { SiteLink } from "@/shared/types/link";
import type { Category } from "@/shared/types/category";

type UseManualNavDragSessionOptions = {
  recentVisits: RecentVisitItem[];
  activeDragLink: SiteLink | null;
  categories: Category[];
  resolveDropCategoryId: (overId: UniqueIdentifier | null | undefined) => string | null;
  addRecentVisitToCategory: (categoryId: string, visit: RecentVisitItem, insertIndex?: number) => void;
  onDragStart: (event: DragStartEvent) => void;
  onDragOver: (event: DragOverEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
  onDragCancel: () => void;
};

export function useManualNavDragSession({
  recentVisits,
  activeDragLink,
  categories,
  resolveDropCategoryId,
  addRecentVisitToCategory,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDragCancel,
}: UseManualNavDragSessionOptions) {
  const [activeRecentVisit, setActiveRecentVisit] = useState<RecentVisitItem | null>(null);
  const categoriesRef = useRef(categories);
  categoriesRef.current = categories;
  useGlobalGrabbingCursor(Boolean(activeRecentVisit));

  const recentVisitById = useMemo(() => {
    const next = new Map<string, RecentVisitItem>();
    for (const visit of recentVisits) {
      next.set(visit.id, visit);
    }
    return next;
  }, [recentVisits]);

  const dragOverlayModifiers = useMemo<Modifier[]>(() => {
    if (activeRecentVisit || activeDragLink) {
      return [snapOverlayToCursorCenter];
    }
    return [];
  }, [activeRecentVisit, activeDragLink]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const recentVisitId = parseRecentVisitLinkId(event.active.id);
    if (recentVisitId) {
      setActiveRecentVisit(recentVisitById.get(recentVisitId) ?? null);
      return;
    }

    onDragStart(event);
  }, [onDragStart, recentVisitById]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    onDragOver(event);
  }, [onDragOver]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const recentVisitId = parseRecentVisitLinkId(event.active.id);
    if (!recentVisitId) {
      onDragEnd(event);
      return;
    }

    const recentVisit = recentVisitById.get(recentVisitId);
    setActiveRecentVisit(null);
    if (!recentVisit) return;

    // 拖出所有有效目标范围 → 取消
    if (!event.over) return;

    const overId = event.over.id;
    const targetCategoryId = resolveDropCategoryId(overId);
    if (!targetCategoryId) return;

    // 计算插入位置：悬停在链接上则插入该链接位置，否则末尾
    const overLinkId = parseDndLinkId(overId);
    const targetCategory = categoriesRef.current.find((c) => c.id === targetCategoryId);
    const insertIndex = overLinkId
      ? resolveLinkDropIndex(targetCategory?.links ?? [], overLinkId, -1)
      : undefined;

    addRecentVisitToCategory(
      targetCategoryId,
      recentVisit,
      typeof insertIndex === "number" && insertIndex >= 0 ? insertIndex : undefined,
    );
  }, [addRecentVisitToCategory, onDragEnd, recentVisitById, resolveDropCategoryId]);

  const handleDragCancel = useCallback(() => {
    setActiveRecentVisit(null);
    onDragCancel();
  }, [onDragCancel]);

  return {
    activeRecentVisit,
    dragOverlayModifiers,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  };
}

