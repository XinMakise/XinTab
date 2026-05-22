import { Plus } from "lucide-react";
import {
  SortableContext,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { SortableCategoryButton } from "@/shared/ui/standard-page/SortableCategoryButton";
import { Button } from "@/shared/ui/primitives/button";
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
import type { Category } from "@/shared/types/category";

export type BookmarksCategoryNavProps = {
  categories: Category[];
  layout: "top" | "left" | "all";
  activeCategoryId?: string;
  dragSourceCategoryId?: string;
  editingCategoryId: string | null;
  addCategoryDialogOpen: boolean;
  newCategoryName: string;
  onSelectCategory: (categoryId: string) => void;
  onStartEditCategory: (categoryId: string) => void;
  onRenameCategory: (categoryId: string, newName: string) => void;
  onAddCategoryDialogOpenChange: (open: boolean) => void;
  onNewCategoryNameChange: (value: string) => void;
  onSubmitNewCategory: () => void;
};

export function BookmarksCategoryNav({
  categories,
  layout,
  activeCategoryId,
  dragSourceCategoryId,
  editingCategoryId,
  addCategoryDialogOpen,
  newCategoryName,
  onSelectCategory,
  onStartEditCategory,
  onRenameCategory,
  onAddCategoryDialogOpenChange,
  onNewCategoryNameChange,
  onSubmitNewCategory,
}: BookmarksCategoryNavProps) {
  if (categories.length === 0) return null;

  const strategy =
    layout === "left"
      ? verticalListSortingStrategy
      : horizontalListSortingStrategy;

  return (
    <SortableContext
      items={categories.map((category) => category.id)}
      strategy={strategy}
    >
      <div
        className={
          layout === "left"
            ? "shrink-0 space-y-2 overflow-y-auto scrollbar-transparent"
            : "flex flex-wrap items-center gap-2"
        }
      >
        {categories.map((category) => (
          <div key={category.id} data-category-id={category.id}>
            <SortableCategoryButton
              id={category.id}
              name={category.name}
              count={category.links.length}
              isActive={activeCategoryId === category.id}
              isDragSource={category.id === dragSourceCategoryId}
              onClick={() => onSelectCategory(category.id)}
              layout={layout}
              droppable={true}
              isEditing={editingCategoryId === category.id}
              onStartEdit={() => onStartEditCategory(category.id)}
              onRename={(newName) => onRenameCategory(category.id, newName)}
            />
          </div>
        ))}

        <Dialog open={addCategoryDialogOpen} onOpenChange={onAddCategoryDialogOpenChange}>
          <DialogTrigger asChild>
            <Button variant="secondary" size="default" aria-label="添加分类">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>添加分类</DialogTitle>
              <DialogDescription>在书签栏下创建新的文件夹</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bm-category-name">分类名称</Label>
                <Input
                  id="bm-category-name"
                  placeholder="例如：开发 / 学习"
                  value={newCategoryName}
                  onChange={(event) => onNewCategoryNameChange(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") onSubmitNewCategory();
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => onAddCategoryDialogOpenChange(false)}>
                取消
              </Button>
              <Button onClick={onSubmitNewCategory} disabled={!newCategoryName.trim()}>
                添加
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SortableContext>
  );
}


