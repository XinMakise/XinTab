import { getCurrentAppearance } from "@/features/appearance";
import { ChevronDown } from "lucide-react";

import { CategoryLinksPanel } from "@/shared/ui/standard-page/CategoryLinksPanel";
import { EditableCategoryHeader } from "@/shared/ui/standard-page/EditableCategoryHeader";
import { Button } from "@/shared/ui/primitives/button";
import { cn } from "@/shared/lib/cn";
import type { Category } from "@/shared/types/category";
import type { SiteLink } from "@/shared/types/link";

type CategorySectionListProps = {
  categories: Category[];
  columnsPerRow: number;
  maxVisibleRows: number;
  expandedCategories: Set<string>;
  editingCategoryId: string | null;
  onToggleExpanded: (categoryId: string) => void;
  onStartEditCategory: (categoryId: string | null) => void;
  onRenameCategory: (categoryId: string, newName: string) => void;
  onRemoveLink: (categoryId: string, linkId: string) => void;
  onEditLink: (categoryId: string, link: SiteLink) => void;
  onAddLink: (categoryId: string, link: SiteLink) => void;
  enableCustomIcon?: boolean;
  highlightWhenOver?: boolean;
};

export function CategorySectionList({
  categories,
  columnsPerRow,
  maxVisibleRows,
  expandedCategories,
  editingCategoryId,
  onToggleExpanded,
  onStartEditCategory,
  onRenameCategory,
  onRemoveLink,
  onEditLink,
  onAddLink,
  enableCustomIcon = true,
  highlightWhenOver = false,
}: CategorySectionListProps) {
  const categoryContainerEnabled = getCurrentAppearance().categoryContainerEnabled;

  return (
    <div className="space-y-6">
      {categories.map((category) => {
        const maxVisible = maxVisibleRows * columnsPerRow;
        const isExpanded = expandedCategories.has(category.id);
        const hasMore = category.links.length > maxVisible;
        const visibleLinks = isExpanded ? category.links : category.links.slice(0, maxVisible);

        return (
          <div key={category.id} className="space-y-3">
            <EditableCategoryHeader
              categoryId={category.id}
              name={category.name}
              count={category.links.length}
              isEditing={editingCategoryId === category.id}
              onStartEdit={onStartEditCategory}
              onFinishEdit={onRenameCategory}
              onCancelEdit={() => onStartEditCategory(null)}
            />

            <div
              className={cn(
                categoryContainerEnabled && "rounded-lg border bg-card text-card-foreground shadow-sm p-4",
              )}
              style={
                categoryContainerEnabled
                  ? { backgroundColor: "hsl(var(--card) / var(--app-card-opacity, 1))" }
                  : undefined
              }
            >
              <CategoryLinksPanel
                categoryId={category.id}
                links={visibleLinks}
                categories={categories}
                columnsPerRow={columnsPerRow}
                onRemove={(linkId) => onRemoveLink(category.id, linkId)}
                onEdit={(link) => onEditLink(category.id, link)}
                onAdd={onAddLink}
                showAddCard={isExpanded || !hasMore}
                enableCustomIcon={enableCustomIcon}
                highlightWhenOver={highlightWhenOver}
              />

              {hasMore ? (
                <div className="mt-3 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleExpanded(category.id)}
                  >
                    {isExpanded ? "收起" : `查看更多 (${category.links.length - maxVisible})`}
                    <ChevronDown
                      className={`ml-1 h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    />
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}


