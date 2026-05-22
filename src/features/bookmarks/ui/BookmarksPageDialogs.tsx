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
import type { Category } from "@/shared/types/category";
import type { SiteLink } from "@/shared/types/link";

import { EditBookmarkDialog } from "./EditBookmarkDialog";

type BookmarksPageDialogsProps = {
  categories: Category[];
  editingLink: { categoryId: string; link: SiteLink } | null;
  onEditingLinkChange: (value: { categoryId: string; link: SiteLink } | null) => void;
  onSaveBookmark: (updatedLink: SiteLink, targetCategoryId: string, oldCategoryId: string) => void;
  deletingCategory: Category | null;
  onDeletingCategoryChange: (value: Category | null) => void;
  onConfirmDeleteCategory: (category: Category) => void | Promise<void>;
};

export function BookmarksPageDialogs({
  categories,
  editingLink,
  onEditingLinkChange,
  onSaveBookmark,
  deletingCategory,
  onDeletingCategoryChange,
  onConfirmDeleteCategory,
}: BookmarksPageDialogsProps) {
  return (
    <>
      {editingLink ? (
        <EditBookmarkDialog
          link={editingLink.link}
          categories={categories}
          categoryId={editingLink.categoryId}
          open={!!editingLink}
          onOpenChange={(open) => !open && onEditingLinkChange(null)}
          onSave={(updatedLink, targetCategoryId) => {
            onSaveBookmark(updatedLink, targetCategoryId, editingLink.categoryId);
            onEditingLinkChange(null);
          }}
        />
      ) : null}

      <AlertDialog
        open={!!deletingCategory}
        onOpenChange={(open) => !open && onDeletingCategoryChange(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除分类？</AlertDialogTitle>
            <AlertDialogDescription>
              将删除文件夹「{deletingCategory?.name}」及其下所有书签（共 {deletingCategory?.links.length ?? 0} 个），此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deletingCategory && onConfirmDeleteCategory(deletingCategory)}
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}


