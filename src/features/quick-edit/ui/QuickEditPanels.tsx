import { Card } from "@/shared/ui/primitives/card";
import { Separator } from "@/shared/ui/primitives/separator";
import { QuickEditBookmarkPane } from "@/features/quick-edit/ui/QuickEditBookmarkPane";
import { QuickEditManualPane } from "@/features/quick-edit/ui/QuickEditManualPane";
import type { Category } from "@/shared/types/category";
import type { SiteLink } from "@/shared/types/link";

type QuickEditPanelsProps = {
  open: boolean;
  categories: Category[];
  bookmarkCategories: Category[];
  bookmarksLoading: boolean;
  chromeAvailable: boolean;
  bookmarkDropTargetId: string | null;
  onAddLink: (categoryId: string, link: SiteLink) => void;
  onRemoveLink: (categoryId: string, linkId: string) => void;
  onUpdateLinkTitle?: (linkId: string, categoryId: string, newTitle: string) => void;
  onCreateCategory: (name: string) => void;
  onDeleteCategory: (id: string) => void;
  onEditBookmark: (link: SiteLink, categoryId: string) => void;
  onRemoveBookmark: (linkId: string) => void;
  onQuickAddBookmark: (link: SiteLink) => void;
};

export function QuickEditPanels({
  open,
  categories,
  bookmarkCategories,
  bookmarksLoading,
  chromeAvailable,
  bookmarkDropTargetId,
  onAddLink,
  onRemoveLink,
  onUpdateLinkTitle,
  onCreateCategory,
  onDeleteCategory,
  onEditBookmark,
  onRemoveBookmark,
  onQuickAddBookmark,
}: QuickEditPanelsProps) {
  return (
    <div className="flex flex-1 min-h-0 px-6 pb-6 gap-0">
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="text-sm font-medium mb-2">我的导航</div>
        <Card className="flex-1 min-h-0 overflow-y-auto scrollbar-transparent p-0">
          <QuickEditManualPane
            open={open}
            categories={categories}
            categoryOptions={categories}
            onAddLink={onAddLink}
            onRemoveLink={onRemoveLink}
            onUpdateLinkTitle={onUpdateLinkTitle}
            onCreateCategory={onCreateCategory}
            onDeleteCategory={onDeleteCategory}
            bookmarkDropTargetId={bookmarkDropTargetId}
            showCreate={false}
          />
        </Card>
      </div>

      <Separator orientation="vertical" className="mx-3" />

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="text-sm font-medium mb-2">Chrome 书签</div>
        <Card className="flex-1 min-h-0 overflow-y-auto scrollbar-transparent p-0">
          <QuickEditBookmarkPane
            open={open}
            categories={bookmarkCategories}
            loading={bookmarksLoading}
            isAvailable={chromeAvailable}
            onEdit={onEditBookmark}
            onRemove={onRemoveBookmark}
            onQuickAdd={onQuickAddBookmark}
          />
        </Card>
      </div>
    </div>
  );
}


