import { useCallback } from "react";

import { toast } from "@/shared/ui/primitives/use-toast";
import { useQuickEditBookmarkEditorState } from "@/features/quick-edit/model/useQuickEditBookmarkEditorState";
import {
  moveBookmark,
  removeBookmark,
  updateBookmark,
} from "@/features/bookmarks/lib/chromeBookmarkEditor";
import {
  resolveBookmarkSavePlan,
  resolveQuickAddBookmark,
} from "@/features/quick-edit/lib/quickEditBookmarkActions";
import type { Category } from "@/shared/types/category";
import type { SiteLink } from "@/shared/types/link";

type UseQuickEditBookmarkActionsOptions = {
  open: boolean;
  categories: Category[];
  onAddLink: (categoryId: string, link: SiteLink) => void;
  refreshBookmarkOverview: () => Promise<unknown> | void;
};

export function useQuickEditBookmarkActions({
  open,
  categories,
  onAddLink,
  refreshBookmarkOverview,
}: UseQuickEditBookmarkActionsOptions) {
  const {
    editingBookmark,
    editingBookmarkCategoryId,
    clearEditingBookmark,
    openEditBookmark,
  } = useQuickEditBookmarkEditorState(open);

  const handleSaveBookmark = useCallback(async (link: SiteLink, targetCategoryId: string) => {
    if (!editingBookmark) return;

    try {
      const savePlan = resolveBookmarkSavePlan(
        editingBookmark,
        link,
        editingBookmarkCategoryId,
        targetCategoryId,
      );

      if (savePlan.shouldUpdate) {
        await updateBookmark(link.id, savePlan.changes);
      }
      if (savePlan.shouldMove) {
        await moveBookmark(link.id, { parentId: targetCategoryId });
      }

      toast({ title: "已保存" });
      await refreshBookmarkOverview();
    } catch (error) {
      toast({
        title: "保存失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive",
      });
    }
  }, [editingBookmark, editingBookmarkCategoryId, refreshBookmarkOverview]);

  const handleRemoveBookmark = useCallback(async (linkId: string) => {
    try {
      await removeBookmark(linkId);
      toast({ title: "已删除" });
      await refreshBookmarkOverview();
    } catch (error) {
      toast({
        title: "删除失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive",
      });
    }
  }, [refreshBookmarkOverview]);

  const handleQuickAddBookmark = useCallback((link: SiteLink) => {
    const resolution = resolveQuickAddBookmark(categories, link);

    if (resolution.kind === "missing-category") {
      toast({ title: "请先创建一个分类" });
      return;
    }

    if (resolution.kind === "duplicate") {
      toast({ title: "已存在", description: `「${resolution.categoryName}」中已有相同链接` });
      return;
    }

    onAddLink(resolution.categoryId, {
      id: crypto.randomUUID(),
      title: link.title,
      url: link.url,
    });
    toast({ title: `已添加到「${resolution.categoryName}」` });
  }, [categories, onAddLink]);

  return {
    editingBookmark,
    editingBookmarkCategoryId,
    openEditBookmark,
    handleSaveBookmark,
    handleRemoveBookmark,
    handleQuickAddBookmark,
    clearEditingBookmark,
  };
}


