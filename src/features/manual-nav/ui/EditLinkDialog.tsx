import { useEffect, useMemo, useState } from "react";

import { Button } from "@/shared/ui/primitives/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/primitives/dialog";
import { Input } from "@/shared/ui/primitives/input";
import { Label } from "@/shared/ui/primitives/label";
import { getSuggestedSiteTitle, isCustomSiteTitle, normalizeSiteLinkIcon, normalizeSiteUrl } from "@/entities/link";
import type { SiteLink, SiteLinkIcon } from "@/shared/types/link";

import { SiteLinkIconEditor } from "./SiteLinkIconEditor";

export function EditLinkDialog({
  link,
  open,
  onOpenChange,
  onSave,
}: {
  link: SiteLink;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (link: SiteLink) => void;
}) {
  const [rawUrl, setRawUrl] = useState(link.url);
  const [title, setTitle] = useState(link.title);
  const [titleManuallyEdited, setTitleManuallyEdited] = useState(isCustomSiteTitle(link.title, link.url));
  const [icon, setIcon] = useState<SiteLinkIcon | undefined>(normalizeSiteLinkIcon(link.icon));

  useEffect(() => {
    if (open) {
      setRawUrl(link.url);
      setTitle(link.title);
      setTitleManuallyEdited(isCustomSiteTitle(link.title, link.url));
      setIcon(normalizeSiteLinkIcon(link.icon));
    }
  }, [open, link]);

  const normalizedUrl = useMemo(() => normalizeSiteUrl(rawUrl), [rawUrl]);
  const canSubmit = !!normalizedUrl;
  const suggestedTitle = normalizedUrl ? getSuggestedSiteTitle(normalizedUrl) : "";
  const effectiveTitle = title.trim() || suggestedTitle;

  const handleUrlChange = (value: string) => {
    const nextNormalizedUrl = normalizeSiteUrl(value);
    const nextSuggestedTitle = nextNormalizedUrl ? getSuggestedSiteTitle(nextNormalizedUrl) : "";

    setRawUrl(value);
    if (!titleManuallyEdited) {
      setTitle(nextSuggestedTitle);
    }
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    setTitleManuallyEdited(!!value.trim() && value.trim() !== suggestedTitle);
  };

  const submit = () => {
    if (!canSubmit) return;
    onSave({
      ...link,
      url: normalizedUrl,
      title: effectiveTitle,
      icon: normalizeSiteLinkIcon(icon),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined} className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>编辑网站</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-url">网址</Label>
            <Input
              id="edit-url"
              placeholder="https://example.com 或 example.com"
              value={rawUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-title">名称</Label>
            <Input
              id="edit-title"
              placeholder="例如：我的工具箱"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
            />
          </div>

          <SiteLinkIconEditor value={icon} title={effectiveTitle} url={normalizedUrl} onChange={setIcon} />
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={submit} disabled={!canSubmit}>
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}



