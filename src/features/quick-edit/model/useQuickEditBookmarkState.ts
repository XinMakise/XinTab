import type { ComponentProps } from "react";

import { useBookmarkOverview } from "@/features/bookmarks/model/useBookmarkOverview";
import { useQuickEditBookmarkActions } from "@/features/quick-edit/model/useQuickEditBookmarkActions";
import { QuickEditDialogs } from "@/features/quick-edit/ui/QuickEditDialogs";
import type { Category } from "@/shared/types/category";
import type { SiteLink } from "@/shared/types/link";

type QuickEditBookmarkWorkspaceProps = {
  bookmarkCategories: Category[];
  bookmarksLoading: boolean;
  chromeAvailable: boolean;
  onEditBookmark: (link: SiteLink, categoryId: string) => void;
  onRemoveBookmark: (linkId: string) => void;
  onQuickAddBookmark: (link: SiteLink) => void;
};

type UseQuickEditBookmarkStateOptions = {
  open: boolean;
  categories: Category[];
  onAddLink: (categoryId: string, link: SiteLink) => void;
};

export function useQuickEditBookmarkState({
  open,
  categories,
  onAddLink,
}: UseQuickEditBookmarkStateOptions): {
  workspaceBookmarkProps: QuickEditBookmarkWorkspaceProps;
  dialogsProps: ComponentProps<typeof QuickEditDialogs>;
} {
  const {
    categories: bookmarkCategories,
    loading: bookmarksLoading,
    refresh: refreshBookmarkOverview,
    chromeAvailable,
  } = useBookmarkOverview(open);

  const {
    editingBookmark,
    editingBookmarkCategoryId,
    openEditBookmark,
    handleSaveBookmark,
    handleRemoveBookmark,
    handleQuickAddBookmark,
    clearEditingBookmark,
  } = useQuickEditBookmarkActions({
    open,
    categories,
    onAddLink,
    refreshBookmarkOverview,
  });

  return {
    workspaceBookmarkProps: {
      bookmarkCategories,
      bookmarksLoading,
      chromeAvailable,
      onEditBookmark: openEditBookmark,
      onRemoveBookmark: handleRemoveBookmark,
      onQuickAddBookmark: handleQuickAddBookmark,
    },
    dialogsProps: {
      editingBookmark,
      editingBookmarkCategoryId,
      bookmarkCategories,
      onCloseEditingBookmark: clearEditingBookmark,
      onSaveBookmark: handleSaveBookmark,
    },
  };
}

