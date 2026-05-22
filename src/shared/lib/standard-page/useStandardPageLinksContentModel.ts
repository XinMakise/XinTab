import { useMemo } from "react";

import type {
  StandardPageLinksContentActions,
  StandardPageLinksContentView,
} from "@/shared/ui/standard-page/StandardPageLinksContent";
import type { Category } from "@/shared/types/category";
import type { SiteLink } from "@/shared/types/link";

type StandardPageContentPanelState = {
  expandedCategories: Set<string>;
  editingCategoryId: string | null;
};

type StandardPageContentPanelActions = {
  toggleCategoryExpanded: (categoryId: string) => void;
  setEditingCategoryId: (categoryId: string | null) => void;
  handleRenameCategory: (categoryId: string, newName: string) => void;
};

type UseStandardPageLinksContentModelOptions = {
  mode: "top" | "left" | "all";
  categories: Category[];
  activeCategory: Category | undefined;
  columnsPerRow: number;
  maxVisibleRows: number;
  panelState: StandardPageContentPanelState;
  panelActions: StandardPageContentPanelActions;
  emptyHint: string;
  enableCustomIcon?: boolean;
  highlightWhenOver?: boolean;
  onRemoveLink: (categoryId: string, linkId: string) => void;
  onEditLink: (categoryId: string, link: SiteLink) => void;
  onAddLink: (categoryId: string, link: SiteLink) => void;
};

export function useStandardPageLinksContentModel({
  mode,
  categories,
  activeCategory,
  columnsPerRow,
  maxVisibleRows,
  panelState,
  panelActions,
  emptyHint,
  enableCustomIcon,
  highlightWhenOver,
  onRemoveLink,
  onEditLink,
  onAddLink,
}: UseStandardPageLinksContentModelOptions): {
  view: StandardPageLinksContentView;
  actions: StandardPageLinksContentActions;
} {
  const view: StandardPageLinksContentView = useMemo(() => ({
    mode,
    categories,
    activeCategory,
    columnsPerRow,
    maxVisibleRows,
    expandedCategories: panelState.expandedCategories,
    editingCategoryId: panelState.editingCategoryId,
    emptyHint,
    enableCustomIcon,
    highlightWhenOver,
  }), [
    activeCategory,
    categories,
    columnsPerRow,
    emptyHint,
    enableCustomIcon,
    highlightWhenOver,
    maxVisibleRows,
    mode,
    panelState.editingCategoryId,
    panelState.expandedCategories,
  ]);

  const actions: StandardPageLinksContentActions = useMemo(() => ({
    onToggleExpanded: panelActions.toggleCategoryExpanded,
    onStartEditCategory: panelActions.setEditingCategoryId,
    onRenameCategory: panelActions.handleRenameCategory,
    onRemoveLink,
    onEditLink,
    onAddLink,
  }), [
    onAddLink,
    onEditLink,
    onRemoveLink,
    panelActions.handleRenameCategory,
    panelActions.setEditingCategoryId,
    panelActions.toggleCategoryExpanded,
  ]);

  return { view, actions };
}

