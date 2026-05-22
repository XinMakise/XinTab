import { forwardRef, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/shared/ui/primitives/button";
import { Card } from "@/shared/ui/primitives/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { getSuggestedSiteTitle, normalizeSiteLinkIcon, normalizeSiteUrl } from "@/entities/link";
import { shouldUseCompactAddWebsiteCard } from "@/features/manual-nav/lib/addWebsiteLayout";
import type { Category } from "@/shared/types/category";
import type { SiteLink, SiteLinkIcon } from "@/shared/types/link";

import { SiteLinkIconEditor } from "./SiteLinkIconEditor";

const AddWebsiteCard = forwardRef<HTMLDivElement, { onClick: () => void }>(
  function AddWebsiteCard({ onClick }, ref) {
    const cardRef = useRef<HTMLDivElement | null>(null);
    const labelMeasureRef = useRef<HTMLDivElement | null>(null);
    const [compact, setCompact] = useState(false);

    useLayoutEffect(() => {
      const card = cardRef.current;
      if (!card) return;

      const updateCompact = () => {
        const nextCompact = shouldUseCompactAddWebsiteCard(
          card.clientWidth - 24,
          labelMeasureRef.current?.scrollWidth ?? 0,
        );
        setCompact((prev) => (prev === nextCompact ? prev : nextCompact));
      };

      const ro = new ResizeObserver(() => {
        updateCompact();
      });

      ro.observe(card);
      updateCompact();
      return () => ro.disconnect();
    }, []);

    const setRefs = (node: HTMLDivElement | null) => {
      cardRef.current = node;

      if (typeof ref === "function") {
        ref(node);
        return;
      }

      if (ref) {
        ref.current = node;
      }
    };

    return (
      <Card
        ref={setRefs}
        className="group flex cursor-pointer items-center justify-center p-3 transition-colors hover:bg-accent"
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onClick();
        }}
        aria-label="添加网站"
      >
        <div
          ref={labelMeasureRef}
          aria-hidden="true"
          className="pointer-events-none absolute opacity-0"
        >
          <div className="flex w-max items-center gap-2 text-sm font-medium whitespace-nowrap">
            <Plus className="h-4 w-4" />
            添加网站
          </div>
        </div>

        {compact ? (
          <span className="text-lg font-semibold leading-none">+</span>
        ) : (
          <div className="flex items-center gap-2 text-sm font-medium whitespace-nowrap">
            <Plus className="h-4 w-4" />
            添加网站
          </div>
        )}
      </Card>
    );
  },
);

export function AddWebsiteDialog({
  categories,
  defaultCategoryId,
  onAdd,
  trigger,
  enableCustomIcon = true,
}: {
  categories: Category[];
  defaultCategoryId?: string;
  onAdd: (categoryId: string, link: SiteLink) => void;
  trigger?: React.ReactNode;
  enableCustomIcon?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [rawUrl, setRawUrl] = useState("");
  const [title, setTitle] = useState("");
  const [titleManuallyEdited, setTitleManuallyEdited] = useState(false);
  const [icon, setIcon] = useState<SiteLinkIcon | undefined>(undefined);
  const [categoryId, setCategoryId] = useState(
    defaultCategoryId || categories[0]?.id || "",
  );

  const normalizedUrl = useMemo(() => normalizeSiteUrl(rawUrl), [rawUrl]);
  const canSubmit = !!normalizedUrl && !!categoryId;
  const suggestedTitle = normalizedUrl ? getSuggestedSiteTitle(normalizedUrl) : "";
  const effectiveTitle = title.trim() || suggestedTitle;

  const onOpenChange = (v: boolean) => {
    setOpen(v);
    if (v) {
      setCategoryId(defaultCategoryId || categories[0]?.id || "");
    } else {
      setRawUrl("");
      setTitle("");
      setTitleManuallyEdited(false);
      setIcon(undefined);
    }
  };

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
    onAdd(categoryId, {
      id: crypto.randomUUID(),
      url: normalizedUrl,
      title: effectiveTitle,
      icon: enableCustomIcon ? normalizeSiteLinkIcon(icon) : undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger ? trigger : <AddWebsiteCard onClick={() => onOpenChange(true)} />}
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>添加网站</DialogTitle>
          <DialogDescription>
            输入网站信息并选择要添加到的分类
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>分类</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
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

          <div className="space-y-2">
            <Label htmlFor="url">网址</Label>
            <Input
              id="url"
              placeholder="https://example.com 或 example.com"
              value={rawUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">名称（可选）</Label>
            <Input
              id="title"
              placeholder="例如：我的工具箱"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
            />
            {suggestedTitle ? (
              <p className="text-xs text-muted-foreground">
                已根据网址预填，可直接修改。
              </p>
            ) : null}
          </div>

          {enableCustomIcon ? (
            <SiteLinkIconEditor value={icon} title={effectiveTitle} url={normalizedUrl} onChange={setIcon} />
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={submit} disabled={!canSubmit}>
            添加
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}



