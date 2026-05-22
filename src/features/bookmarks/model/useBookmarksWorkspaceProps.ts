import { useMemo, type ComponentProps, type Dispatch, type SetStateAction } from "react";

import { useBookmarksContentModel } from "@/features/bookmarks/model/useBookmarksContentModel";
import { useBookmarksDnd } from "@/features/bookmarks/model/useBookmarksDnd";
import { useStandardPageLayoutState } from "@/shared/lib/standard-page/useStandardPageLayoutState";
import { snapOverlayToCursorCenter } from "@/shared/lib/dnd/dndModifiers";
import type { Category } from "@/shared/types/category";
import type { SiteLink } from "@/shared/types/link";

import { BookmarksWorkspace } from "../ui/BookmarksWorkspace";

type UseBookmarksWorkspacePropsOptions = {
  status: {
    error: string | null;
    loading: boolean;
  };
  categories: Category[];
  setCategories: Dispatch<SetStateAction<Category[]>>;
  categoryById: Map<string, Category>;
  activeCategory: Category | undefined;
  activeCategoryId: string | undefined;
  setActiveCategoryId: Dispatch<SetStateAction<string | undefined>>;
  layout: "top" | "left" | "all";
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
  onCategoryReorder: (order: string[]) => void;
  onEditLink: (value: { categoryId: string; link: SiteLink } | null) => void;
  onAddBookmark: (categoryId: string, link: SiteLink) => void;
  onRemoveBookmark: (categoryId: string, linkId: string) => void;
};

export function useBookmarksWorkspaceProps({
  status,
  categories,
  setCategories,
  categoryById,
  activeCategory,
  activeCategoryId,
  setActiveCategoryId,
  layout,
  columnsPerRow,
  maxVisibleRows,
  panelState,
  panelActions,
  onCategoryReorder,
  onEditLink,
  onAddBookmark,
  onRemoveBookmark,
}: UseBookmarksWorkspacePropsOptions): {
  workspaceProps: ComponentProps<typeof BookmarksWorkspace>;
} {
  const {
    categoryBarRef,
    categoryNavRef,
  } = useStandardPageLayoutState({
    items: categories,
    activeId: activeCategoryId,
    onChange: setActiveCategoryId,
    layout,
    columnsPerRow,
    scrollOnChange: true,
  });

  const {
    sensors,
    customCollisionDetection,
    activeDragLink,
    activeDragCategory,
    dragSourceCategoryId,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDragCancel,
  } = useBookmarksDnd({
    categories,
    setCategories,
    categoryById,
    setActiveCategoryId,
    onCategoryReorder,
  });

  const dragOverlayModifiers = useMemo(
    () => (activeDragLink ? [snapOverlayToCursorCenter] : []),
    [activeDragLink],
  );

  const { contentModel, categoryNavProps } = useBookmarksContentModel({
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
    onSelectCategory: setActiveCategoryId,
    onEditLink,
    onAddBookmark,
    onRemoveBookmark,
  });

  return {
    workspaceProps: {
      sensors,
      collisionDetection: customCollisionDetection,
      onDragStart,
      onDragOver,
      onDragEnd,
      onDragCancel,
      error: status.error,
      loading: status.loading,
      layout,
      categories,
      categoryBarRef,
      categoryNavRef,
      categoryNavProps,
      contentModel,
      activeDragLink,
      activeDragCategory,
      dragOverlayModifiers,
    },
  };
}

