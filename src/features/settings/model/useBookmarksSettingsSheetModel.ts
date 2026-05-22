import { useMemo } from "react";

import type { BookmarksSettingsSheetProps } from "@/features/settings/ui/BookmarksSettingsSheet";
import type { Category } from "@/shared/types/category";

type UseBookmarksSettingsSheetModelOptions = {
  categories: Category[];
  layout: "top" | "left" | "all";
  maxVisibleRows: number;
  columnsPerRow: number;
  onCreateCategory: (name: string) => void;
  onDeleteCategoryIntent: (id: string) => void;
  onLayoutChange: (layout: "top" | "left" | "all") => void;
  onMaxVisibleRowsChange: (rows: number) => void;
  onColumnsPerRowChange: (columns: number) => void;
};

export function useBookmarksSettingsSheetModel({
  categories,
  layout,
  maxVisibleRows,
  columnsPerRow,
  onCreateCategory,
  onDeleteCategoryIntent,
  onLayoutChange,
  onMaxVisibleRowsChange,
  onColumnsPerRowChange,
}: UseBookmarksSettingsSheetModelOptions): BookmarksSettingsSheetProps {
  return useMemo(() => ({
    model: {
      kind: "bookmarks",
      categoryManagement: {
        categories,
        onCreateCategory,
        onDeleteCategory: onDeleteCategoryIntent,
      },
      layout: {
        bookmarksLayout: layout,
        onBookmarksLayoutChange: onLayoutChange,
        maxVisibleRows,
        onMaxVisibleRowsChange,
        columnsPerRow,
        onColumnsPerRowChange,
      },
      appearance: {},
    },
  }), [
    categories,
    columnsPerRow,
    layout,
    maxVisibleRows,
    onColumnsPerRowChange,
    onCreateCategory,
    onDeleteCategoryIntent,
    onLayoutChange,
    onMaxVisibleRowsChange,
  ]);
}
