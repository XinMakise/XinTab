import type { ComponentProps, Dispatch, SetStateAction } from "react";

import { useManualNavContentModel } from "@/features/manual-nav/model/useManualNavContentModel";
import { useManualNavDnd } from "@/features/manual-nav/model/useManualNavDnd";
import { useManualNavDragSession } from "@/features/manual-nav/model/useManualNavDragSession";
import { useStandardPageLayoutState } from "@/shared/lib/standard-page/useStandardPageLayoutState";
import type { Category } from "@/shared/types/category";
import type { ManualNavState } from "@/shared/types/manual-nav";
import type { RecentVisitItem } from "@/shared/types/recent-visit";
import type { SiteLink } from "@/shared/types/link";

import { ManualNavWorkspace } from "../ui/ManualNavWorkspace";

const CATEGORY_BAR_ZONE_ID = "category-bar-zone";

type UseManualNavWorkspacePropsOptions = {
  state: ManualNavState;
  setState: Dispatch<SetStateAction<ManualNavState>>;
  categoryById: Map<string, Category>;
  activeCategoryId: string;
  setActiveCategoryId: Dispatch<SetStateAction<string>>;
  categoryLayout: "top" | "left" | "all";
  columnsPerRow: number;
  maxVisibleRows: number;
  panelState: {
    expandedCategories: Set<string>;
    editingCategoryId: string | null;
    addCategoryDialogOpen: boolean;
    newCategoryName: string;
  };
  panelActions: {
    setEditingCategoryId: (categoryId: string | null) => void;
    setAddCategoryDialogOpen: (open: boolean) => void;
    setNewCategoryName: (value: string) => void;
    handleAddCategory: () => void;
    handleRenameCategory: (categoryId: string, newName: string) => void;
    toggleCategoryExpanded: (categoryId: string) => void;
  };
  recentVisits: RecentVisitItem[];
  historyAvailable: boolean;
  showRecentVisits: boolean;
  recentVisitsRows: number;
  recentVisitsCardSize: number;
  onHideRecentVisit: (recentVisitId: string) => void;
  addRecentVisitToCategory: (categoryId: string, visit: RecentVisitItem) => void;
  onRemoveLink: (categoryId: string, linkId: string) => void;
  onEditLink: (value: { categoryId: string; link: SiteLink } | null) => void;
  onAddLink: (categoryId: string, link: SiteLink) => void;
};

export function useManualNavWorkspaceProps({
  state,
  setState,
  categoryById,
  activeCategoryId,
  setActiveCategoryId,
  categoryLayout,
  columnsPerRow,
  maxVisibleRows,
  panelState,
  panelActions,
  recentVisits,
  historyAvailable,
  showRecentVisits,
  recentVisitsRows,
  recentVisitsCardSize,
  onHideRecentVisit,
  addRecentVisitToCategory,
  onRemoveLink,
  onEditLink,
  onAddLink,
}: UseManualNavWorkspacePropsOptions): {
  workspaceProps: ComponentProps<typeof ManualNavWorkspace>;
  moveLink: (linkId: string, fromCategoryId: string, toCategoryId: string, toIndex: number) => void;
} {
  const {
    activeItem: activeCategory,
    categoryBarRef,
    categoryNavRef,
  } = useStandardPageLayoutState({
    items: state.categories,
    activeId: activeCategoryId,
    onChange: setActiveCategoryId,
    layout: categoryLayout,
    columnsPerRow,
    scrollOnChange: true,
  });

  const {
    sensors,
    customCollisionDetection,
    activeDragLink,
    activeDragCategory,
    dragSourceCategoryId,
    moveLink,
    resolveDropCategoryId,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDragCancel,
  } = useManualNavDnd({
    state,
    setState,
    categoryById,
    setActiveCategoryId,
  });

  const {
    activeRecentVisit,
    dragOverlayModifiers,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  } = useManualNavDragSession({
    recentVisits,
    activeDragLink,
    categories: state.categories,
    resolveDropCategoryId,
    addRecentVisitToCategory,
    onDragStart,
    onDragOver,
    onDragEnd,
    onDragCancel,
  });

  const contentModel = useManualNavContentModel({
    categories: state.categories,
    activeCategory,
    activeCategoryId,
    categoryLayout,
    columnsPerRow,
    maxVisibleRows,
    panelState,
    panelActions,
    recentVisits,
    historyAvailable,
    showRecentVisits,
    recentVisitsRows,
    recentVisitsCardSize,
    onHideRecentVisit,
    categoryBarRef,
    categoryNavRef,
    categoryBarZoneId: CATEGORY_BAR_ZONE_ID,
    dragSourceCategoryId,
    activeRecentVisit,
    onSelectCategory: setActiveCategoryId,
    onRemoveLink,
    onEditLink,
    onAddLink,
  });

  return {
    workspaceProps: {
      sensors,
      collisionDetection: customCollisionDetection,
      onDragStart: handleDragStart,
      onDragOver: handleDragOver,
      onDragEnd: handleDragEnd,
      onDragCancel: handleDragCancel,
      contentModel,
      activeRecentVisit,
      activeDragLink,
      activeDragCategory,
      dragOverlayModifiers,
    },
    moveLink,
  };
}

