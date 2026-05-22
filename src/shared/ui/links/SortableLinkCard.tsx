import React from "react";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { useDndContext } from "@dnd-kit/core";

import type { SiteLink } from "@/shared/types/link";
import { LinkCardContent } from "@/shared/ui/links/LinkCard";
import { cn } from "@/shared/lib/cn";
import { standardPageCardAnimateLayoutChanges } from "@/shared/ui/links/sortableLinkCardAnimateLayoutChanges";

export const SortableLinkCard = React.memo(function SortableLinkCard({
  id,
  link,
  onRemove,
  onEdit,
}: {
  id: string;
  link: SiteLink;
  onRemove?: (id: string) => void;
  onEdit?: (link: SiteLink) => void;
}) {
  const { active } = useDndContext();
  const isAnyDragging = !!active;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    data: { type: "link", linkId: link.id },
    animateLayoutChanges: standardPageCardAnimateLayoutChanges,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isAnyDragging
      ? (transition ?? "transform 200ms ease")
      : "transform 0ms linear",
    zIndex: isDragging ? 50 : undefined,
    backgroundColor: "hsl(var(--card) / var(--app-card-opacity, 1))",
    touchAction: "none",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        "group relative overflow-hidden p-3",
        isDragging && "border-dashed border-primary/50 bg-primary/5",
        isDragging && "ring-2 ring-primary/30",
      )}
      {...attributes}
      {...listeners}
    >
      <div className={cn(isDragging && "invisible")}>
        <LinkCardContent
          link={link}
          onRemove={onRemove}
          onEdit={onEdit}
          isDragging={isAnyDragging}
        />
      </div>
    </div>
  );
});
