import { ActiveCategoryLinksCard } from "@/shared/ui/standard-page/ActiveCategoryLinksCard";
import { CategorySectionList } from "@/shared/ui/standard-page/CategorySectionList";
import type { Category } from "@/shared/types/category";
import type { SiteLink } from "@/shared/types/link";

export type StandardPageLinksContentView = {
  mode: "top" | "left" | "all";
  categories: Category[];
  activeCategory: Category | undefined;
  columnsPerRow: number;
  maxVisibleRows: number;
  expandedCategories: Set<string>;
  editingCategoryId: string | null;
  emptyHint: string;
  enableCustomIcon?: boolean;
  highlightWhenOver?: boolean;
};

export type StandardPageLinksContentActions = {
  onToggleExpanded: (categoryId: string) => void;
  onStartEditCategory: (categoryId: string | null) => void;
  onRenameCategory: (categoryId: string, newName: string) => void;
  onRemoveLink: (categoryId: string, linkId: string) => void;
  onEditLink: (categoryId: string, link: SiteLink) => void;
  onAddLink: (categoryId: string, link: SiteLink) => void;
};

type StandardPageLinksContentProps = {
  view: StandardPageLinksContentView;
  actions: StandardPageLinksContentActions;
};

export function StandardPageLinksContent({
  view,
  actions,
}: StandardPageLinksContentProps) {
  if (view.mode === "all") {
    return (
      <CategorySectionList
        categories={view.categories}
        columnsPerRow={view.columnsPerRow}
        maxVisibleRows={view.maxVisibleRows}
        expandedCategories={view.expandedCategories}
        editingCategoryId={view.editingCategoryId}
        onToggleExpanded={actions.onToggleExpanded}
        onStartEditCategory={actions.onStartEditCategory}
        onRenameCategory={actions.onRenameCategory}
        onRemoveLink={actions.onRemoveLink}
        onEditLink={actions.onEditLink}
        onAddLink={actions.onAddLink}
        enableCustomIcon={view.enableCustomIcon}
        highlightWhenOver={view.highlightWhenOver}
      />
    );
  }

  return (
    <ActiveCategoryLinksCard
      layoutMode={view.mode}
      activeCategory={view.activeCategory}
      categories={view.categories}
      columnsPerRow={view.columnsPerRow}
      onRemoveLink={actions.onRemoveLink}
      onEditLink={actions.onEditLink}
      onAddLink={actions.onAddLink}
      emptyHint={view.emptyHint}
      enableCustomIcon={view.enableCustomIcon}
      highlightWhenOver={view.highlightWhenOver}
    />
  );
}

