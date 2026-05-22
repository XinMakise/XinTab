import type { Category } from "@/shared/types/category";
import type { ManualNavState } from "@/shared/types/manual-nav";
import type { SiteLink } from "@/shared/types/link";

type LayoutMode = "top" | "left" | "all";

export type ManualLayoutSettingsModel = {
  categoryLayout: LayoutMode;
  onCategoryLayoutChange: (layout: LayoutMode) => void;
  maxVisibleRows?: number;
  onMaxVisibleRowsChange?: (rows: number) => void;
  columnsPerRow?: number;
  onColumnsPerRowChange?: (columns: number) => void;
};

export type BookmarksLayoutSettingsModel = {
  bookmarksLayout: LayoutMode;
  onBookmarksLayoutChange: (layout: LayoutMode) => void;
  maxVisibleRows?: number;
  onMaxVisibleRowsChange?: (rows: number) => void;
  columnsPerRow?: number;
  onColumnsPerRowChange?: (columns: number) => void;
};

export type CategoryManagementModel = {
  categories: Category[];
  onCreateCategory: (name: string) => void;
  onDeleteCategory: (id: string) => void;
  onAddLink?: (categoryId: string, link: SiteLink) => void;
  onRemoveLink?: (categoryId: string, linkId: string) => void;
  onUpdateLinkTitle?: (linkId: string, categoryId: string, newTitle: string) => void;
  onMoveLink?: (
    linkId: string,
    fromCategoryId: string,
    toCategoryId: string,
    toIndex: number,
  ) => void;
};

export type RecentVisitsSettingsModel = {
  showRecentVisits?: boolean;
  onShowRecentVisitsChange?: (checked: boolean) => void;
  recentVisitsRows?: number;
  onRecentVisitsRowsChange?: (rows: number) => void;
  recentVisitsCardSize?: number;
  onRecentVisitsCardSizeChange?: (size: number) => void;
};

export type AppearanceSettingsModel = Record<string, never>;

export type DataManagementModel = {
  state: ManualNavState;
  onImport: (newState: ManualNavState) => void;
};

export type ManualSettingsSheetModel = {
  kind: "manual";
  categoryManagement: CategoryManagementModel;
  layout: ManualLayoutSettingsModel;
  recentVisits: RecentVisitsSettingsModel;
  appearance: AppearanceSettingsModel;
  dataManagement: DataManagementModel;
};

export type BookmarksSettingsSheetModel = {
  kind: "bookmarks";
  categoryManagement: Pick<
    CategoryManagementModel,
    "categories" | "onCreateCategory" | "onDeleteCategory"
  >;
  layout: BookmarksLayoutSettingsModel;
  appearance: AppearanceSettingsModel;
};

export type SettingsSheetModel = ManualSettingsSheetModel | BookmarksSettingsSheetModel;
