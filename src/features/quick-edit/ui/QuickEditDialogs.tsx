import type { Category } from "@/shared/types/category";
import type { SiteLink } from "@/shared/types/link";
import { EditBookmarkDialog } from "@/features/bookmarks/ui/EditBookmarkDialog";

type QuickEditDialogsProps = {
  editingBookmark: SiteLink | null;
  editingBookmarkCategoryId: string;
  bookmarkCategories: Category[];
  onCloseEditingBookmark: () => void;
  onSaveBookmark: (link: SiteLink, categoryId: string) => void;
};

export function QuickEditDialogs({
  editingBookmark,
  editingBookmarkCategoryId,
  bookmarkCategories,
  onCloseEditingBookmark,
  onSaveBookmark,
}: QuickEditDialogsProps) {
  if (!editingBookmark) {
    return null;
  }

  return (
    <EditBookmarkDialog
      link={editingBookmark}
      categories={bookmarkCategories}
      categoryId={editingBookmarkCategoryId}
      open
      onOpenChange={(open) => {
        if (!open) {
          onCloseEditingBookmark();
        }
      }}
      onSave={onSaveBookmark}
    />
  );
}

