import { getCurrentAppearance } from "@/features/appearance";
import { LinkGrid } from "@/shared/ui/links/LinkGrid";
import { CategoryLinksPanel } from "@/shared/ui/standard-page/CategoryLinksPanel";
import { Card } from "@/shared/ui/primitives/card";
import { cn } from "@/shared/lib/cn";
import type { Category } from "@/shared/types/category";
import type { SiteLink } from "@/shared/types/link";

type ActiveCategoryLinksCardProps = {
  layoutMode: "top" | "left" | "all";
  activeCategory: Category | undefined;
  categories: Category[];
  columnsPerRow: number;
  onRemoveLink: (categoryId: string, linkId: string) => void;
  onEditLink: (categoryId: string, link: SiteLink) => void;
  onAddLink: (categoryId: string, link: SiteLink) => void;
  emptyHint: string;
  enableCustomIcon?: boolean;
  highlightWhenOver?: boolean;
};

export function ActiveCategoryLinksCard({
  layoutMode,
  activeCategory,
  categories,
  columnsPerRow,
  onRemoveLink,
  onEditLink,
  onAddLink,
  emptyHint,
  enableCustomIcon = true,
  highlightWhenOver = false,
}: ActiveCategoryLinksCardProps) {
  const categoryContainerEnabled = getCurrentAppearance().categoryContainerEnabled;

  const content = activeCategory ? (
    <CategoryLinksPanel
      categoryId={activeCategory.id}
      links={activeCategory.links ?? []}
      categories={categories}
      columnsPerRow={columnsPerRow}
      onRemove={(linkId) => onRemoveLink(activeCategory.id, linkId)}
      onEdit={(link) => onEditLink(activeCategory.id, link)}
      onAdd={onAddLink}
      enableCustomIcon={enableCustomIcon}
      highlightWhenOver={highlightWhenOver}
    />
  ) : (
    <LinkGrid links={[]} emptyHint={emptyHint} />
  );

  if (!categoryContainerEnabled) {
    return <div className={cn(layoutMode === "left" ? "flex-1 self-start" : "")}>{content}</div>;
  }

  return (
    <Card className={layoutMode === "left" ? "flex-1 self-start p-4" : "p-4"}>
      {content}
    </Card>
  );
}


