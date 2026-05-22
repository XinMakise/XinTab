import { ExternalLink, GripVertical, Trash2 } from "lucide-react";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDndContext } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

import { Button } from "@/shared/ui/primitives/button";
import { Input } from "@/shared/ui/primitives/input";
import { useQuickEditNavLinkEditor } from "@/features/quick-edit/model/useQuickEditNavLinkEditor";
import { qeNavLinkId } from "@/shared/lib/dnd/dndUtils";
import { cn } from "@/shared/lib/cn";
import type { SiteLink } from "@/shared/types/link";

type QuickEditSortableNavLinkProps = {
  link: SiteLink;
  categoryId: string;
  onRemove: () => void;
  onUpdateTitle?: (linkId: string, categoryId: string, newTitle: string) => void;
  isBookmarkDropTarget?: boolean;
};

export function QuickEditSortableNavLink({
  link,
  categoryId,
  onRemove,
  onUpdateTitle,
  isBookmarkDropTarget,
}: QuickEditSortableNavLinkProps) {
  const { active } = useDndContext();
  const isAnyDragging = !!active;
  const {
    editing,
    editValue,
    inputRef,
    setEditValue,
    submitEdit,
    startEdit,
    cancelEdit,
  } = useQuickEditNavLinkEditor({
    link,
    categoryId,
    onUpdateTitle,
  });

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: qeNavLinkId(categoryId, link.id),
    data: { type: "nav-link", link },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? "transform 200ms ease",
    zIndex: isDragging ? 50 : undefined,
    touchAction: "none",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative overflow-hidden rounded-sm border border-transparent",
        isDragging && "border-dashed border-primary/50 bg-primary/5 ring-2 ring-primary/30",
      )}
    >
      {isBookmarkDropTarget ? (
        <div
          data-testid={`qe-bookmark-drop-indicator-${categoryId}-${link.id}`}
          className="h-0.5 bg-primary rounded-full mx-2 mb-0.5"
        />
      ) : null}
      <div
        className={cn(
          "flex items-center justify-between gap-2 rounded-sm px-2 py-1.5 cursor-grab active:cursor-grabbing",
          !isDragging && "hover:bg-accent/30",
        )}
        {...(editing ? {} : attributes)}
        {...(editing ? {} : listeners)}
      >
        <div className={cn("flex w-full items-center justify-between gap-2 min-w-0", isDragging && "invisible")}>
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <GripVertical className="h-3 w-3 shrink-0 text-muted-foreground" />
            {editing ? (
              <Input
                ref={inputRef}
                autoFocus
                value={editValue}
                onChange={(event) => setEditValue(event.target.value)}
                onBlur={submitEdit}
                onKeyDown={(event) => {
                  if (event.key === "Enter") submitEdit();
                  if (event.key === "Escape") cancelEdit();
                }}
                className="h-6 text-xs py-0 px-1"
                onPointerDown={(event) => event.stopPropagation()}
              />
            ) : (
              <span
                className="truncate text-xs cursor-text"
                onDoubleClick={(event) => {
                  event.stopPropagation();
                  startEdit();
                }}
                style={{ pointerEvents: isAnyDragging ? "none" : "auto" }}
                title="双击编辑名称"
              >
                {link.title}
              </span>
            )}
          </div>
          {!editing ? (
            <div className="flex items-center gap-0.5 shrink-0">
              <a
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="h-5 w-5 inline-flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-foreground"
                onClick={(event) => {
                  if (isAnyDragging) {
                    event.preventDefault();
                  }
                  event.stopPropagation();
                }}
                onPointerDown={(event) => event.stopPropagation()}
              >
                <ExternalLink className="h-3 w-3" />
              </a>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                onClick={onRemove}
                onPointerDown={(event) => event.stopPropagation()}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

type QuickEditSortableNavLinkListProps = {
  categoryId: string;
  links: SiteLink[];
  onRemoveLink: (linkId: string) => void;
  onUpdateLinkTitle?: (linkId: string, categoryId: string, newTitle: string) => void;
  bookmarkTargetLinkId?: string | null;
};

export function QuickEditSortableNavLinkList({
  categoryId,
  links,
  onRemoveLink,
  onUpdateLinkTitle,
  bookmarkTargetLinkId,
}: QuickEditSortableNavLinkListProps) {
  return (
    <SortableContext
      items={links.map((link) => qeNavLinkId(categoryId, link.id))}
      strategy={verticalListSortingStrategy}
    >
      {links.map((link) => (
        <QuickEditSortableNavLink
          key={link.id}
          link={link}
          categoryId={categoryId}
          onRemove={() => onRemoveLink(link.id)}
          onUpdateTitle={onUpdateLinkTitle}
          isBookmarkDropTarget={bookmarkTargetLinkId === link.id}
        />
      ))}
    </SortableContext>
  );
}


