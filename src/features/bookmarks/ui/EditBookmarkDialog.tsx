import { useEffect, useMemo, useState } from "react";

import { Button } from "@/shared/ui/primitives/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/primitives/dialog";
import { Input } from "@/shared/ui/primitives/input";
import { Label } from "@/shared/ui/primitives/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/primitives/select";
import { getSuggestedSiteTitle, isCustomSiteTitle, normalizeSiteUrl } from "@/entities/link";
import type { Category } from "@/shared/types/category";
import type { SiteLink } from "@/shared/types/link";

export function EditBookmarkDialog({
  link,
  categories,
  categoryId,
  open,
  onOpenChange,
  onSave,
}: {
  link: SiteLink;
  categories: Category[];
  categoryId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (link: SiteLink, categoryId: string) => void;
}) {
  const [rawUrl, setRawUrl] = useState(link.url);
  const [title, setTitle] = useState(link.title);
  const [titleManuallyEdited, setTitleManuallyEdited] = useState(isCustomSiteTitle(link.title, link.url));
  const [targetCategoryId, setTargetCategoryId] = useState(categoryId);

  useEffect(() => {
    if (open) {
      setRawUrl(link.url);
      setTitle(link.title);
      setTitleManuallyEdited(isCustomSiteTitle(link.title, link.url));
      setTargetCategoryId(categoryId || categories[0]?.id || "");
    }
  }, [open, link, categoryId, categories]);

  const normalizedUrl = useMemo(() => normalizeSiteUrl(rawUrl), [rawUrl]);
  const suggestedTitle = normalizedUrl ? getSuggestedSiteTitle(normalizedUrl) : "";
  const effectiveTitle = title.trim() || suggestedTitle;
  const canSubmit = !!normalizedUrl && !!targetCategoryId;

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
    onSave(
      {
        ...link,
        url: normalizedUrl,
        title: effectiveTitle,
      },
      targetCategoryId,
    );
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑书签</DialogTitle>
          <DialogDescription>
            修改书签信息或移动到其他分类
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {categories.length > 0 && (
            <div className="space-y-2">
              <Label>分类</Label>
              <Select value={targetCategoryId} onValueChange={setTargetCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="edit-bookmark-url">网址</Label>
            <Input
              id="edit-bookmark-url"
              placeholder="https://example.com 或 example.com"
              value={rawUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-bookmark-title">名称</Label>
            <Input
              id="edit-bookmark-title"
              placeholder="例如：我的工具箱"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
            />
            {suggestedTitle ? (
              <p className="text-xs text-muted-foreground">
                已自动填充，可直接修改。
              </p>
            ) : null}
          </div>
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



