import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { toast } from "@/shared/ui/primitives/use-toast";
import { getBookmarksByFolders, getBookmarksBarId } from "@/features/bookmarks/lib/bookmarks";
import {
  createBookmark,
  createBookmarkFolder,
  moveBookmark,
  removeBookmark,
  removeBookmarkFolder,
  updateBookmark,
} from "@/features/bookmarks/lib/chromeBookmarkEditor";
import { storage } from "@/shared/browser/storage";
import { useDebouncedCallback } from "@/shared/lib/hooks/useDebounce";
import type { BookmarksUIState } from "@/shared/types/bookmarks";
import type { Category } from "@/shared/types/category";
import type { SiteLink } from "@/shared/types/link";

const BOOKMARKS_UI_KEY = "bookmarks_ui_v1";

const DEFAULT_UI: BookmarksUIState = {
  categoryOrder: [],
  categoryLayout: "top",
  maxVisibleRows: 3,
  columnsPerRow: 5,
};

export function useBookmarksPageState() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | undefined>(undefined);
  const [uiState, setUiState] = useState<BookmarksUIState>(DEFAULT_UI);
  const snapshotRef = useRef<Category[]>([]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const savedUI = await storage.get<BookmarksUIState>(BOOKMARKS_UI_KEY);
        if (mounted && savedUI) {
          setUiState({ ...DEFAULT_UI, ...savedUI });
        }

        const result = await getBookmarksByFolders();
        if (!mounted) return;

        setCategories(result);
        setActiveId(result[0]?.id);
      } catch (error) {
        const message = error instanceof Error ? error.message : "读取书签失败";
        if (mounted) setError(message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const debouncedPersist = useDebouncedCallback(
    (nextUiState: BookmarksUIState) => {
      storage.set(BOOKMARKS_UI_KEY, nextUiState).catch((error) => {
        console.warn("Failed to persist bookmarks UI state", error);
      });
    },
    300,
  );

  useEffect(() => {
    if (loading) return;
    debouncedPersist(uiState);
  }, [debouncedPersist, loading, uiState]);

  const layout = uiState.categoryLayout ?? "top";
  const columnsPerRow = uiState.columnsPerRow ?? 5;

  const orderedCategories = useMemo(() => {
    if (!uiState.categoryOrder || uiState.categoryOrder.length === 0) {
      return categories;
    }

    const orderMap = new Map(uiState.categoryOrder.map((id, index) => [id, index]));
    return [...categories].sort((left, right) => {
      const leftIndex = orderMap.get(left.id) ?? Infinity;
      const rightIndex = orderMap.get(right.id) ?? Infinity;
      return leftIndex - rightIndex;
    });
  }, [categories, uiState.categoryOrder]);

  const categoryById = useMemo(() => {
    const next = new Map<string, Category>();
    for (const category of orderedCategories) {
      next.set(category.id, category);
    }
    return next;
  }, [orderedCategories]);

  const activeCategory = orderedCategories.find((category) => category.id === activeId);

  const rollback = useCallback((error: unknown) => {
    setCategories(snapshotRef.current);
    toast({
      title: "操作失败",
      description: error instanceof Error ? error.message : "未知错误",
      variant: "destructive",
    });
  }, []);

  const handleAddBookmark = useCallback(async (categoryId: string, link: SiteLink) => {
    try {
      const result = await createBookmark(categoryId, link.title, link.url);
      setCategories((prev) =>
        prev.map((category) =>
          category.id === categoryId
            ? {
                ...category,
                links: [{ id: result.id, title: link.title, url: link.url }, ...category.links],
              }
            : category,
        ),
      );
      toast({ title: "已添加" });
    } catch (error) {
      toast({
        title: "添加失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive",
      });
    }
  }, []);

  const handleRemoveBookmark = useCallback((categoryId: string, linkId: string) => {
    snapshotRef.current = categories;
    setCategories((prev) =>
      prev.map((category) =>
        category.id === categoryId
          ? { ...category, links: category.links.filter((link) => link.id !== linkId) }
          : category,
      ),
    );
    removeBookmark(linkId).catch(rollback);
  }, [categories, rollback]);

  const handleUpdateBookmark = useCallback(async (
    updatedLink: SiteLink,
    targetCategoryId: string,
    oldCategoryId: string,
  ) => {
    snapshotRef.current = categories;

    try {
      const changes: { title?: string; url?: string } = {};
      const oldLink = categories
        .find((category) => category.id === oldCategoryId)
        ?.links.find((link) => link.id === updatedLink.id);

      if (oldLink) {
        if (updatedLink.title !== oldLink.title) changes.title = updatedLink.title;
        if (updatedLink.url !== oldLink.url) changes.url = updatedLink.url;
      }

      if (targetCategoryId === oldCategoryId) {
        setCategories((prev) =>
          prev.map((category) =>
            category.id === oldCategoryId
              ? {
                  ...category,
                  links: category.links.map((link) =>
                    link.id === updatedLink.id ? updatedLink : link,
                  ),
                }
              : category,
          ),
        );
      } else {
        setCategories((prev) =>
          prev.map((category) => {
            if (category.id === oldCategoryId) {
              return {
                ...category,
                links: category.links.filter((link) => link.id !== updatedLink.id),
              };
            }

            if (category.id === targetCategoryId) {
              return { ...category, links: [updatedLink, ...category.links] };
            }

            return category;
          }),
        );
      }

      if (Object.keys(changes).length > 0) {
        await updateBookmark(updatedLink.id, changes);
      }

      if (targetCategoryId !== oldCategoryId) {
        await moveBookmark(updatedLink.id, { parentId: targetCategoryId });
      }

      toast({ title: "已保存" });
    } catch (error) {
      rollback(error);
    }
  }, [categories, rollback]);

  const handleCreateFolder = useCallback(async (name: string) => {
    const nextName = name.trim();
    if (!nextName) return;

    try {
      const parentId = await getBookmarksBarId();
      const result = await createBookmarkFolder(parentId, nextName);
      const nextCategory: Category = { id: result.id, name: nextName, links: [] };

      setCategories((prev) => [...prev, nextCategory]);
      setActiveId(result.id);
      toast({ title: "分类已创建" });
    } catch (error) {
      toast({
        title: "创建失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive",
      });
    }
  }, []);

  const handleRenameFolder = useCallback((id: string, newName: string) => {
    const nextName = newName.trim();
    if (!nextName) return;

    snapshotRef.current = categories;
    setCategories((prev) =>
      prev.map((category) => (category.id === id ? { ...category, name: nextName } : category)),
    );
    updateBookmark(id, { title: nextName }).catch(rollback);
  }, [categories, rollback]);

  const handleDeleteFolder = useCallback(async (category: Category) => {
    snapshotRef.current = categories;
    setCategories((prev) => prev.filter((item) => item.id !== category.id));
    setActiveId((prevId) => {
      if (prevId !== category.id) return prevId;
      const remaining = categories.filter((item) => item.id !== category.id);
      return remaining[0]?.id;
    });

    try {
      await removeBookmarkFolder(category.id);
      toast({ title: "分类已删除" });
    } catch (error) {
      rollback(error);
    }
  }, [categories, rollback]);

  const handleCategoryOrderChange = useCallback((order: string[]) => {
    setUiState((prev) => ({ ...prev, categoryOrder: order }));
  }, []);

  const handleLayoutChange = useCallback((newLayout: "top" | "left" | "all") => {
    setUiState((prev) => ({ ...prev, categoryLayout: newLayout }));
  }, []);

  const handleMaxVisibleRowsChange = useCallback((rows: number) => {
    setUiState((prev) => ({ ...prev, maxVisibleRows: rows }));
  }, []);

  const handleColumnsPerRowChange = useCallback((cols: number) => {
    setUiState((prev) => ({ ...prev, columnsPerRow: cols }));
  }, []);

  return {
    categories,
    setCategories,
    loading,
    error,
    activeId,
    setActiveId,
    uiState,
    orderedCategories,
    categoryById,
    activeCategory,
    layout,
    columnsPerRow,
    handleAddBookmark,
    handleRemoveBookmark,
    handleUpdateBookmark,
    handleCreateFolder,
    handleRenameFolder,
    handleDeleteFolder,
    handleCategoryOrderChange,
    handleLayoutChange,
    handleMaxVisibleRowsChange,
    handleColumnsPerRowChange,
  };
}


