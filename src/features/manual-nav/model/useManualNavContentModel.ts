import { useMemo } from "react";
import type { RefObject } from "react";

import { useStandardPageLinksContentModel } from "@/shared/lib/standard-page/useStandardPageLinksContentModel";
import type { Category } from "@/shared/types/category";
import type { RecentVisitItem } from "@/shared/types/recent-visit";
import type { SiteLink } from "@/shared/types/link";

import type { ManualNavContentModel } from "../ui/ManualNavContent";

type UseManualNavContentModelOptions = {
  categories: Category[];
  activeCategory: Category | undefined;
  activeCategoryId: string;
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
  categoryBarRef: RefObject<HTMLDivElement>;
  categoryNavRef: RefObject<HTMLDivElement>;
  categoryBarZoneId: string;
  dragSourceCategoryId: string | null;
  activeRecentVisit: RecentVisitItem | null;
  onSelectCategory: (categoryId: string) => void;
  onRemoveLink: (categoryId: string, linkId: string) => void;
  onEditLink: (value: { categoryId: string; link: SiteLink } | null) => void;
  onAddLink: (categoryId: string, link: SiteLink) => void;
};

export function useManualNavContentModel({
  categories,
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
  categoryBarZoneId,
  dragSourceCategoryId,
  activeRecentVisit,
  onSelectCategory,
  onRemoveLink,
  onEditLink,
  onAddLink,
}: UseManualNavContentModelOptions): ManualNavContentModel {
  const content = useStandardPageLinksContentModel({
    mode: categoryLayout,
    categories,
    activeCategory,
    columnsPerRow,
    maxVisibleRows,
    panelState,
    panelActions,
    emptyHint: "暂无内容",
    highlightWhenOver: !!activeRecentVisit,
    onRemoveLink,
    onEditLink: (categoryId, link) => onEditLink({ categoryId, link }),
    onAddLink,
  });

  return useMemo(() => ({
    view: {
      recentVisits: {
        historyAvailable,
        show: showRecentVisits,
        items: recentVisits,
        rows: recentVisitsRows,
        cardSize: recentVisitsCardSize,
      },
      categoryBar: {
        zoneId: categoryBarZoneId,
        containerRef: categoryBarRef,
        navRef: categoryNavRef,
        categories,
        layout: categoryLayout,
        activeCategoryId,
        dragSourceCategoryId,
        editingCategoryId: panelState.editingCategoryId,
        addCategoryDialogOpen: panelState.addCategoryDialogOpen,
        newCategoryName: panelState.newCategoryName,
      },
      content: content.view,
    },
    actions: {
      recentVisits: {
        onRemoveRecentVisit: onHideRecentVisit,
      },
      categoryBar: {
        onSelectCategory,
        onStartEditCategory: panelActions.setEditingCategoryId,
        onRenameCategory: panelActions.handleRenameCategory,
        onAddCategoryDialogOpenChange: panelActions.setAddCategoryDialogOpen,
        onNewCategoryNameChange: panelActions.setNewCategoryName,
        onSubmitNewCategory: panelActions.handleAddCategory,
      },
      content: content.actions,
    },
  }), [
    activeCategoryId,
    categoryBarRef,
    categoryNavRef,
    categoryBarZoneId,
    categories,
    categoryLayout,
    content,
    dragSourceCategoryId,
    historyAvailable,
    onSelectCategory,
    onHideRecentVisit,
    panelActions.handleAddCategory,
    panelActions.handleRenameCategory,
    panelActions.setAddCategoryDialogOpen,
    panelActions.setEditingCategoryId,
    panelActions.setNewCategoryName,
    panelState,
    recentVisits,
    recentVisitsRows,
    recentVisitsCardSize,
    showRecentVisits,
  ]);
}

