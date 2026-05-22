import { useCallback, useEffect, useState } from "react";

import type { SiteLink } from "@/shared/types/link";

export function useQuickEditBookmarkEditorState(open: boolean) {
  const [editingBookmark, setEditingBookmark] = useState<SiteLink | null>(null);
  const [editingBookmarkCategoryId, setEditingBookmarkCategoryId] = useState("");

  useEffect(() => {
    if (!open) {
      setEditingBookmark(null);
      setEditingBookmarkCategoryId("");
    }
  }, [open]);

  const clearEditingBookmark = useCallback(() => {
    setEditingBookmark(null);
    setEditingBookmarkCategoryId("");
  }, []);

  const openEditBookmark = useCallback((link: SiteLink, categoryId: string) => {
    setEditingBookmark(link);
    setEditingBookmarkCategoryId(categoryId);
  }, []);

  return {
    editingBookmark,
    editingBookmarkCategoryId,
    clearEditingBookmark,
    openEditBookmark,
  };
}

