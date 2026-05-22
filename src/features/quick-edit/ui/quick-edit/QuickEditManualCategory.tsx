import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";

import { Button } from "@/shared/ui/primitives/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/ui/primitives/collapsible";
import {
  qeManualCategoryId,
  parseQeManualCategoryId,
  parseQeNavLinkId,
} from "@/shared/lib/dnd/dndUtils";
import type { Category } from "@/shared/types/category";
import type { SiteLink } from "@/shared/types/link";
import { AddWebsiteDialog } from "@/features/manual-nav/ui/AddWebsiteDialog";

import { QuickEditInlineQuickAdd } from "./QuickEditInlineQuickAdd";
import { QuickEditSortableNavLinkList } from "./QuickEditSortableNavLink";

function DroppableCategory({
  categoryId,
  forceHighlight,
  children,
}: {
  categoryId: string;
  forceHighlight?: boolean;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: qeManualCategoryId(categoryId),
  });

  return (
    <div ref={setNodeRef} className={isOver || forceHighlight ? "ring-2 ring-primary rounded-md" : ""}>
      {children}
    </div>
  );
}

type QuickEditManualCategoryProps = {
  category: Category;
  categoryOptions: Category[];
  expanded: boolean;
  onToggle: () => void;
  onAddLink: (categoryId: string, link: SiteLink) => void;
  onRemoveLink: (categoryId: string, linkId: string) => void;
  onUpdateLinkTitle?: (linkId: string, categoryId: string, newTitle: string) => void;
  onDeleteCategory: (id: string) => void;
  bookmarkDropTargetId?: string | null;
};

export function QuickEditManualCategory({
  category,
  categoryOptions,
  expanded,
  onToggle,
  onAddLink,
  onRemoveLink,
  onUpdateLinkTitle,
  onDeleteCategory,
  bookmarkDropTargetId,
}: QuickEditManualCategoryProps) {
  const bookmarkTargetNav = bookmarkDropTargetId
    ? parseQeNavLinkId(bookmarkDropTargetId)
    : null;
  const bookmarkTargetCategoryId = bookmarkDropTargetId
    ? parseQeManualCategoryId(bookmarkDropTargetId)
    : null;
  const isCategoryTailTarget = bookmarkTargetCategoryId === category.id && category.links.length > 0;
  const shouldHighlightCategory =
    bookmarkTargetNav?.categoryId === category.id || bookmarkTargetCategoryId === category.id;

  return (
    <DroppableCategory
      categoryId={category.id}
      forceHighlight={shouldHighlightCategory}
    >
      <Collapsible open={expanded} onOpenChange={onToggle}>
        <div className="rounded-md border bg-card">
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between gap-2 px-3 py-2 cursor-pointer hover:bg-accent/50">
              <div className="min-w-0 flex items-center gap-2">
                <ChevronDown
                  className={`h-3.5 w-3.5 shrink-0 transition-transform ${expanded ? "" : "-rotate-90"}`}
                />
                <span className="truncate text-sm font-medium">{category.name}</span>
                <span className="rounded-sm bg-muted px-1.5 py-0.5 text-[10px] leading-none text-muted-foreground">
                  {category.links.length}
                </span>
              </div>
              <div className="flex items-center gap-0.5">
                <AddWebsiteDialog
                  categories={categoryOptions}
                  defaultCategoryId={category.id}
                  onAdd={onAddLink}
                  trigger={(
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  )}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDeleteCategory(category.id);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="border-t px-3 py-2 space-y-0.5">
              {category.links.length === 0 ? (
                <div className="text-xs text-muted-foreground py-2 text-center">
                  从右侧拖拽书签到此处，或在下方粘贴 URL
                </div>
              ) : (
                <QuickEditSortableNavLinkList
                  categoryId={category.id}
                  links={category.links}
                  onRemoveLink={(linkId) => onRemoveLink(category.id, linkId)}
                  onUpdateLinkTitle={onUpdateLinkTitle}
                  bookmarkTargetLinkId={
                    bookmarkTargetNav?.categoryId === category.id
                      ? bookmarkTargetNav.linkId
                      : null
                  }
                />
              )}
              {isCategoryTailTarget ? (
                <div
                  data-testid={`qe-bookmark-drop-indicator-tail-${category.id}`}
                  className="mx-2 my-0.5 h-0.5 rounded-full bg-primary"
                />
              ) : null}
              <QuickEditInlineQuickAdd categoryId={category.id} onAdd={onAddLink} />
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </DroppableCategory>
  );
}


