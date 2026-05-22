import type { ComponentProps } from "react";

import { useBookmarksPageDialogsState } from "@/features/bookmarks/model/useBookmarksPageDialogsState";
import { useBookmarksPageState } from "@/features/bookmarks/model/useBookmarksPageState";
import { useBookmarksWorkspaceProps } from "@/features/bookmarks/model/useBookmarksWorkspaceProps";
import {
  useBookmarksSettingsSheetModel,
  type BookmarksSettingsSheetProps,
} from "@/features/settings";
import { useCategoryPanelState } from "@/shared/lib/hooks/useCategoryPanelState";

import { BookmarksPageDialogs } from "../ui/BookmarksPageDialogs";
import { BookmarksWorkspace } from "../ui/BookmarksWorkspace";

export function useBookmarksPage(): {
  workspaceProps: ComponentProps<typeof BookmarksWorkspace>;
  settingsSheetProps: BookmarksSettingsSheetProps;
  dialogsProps: ComponentProps<typeof BookmarksPageDialogs>;
} {
  const {
    setCategories,
    loading,
    error,
    activeId,
    setActiveId,
    uiState,
    orderedCategories,
    categoryById,
    activeCategory,
    layout,
    columnsPerRow,
    handleAddBookmark,
    handleRemoveBookmark,
    handleUpdateBookmark,
    handleCreateFolder,
    handleRenameFolder,
    handleDeleteFolder,
    handleCategoryOrderChange,
    handleLayoutChange,
    handleMaxVisibleRowsChange,
    handleColumnsPerRowChange,
  } = useBookmarksPageState();

  const { panelState, panelActions } = useCategoryPanelState({
    onCreateCategory: handleCreateFolder,
    onRenameCategory: handleRenameFolder,
  });

  const { setEditingLink, onDeleteCategoryIntent, dialogsProps } = useBookmarksPageDialogsState({
    categories: orderedCategories,
    onSaveBookmark: handleUpdateBookmark,
    onDeleteCategory: handleDeleteFolder,
  });

  const { workspaceProps } = useBookmarksWorkspaceProps({
    status: { error, loading },
    categories: orderedCategories,
    setCategories,
    categoryById,
    activeCategory,
    activeCategoryId: activeId,
    setActiveCategoryId: setActiveId,
    layout,
    columnsPerRow,
    maxVisibleRows: uiState.maxVisibleRows ?? 3,
    panelState,
    panelActions,
    onCategoryReorder: handleCategoryOrderChange,
    onEditLink: setEditingLink,
    onAddBookmark: handleAddBookmark,
    onRemoveBookmark: handleRemoveBookmark,
  });

  const settingsSheetProps = useBookmarksSettingsSheetModel({
    categories: orderedCategories,
    layout,
    maxVisibleRows: uiState.maxVisibleRows ?? 3,
    columnsPerRow,
    onCreateCategory: handleCreateFolder,
    onDeleteCategoryIntent,
    onLayoutChange: handleLayoutChange,
    onMaxVisibleRowsChange: handleMaxVisibleRowsChange,
    onColumnsPerRowChange: handleColumnsPerRowChange,
  });

  return {
    workspaceProps,
    settingsSheetProps,
    dialogsProps,
  };
}
