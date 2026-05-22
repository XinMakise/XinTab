import { useState } from "react";
import { ChevronDown, ExternalLink, GripVertical, Plus, Trash2 } from "lucide-react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";

import { Button } from "@/shared/ui/primitives/button";
import { Card } from "@/shared/ui/primitives/card";
import { Input } from "@/shared/ui/primitives/input";
import { Label } from "@/shared/ui/primitives/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/primitives/alert-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/ui/primitives/collapsible";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/primitives/accordion";
import { toast } from "@/shared/ui/primitives/use-toast";
import { useDefaultPointerSensors } from "@/shared/lib/dnd/dndSensors";
import type { Category } from "@/shared/types/category";
import type { SiteLink } from "@/shared/types/link";

import { AddWebsiteDialog } from "./AddWebsiteDialog";

function DraggableLinkItem({
  link,
  onDelete,
}: {
  link: SiteLink;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({ id: link.id });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between gap-2 rounded-sm hover:bg-accent/30 px-2 py-1.5"
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-3 w-3 text-muted-foreground" />
        </div>
        <a
          href={link.url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 min-w-0 flex-1"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="truncate text-xs">{link.title}</span>
          <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
        </a>
      </div>
      <Button
        variant="ghost"
        size="icon"
        aria-label="删除网站"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="h-6 w-6"
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
}

function DroppableCategoryHeader({
  categoryId,
  children,
}: {
  categoryId: string;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: categoryId });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-md border bg-card ${isOver ? "ring-2 ring-primary" : ""}`}
    >
      {children}
    </div>
  );
}

export function CategoryManagePanel({
  categories,
  onCreateCategory,
  onDeleteCategory,
  onAddLink,
  onRemoveLink,
  onMoveLink,
}: {
  categories: Category[];
  onCreateCategory: (name: string) => void;
  onDeleteCategory: (id: string) => void;
  onAddLink?: (categoryId: string, link: SiteLink) => void;
  onRemoveLink?: (categoryId: string, linkId: string) => void;
  onMoveLink?: (linkId: string, fromCategoryId: string, toCategoryId: string, toIndex: number) => void;
}) {
  const [name, setName] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: string; name: string } | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [activeDragLink, setActiveDragLink] = useState<SiteLink | null>(null);

  const sensors = useDefaultPointerSensors();

  const create = () => {
    const n = name.trim();
    if (!n) return;
    onCreateCategory(n);
    setName("");
  };

  const confirmDeleteCategory = (id: string, categoryName: string) => {
    setCategoryToDelete({ id, name: categoryName });
    setDeleteDialogOpen(true);
  };

  const executeDeleteCategory = () => {
    if (categoryToDelete) {
      onDeleteCategory(categoryToDelete.id);
      setCategoryToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const toggleCategoryExpand = (id: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const onDragStart = (e: DragStartEvent) => {
    const linkId = e.active.id as string;
    for (const cat of categories) {
      const link = cat.links.find((l) => l.id === linkId);
      if (link) {
        setActiveDragLink(link);
        break;
      }
    }
  };

  const onDragEnd = (e: DragEndEvent) => {
    setActiveDragLink(null);
    if (!onMoveLink) return;

    const linkId = e.active.id as string;
    const overCategoryId = e.over?.id as string;

    if (!linkId || !overCategoryId) return;

    let fromCategoryId: string | null = null;
    for (const cat of categories) {
      if (cat.links.some((l) => l.id === linkId)) {
        fromCategoryId = cat.id;
        break;
      }
    }

    if (!fromCategoryId || fromCategoryId === overCategoryId) return;

    onMoveLink(linkId, fromCategoryId, overCategoryId, 0);

    toast({
      title: "已移动",
      description: "网站已移动到新分类",
    });
  };

  return (
    <>
      <AccordionItem value="categories" className="border-none">
        <Card className="p-0">
          <AccordionTrigger className="px-4">内容管理</AccordionTrigger>
          <AccordionContent className="px-4">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
            >
              <p className="mb-4 text-xs text-muted-foreground">
                管理分类、网站归类和拖拽排序。
              </p>

              <div className="space-y-2">
                <Label htmlFor="new-category">新建分类</Label>
                <div className="flex gap-2">
                  <Input
                    id="new-category"
                    value={name}
                    placeholder="例如：开发 / 学习"
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") create();
                    }}
                  />
                  <Button onClick={create}>添加</Button>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="text-xs text-muted-foreground">现有分类</div>
                <div className="space-y-1">
                  {categories.map((c) => (
                    <Collapsible
                      key={c.id}
                      open={expandedCategories.has(c.id)}
                      onOpenChange={() => toggleCategoryExpand(c.id)}
                    >
                      <DroppableCategoryHeader categoryId={c.id}>
                        <CollapsibleTrigger asChild>
                          <div className="flex items-center justify-between gap-2 px-3 py-2 cursor-pointer hover:bg-accent/50">
                            <div className="min-w-0 flex items-center gap-2">
                              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expandedCategories.has(c.id) ? "" : "-rotate-90"}`} />
                              <div className="truncate text-sm font-medium">{c.name}</div>
                              {c.links.length > 0 ? (
                                <span className="rounded-sm bg-muted px-1.5 py-0.5 text-[10px] leading-none text-muted-foreground">
                                  {c.links.length}
                                </span>
                              ) : null}
                            </div>
                            <div className="flex items-center gap-1">
                              {onAddLink ? (
                                <AddWebsiteDialog
                                  categories={categories}
                                  defaultCategoryId={c.id}
                                  onAdd={onAddLink}
                                  trigger={(
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      aria-label="添加网站"
                                      onClick={(e) => e.stopPropagation()}
                                      className="h-8 w-8"
                                    >
                                      <Plus className="h-3.5 w-3.5" />
                                    </Button>
                                  )}
                                />
                              ) : null}
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label="删除分类"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  confirmDeleteCategory(c.id, c.name);
                                }}
                                className="h-8 w-8"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="border-t px-3 py-2 space-y-1">
                            {c.links.length === 0 ? (
                              <div className="text-xs text-muted-foreground py-2">暂无网站</div>
                            ) : (
                              c.links.map((link) => (
                                <DraggableLinkItem
                                  key={link.id}
                                  link={link}
                                  onDelete={() => onRemoveLink?.(c.id, link.id)}
                                />
                              ))
                            )}
                          </div>
                        </CollapsibleContent>
                      </DroppableCategoryHeader>
                    </Collapsible>
                  ))}
                </div>
              </div>

              <DragOverlay>
                {activeDragLink ? (
                  <div className="flex items-center gap-2 rounded-sm bg-card border px-2 py-1.5 shadow-lg">
                    <GripVertical className="h-3 w-3 text-muted-foreground" />
                    <span className="truncate text-xs">{activeDragLink.title}</span>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </AccordionContent>
        </Card>
      </AccordionItem>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除分类</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除分类 "{categoryToDelete?.name}" 吗？此操作将删除该分类下的所有网站，且无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={executeDeleteCategory}>删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

