import * as React from "react";
import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/shared/ui/primitives/button";
import { Card } from "@/shared/ui/primitives/card";
import { SiteIcon } from "@/shared/ui/links/SiteIcon";
import type { SiteLink } from "@/shared/types/link";
import { cn } from "@/shared/lib/cn";

export const LinkCardContent = React.memo(function LinkCardContent({
  link,
  onRemove,
  onEdit,
  isDragging = false,
}: {
  link: SiteLink;
  onRemove?: (id: string) => void;
  onEdit?: (link: SiteLink) => void;
  isDragging?: boolean;
}) {
  return (
    <>
      <a
        href={link.url}
        rel="noreferrer"
        className="flex items-start gap-3"
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
        style={{
          userSelect: "none",
          pointerEvents: isDragging ? "none" : "auto",
        }}
        onClick={(e) => {
          if (isDragging) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
        <SiteIcon url={link.url} title={link.title} icon={link.icon} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="truncate text-sm font-medium">{link.title}</div>
          </div>
          <div className="mt-1 truncate text-xs text-muted-foreground">
            {link.url.replace(/^https?:\/\/(www\.)?/, "")}
          </div>
        </div>
      </a>

      <div
        className="absolute right-1 top-1 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100"
        style={{ display: isDragging ? "none" : undefined }}
      >
        {onEdit ? (
          <Button
            variant="ghost"
            size="icon"
            aria-label="编辑"
            className="h-7 w-7"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit(link);
            }}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        ) : null}
        {onRemove ? (
          <Button
            variant="ghost"
            size="icon"
            aria-label="删除"
            className="h-7 w-7"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemove(link.id);
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        ) : null}
      </div>
    </>
  );
});

export const LinkCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    link: SiteLink;
    onRemove?: (id: string) => void;
    onEdit?: (link: SiteLink) => void;
    isDragging?: boolean;
  }
>(({ link, onRemove, onEdit, isDragging = false, className, style, ...props }, ref) => {
  return (
    <Card ref={ref} style={style} className={cn("group relative overflow-hidden p-3", className)} {...props}>
      <LinkCardContent link={link} onRemove={onRemove} onEdit={onEdit} isDragging={isDragging} />
    </Card>
  );
});

LinkCard.displayName = "LinkCard";


