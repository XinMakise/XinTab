import { Plus } from "lucide-react";
import {
  SortableContext,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CategoryBarDropZone } from "@/shared/ui/standard-page/CategoryBarDropZone";
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

type ManualNavCategoryBarProps = {
  categoryBarZoneId: string;
  categories: Category[];
  layout: "top" | "left";
  activeCategoryId: string;
  dragSourceCategoryId: string | null;
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

export function ManualNavCategoryBar({
  categoryBarZoneId,
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
}: ManualNavCategoryBarProps) {
  const strategy =
    layout === "left"
      ? verticalListSortingStrategy
      : horizontalListSortingStrategy;

  return (
    <SortableContext items={categories.map((category) => category.id)} strategy={strategy}>
      <CategoryBarDropZone id={categoryBarZoneId}>
        {({ setNodeRef }) => (
          <div
            ref={setNodeRef}
            className={
              layout === "left"
                ? "shrink-0 space-y-2 overflow-y-auto scrollbar-transparent"
                : "flex flex-wrap items-center gap-2"
            }
          >
            {categories.map((category) => (
              <SortableCategoryButton
                key={category.id}
                id={category.id}
                name={category.name}
                count={category.links.length}
                isActive={category.id === activeCategoryId}
                isDragSource={category.id === dragSourceCategoryId}
                onClick={() => onSelectCategory(category.id)}
                layout={layout}
                isEditing={editingCategoryId === category.id}
                onStartEdit={() => onStartEditCategory(category.id)}
                onRename={(newName) => onRenameCategory(category.id, newName)}
              />
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
                  <DialogDescription>输入新分类的名称</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="category-name">分类名称</Label>
                    <Input
                      id="category-name"
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
        )}
      </CategoryBarDropZone>
    </SortableContext>
  );
}


