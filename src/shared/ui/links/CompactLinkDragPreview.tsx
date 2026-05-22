import { Card } from "@/shared/ui/primitives/card";
import { SiteIcon } from "@/shared/ui/links/SiteIcon";
import type { SiteLinkIcon } from "@/shared/types/link";

export function CompactLinkDragPreview({
  title,
  url,
  icon,
}: {
  title: string;
  url: string;
  icon?: SiteLinkIcon;
}) {
  return (
    <Card className="pointer-events-none w-[176px] max-w-[176px] px-3 py-2 shadow-lg cursor-grabbing">
      <div className="flex items-center gap-2">
        <SiteIcon url={url} title={title} icon={icon} className="h-7 w-7 rounded-md" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-medium leading-5">{title}</div>
        </div>
      </div>
    </Card>
  );
}


