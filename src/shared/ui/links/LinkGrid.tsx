import type { ReactNode } from "react";
import type { SiteLink } from "@/shared/types/link";
import { LinkCard } from "@/shared/ui/links/LinkCard";

export function LinkGrid({
  links,
  emptyHint,
  onRemove,
  onEdit,
  append,
}: {
  links: SiteLink[];
  emptyHint?: string;
  onRemove?: (id: string) => void;
  onEdit?: (link: SiteLink) => void;
  append?: ReactNode;
}) {
  if (!links.length && !append) {
    return (
      <div className="rounded-md border bg-card p-4 text-sm text-muted-foreground">
        {emptyHint || "暂无内容"}
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {links.map((l) => (
        <LinkCard key={l.id} link={l} onRemove={onRemove} onEdit={onEdit} />
      ))}
      {append}
    </div>
  );
}

