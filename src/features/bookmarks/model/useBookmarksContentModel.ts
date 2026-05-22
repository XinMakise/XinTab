import { useMemo } from "react";

import { useStandardPageLinksContentModel } from "@/shared/lib/standard-page/useStandardPageLinksContentModel";
import type { Category } from "@/shared/types/category";
import type { SiteLink } from "@/shared/types/link";

import type { BookmarksCategoryNavProps } from "../ui/BookmarksCategoryNav";
import type { BookmarksContentModel } from "../ui/BookmarksContent";

type UseBookmarksContentModelOptions = {
  status: BookmarksContentModel["status"];
  categories: Category[];
  activeCategory: Category | undefined;
  activeCategoryId: string | undefined;
  layout: "top" | "left" | "all";
  columnsPerRow: number;
  maxVisibleRows: number;
  dragSourceCategoryId: string | null;
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
  onSelectCategory: (categoryId: string) => void;
  onEditLink: (value: { categoryId: string; link: SiteLink } | null) => void;
  onAddBookmark: (categoryId: string, link: SiteLink) => void;
  onRemoveBookmark: (categoryId: string, linkId: string) => void;
};

export function useBookmarksContentModel({
  status,
  categories,
  activeCategory,
  activeCategoryId,
  layout,
  columnsPerRow,
  maxVisibleRows,
  dragSourceCategoryId,
  panelState,
  panelActions,
  onSelectCategory,
  onEditLink,
  onAddBookmark,
  onRemoveBookmark,
}: UseBookmarksContentModelOptions): {
  contentModel: BookmarksContentModel;
  categoryNavProps: BookmarksCategoryNavProps;
} {
  const content = useStandardPageLinksContentModel({
    mode: layout,
    categories,
    activeCategory,
    columnsPerRow,
    maxVisibleRows,
    panelState,
    panelActions,
    emptyHint: "请选择一个分类",
    enableCustomIcon: false,
    onRemoveLink: onRemoveBookmark,
    onEditLink: (categoryId, link) => onEditLink({ categoryId, link }),
    onAddLink: onAddBookmark,
  });

  return useMemo(() => ({
    contentModel: {
      status,
      content,
    },
    categoryNavProps: {
      categories,
      layout,
      activeCategoryId,
      dragSourceCategoryId: dragSourceCategoryId ?? undefined,
      editingCategoryId: panelState.editingCategoryId,
      addCategoryDialogOpen: panelState.addCategoryDialogOpen,
      newCategoryName: panelState.newCategoryName,
      onSelectCategory,
      onStartEditCategory: panelActions.setEditingCategoryId,
      onRenameCategory: panelActions.handleRenameCategory,
      onAddCategoryDialogOpenChange: panelActions.setAddCategoryDialogOpen,
      onNewCategoryNameChange: panelActions.setNewCategoryName,
      onSubmitNewCategory: panelActions.handleAddCategory,
    },
  }), [
    activeCategoryId,
    categories,
    content,
    dragSourceCategoryId,
    layout,
    onSelectCategory,
    panelActions.handleAddCategory,
    panelActions.handleRenameCategory,
    panelActions.setAddCategoryDialogOpen,
    panelActions.setEditingCategoryId,
    panelActions.setNewCategoryName,
    panelState.addCategoryDialogOpen,
    panelState.editingCategoryId,
    panelState.newCategoryName,
    status,
  ]);
}

