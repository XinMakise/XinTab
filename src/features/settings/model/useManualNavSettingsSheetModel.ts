import { useMemo } from "react";

import type { ManualNavSettingsSheetProps } from "@/features/settings/ui/ManualNavSettingsSheet";
import type { Category } from "@/shared/types/category";
import type { ManualNavState } from "@/shared/types/manual-nav";
import type { SiteLink } from "@/shared/types/link";

type UseManualNavSettingsSheetModelOptions = {
  categories: Category[];
  state: ManualNavState;
  categoryLayout: "top" | "left" | "all";
  columnsPerRow: number;
  maxVisibleRows: number;
  showRecentVisits: boolean;
  recentVisitsRows: number;
  recentVisitsCardSize: number;
  onCreateCategory: (name: string) => void;
  onDeleteCategory: (id: string) => void;
  onAddLink: (categoryId: string, link: SiteLink) => void;
  onRemoveLink: (categoryId: string, linkId: string) => void;
  onUpdateLinkTitle: (linkId: string, categoryId: string, newTitle: string) => void;
  onMoveLink: (linkId: string, fromCategoryId: string, toCategoryId: string, toIndex: number) => void;
  onImport: (newState: ManualNavState) => void;
  onCategoryLayoutChange: (layout: "top" | "left" | "all") => void;
  onMaxVisibleRowsChange: (rows: number) => void;
  onColumnsPerRowChange: (columns: number) => void;
  onShowRecentVisitsChange: (checked: boolean) => void;
  onRecentVisitsRowsChange: (rows: number) => void;
  onRecentVisitsCardSizeChange: (size: number) => void;
};

export function useManualNavSettingsSheetModel({
  categories,
  state,
  categoryLayout,
  columnsPerRow,
  maxVisibleRows,
  showRecentVisits,
  recentVisitsRows,
  recentVisitsCardSize,
  onCreateCategory,
  onDeleteCategory,
  onAddLink,
  onRemoveLink,
  onUpdateLinkTitle,
  onMoveLink,
  onImport,
  onCategoryLayoutChange,
  onMaxVisibleRowsChange,
  onColumnsPerRowChange,
  onShowRecentVisitsChange,
  onRecentVisitsRowsChange,
  onRecentVisitsCardSizeChange,
}: UseManualNavSettingsSheetModelOptions): ManualNavSettingsSheetProps {
  return useMemo(() => ({
    model: {
      kind: "manual",
      categoryManagement: {
        categories,
        onCreateCategory,
        onDeleteCategory,
        onAddLink,
        onRemoveLink,
        onUpdateLinkTitle,
        onMoveLink,
      },
      layout: {
        categoryLayout,
        onCategoryLayoutChange,
        maxVisibleRows,
        onMaxVisibleRowsChange,
        columnsPerRow,
        onColumnsPerRowChange,
      },
      recentVisits: {
        showRecentVisits,
        onShowRecentVisitsChange,
        recentVisitsRows,
        onRecentVisitsRowsChange,
        recentVisitsCardSize,
        onRecentVisitsCardSizeChange,
      },
      appearance: {},
      dataManagement: {
        state,
        onImport,
      },
    },
  }), [
    categories,
    categoryLayout,
    columnsPerRow,
    maxVisibleRows,
    onAddLink,
    onCategoryLayoutChange,
    onColumnsPerRowChange,
    onCreateCategory,
    onDeleteCategory,
    onImport,
    onMaxVisibleRowsChange,
    onMoveLink,
    onRecentVisitsCardSizeChange,
    onRecentVisitsRowsChange,
    onRemoveLink,
    onShowRecentVisitsChange,
    onUpdateLinkTitle,
    recentVisitsCardSize,
    recentVisitsRows,
    showRecentVisits,
    state,
  ]);
}
