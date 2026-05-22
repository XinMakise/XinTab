import { ChevronDown, ExternalLink, GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";

import { Button } from "@/shared/ui/primitives/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/ui/primitives/collapsible";
import { qeBookmarkLinkId } from "@/shared/lib/dnd/dndUtils";
import type { Category } from "@/shared/types/category";
import type { SiteLink } from "@/shared/types/link";

function DraggableBookmarkItem({
  link,
  categoryId,
  onEdit,
  onRemove,
  onQuickAdd,
}: {
  link: SiteLink;
  categoryId: string;
  onEdit?: (link: SiteLink, categoryId: string) => void;
  onRemove?: (linkId: string) => void;
  onQuickAdd?: (link: SiteLink) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: qeBookmarkLinkId(link.id),
    data: { type: "bookmark-link", link },
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex items-center gap-2 rounded-sm hover:bg-accent/30 px-2 py-1.5 cursor-grab active:cursor-grabbing group ${isDragging ? "opacity-40" : ""}`}
      {...attributes}
      {...listeners}
    >
      <GripVertical className="h-3 w-3 shrink-0 text-muted-foreground" />
      <span className="truncate text-xs flex-1">{link.title}</span>
      {onQuickAdd ? (
        <Button
          variant="ghost"
          size="icon"
          aria-label="添加到导航"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 text-primary"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            onQuickAdd(link);
          }}
        >
          <Plus className="h-3 w-3" />
        </Button>
      ) : null}
      <a
        href={link.url}
        target="_blank"
        rel="noreferrer"
        className="h-5 w-5 inline-flex items-center justify-center shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-foreground"
        onClick={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <ExternalLink className="h-3 w-3" />
      </a>
      {onEdit ? (
        <Button
          variant="ghost"
          size="icon"
          aria-label="编辑"
          className="h-6 w-6 opacity-0 group-hover:opacity-100"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            onEdit(link, categoryId);
          }}
        >
          <Pencil className="h-3 w-3" />
        </Button>
      ) : null}
      {onRemove ? (
        <Button
          variant="ghost"
          size="icon"
          aria-label="删除"
          className="h-6 w-6 opacity-0 group-hover:opacity-100"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            onRemove(link.id);
          }}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      ) : null}
    </div>
  );
}

type QuickEditBookmarkFolderProps = {
  category: Category;
  expanded: boolean;
  onToggle: () => void;
  onEdit?: (link: SiteLink, categoryId: string) => void;
  onRemove?: (linkId: string) => void;
  onQuickAdd?: (link: SiteLink) => void;
};

export function QuickEditBookmarkFolder({
  category,
  expanded,
  onToggle,
  onEdit,
  onRemove,
  onQuickAdd,
}: QuickEditBookmarkFolderProps) {
  return (
    <Collapsible open={expanded} onOpenChange={onToggle}>
      <div className="rounded-md border bg-card">
        <CollapsibleTrigger asChild>
          <div className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-accent/50">
            <ChevronDown
              className={`h-3.5 w-3.5 shrink-0 transition-transform ${expanded ? "" : "-rotate-90"}`}
            />
            <span className="truncate text-sm font-medium">{category.name}</span>
            <span className="rounded-sm bg-muted px-1.5 py-0.5 text-[10px] leading-none text-muted-foreground">
              {category.links.length}
            </span>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-t px-1 py-1 space-y-0.5">
            {category.links.map((link) => (
              <DraggableBookmarkItem
                key={link.id}
                link={link}
                categoryId={category.id}
                onEdit={onEdit}
                onRemove={onRemove}
                onQuickAdd={onQuickAdd}
              />
            ))}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}


