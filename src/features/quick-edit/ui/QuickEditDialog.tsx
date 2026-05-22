import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/primitives/dialog";
import { useQuickEditDialogController } from "@/features/quick-edit/model/useQuickEditDialogController";
import { QuickEditDialogs } from "@/features/quick-edit/ui/QuickEditDialogs";
import { QuickEditWorkspace } from "@/features/quick-edit/ui/QuickEditWorkspace";
import type { Category } from "@/shared/types/category";
import type { SiteLink } from "@/shared/types/link";

interface QuickEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  onAddLink: (categoryId: string, link: SiteLink) => void;
  onRemoveLink: (categoryId: string, linkId: string) => void;
  onUpdateLinkTitle?: (linkId: string, categoryId: string, newTitle: string) => void;
  onMoveLink?: (linkId: string, fromCategoryId: string, toCategoryId: string, toIndex: number) => void;
  onCreateCategory: (name: string) => void;
  onDeleteCategory: (id: string) => void;
}

export function QuickEditDialog({
  open,
  onOpenChange,
  categories,
  onAddLink,
  onRemoveLink,
  onUpdateLinkTitle,
  onMoveLink,
  onCreateCategory,
  onDeleteCategory,
}: QuickEditDialogProps) {
  const { workspaceProps, dialogsProps } = useQuickEditDialogController({
    open,
    categories,
    onAddLink,
    onRemoveLink,
    onUpdateLinkTitle,
    onMoveLink,
    onCreateCategory,
    onDeleteCategory,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[90vw] h-[70vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-3 shrink-0">
          <DialogTitle>快速编辑</DialogTitle>
          <DialogDescription>
            从右侧书签中拖拽链接到左侧分类，或直接在左侧管理链接
          </DialogDescription>
        </DialogHeader>
        <QuickEditWorkspace {...workspaceProps} />
      </DialogContent>
      <QuickEditDialogs {...dialogsProps} />
    </Dialog>
  );
}


