import { useCallback, useMemo } from "react";
import type { Dispatch, SetStateAction } from "react";

import { extractSiteName } from "@/entities/link";
import { toast } from "@/shared/ui/primitives/use-toast";
import type { Category } from "@/shared/types/category";
import type { ManualNavState } from "@/shared/types/manual-nav";
import type { RecentVisitItem } from "@/shared/types/recent-visit";
import type { SiteLink } from "@/shared/types/link";

type UseManualNavCategoriesOptions = {
  state: ManualNavState;
  setState: Dispatch<SetStateAction<ManualNavState>>;
  setActiveCategoryId: Dispatch<SetStateAction<string>>;
};

export function useManualNavCategories({
  state,
  setState,
  setActiveCategoryId,
}: UseManualNavCategoriesOptions) {
  const categoryById = useMemo(() => {
    const next = new Map<string, Category>();
    for (const category of state.categories) {
      next.set(category.id, category);
    }
    return next;
  }, [state.categories]);

  const createCategory = useCallback((name: string) => {
    const nextName = name.trim();
    if (!nextName) return;

    const id = `cat_${crypto.randomUUID()}`;
    setState((prev) => ({
      ...prev,
      categories: [...prev.categories, { id, name: nextName, links: [] }],
    }));
    setActiveCategoryId(id);
  }, [setActiveCategoryId, setState]);

  const deleteCategory = useCallback((id: string) => {
    setState((prev) => {
      const nextCategories = prev.categories.filter((category) => category.id !== id);

      setActiveCategoryId((prevId) => {
        if (prevId !== id) return prevId;
        return nextCategories[0]?.id ?? prevId;
      });

      return { ...prev, categories: nextCategories };
    });
  }, [setActiveCategoryId, setState]);

  const renameCategory = useCallback((id: string, newName: string) => {
    const nextName = newName.trim();
    if (!nextName) return;

    setState((prev) => ({
      ...prev,
      categories: prev.categories.map((category) =>
        category.id === id ? { ...category, name: nextName } : category,
      ),
    }));
  }, [setState]);

  const onAddLink = useCallback((categoryId: string, link: SiteLink) => {
    setState((prev) => {
      const category = prev.categories.find((item) => item.id === categoryId);
      if (!category) return prev;

      if (category.links.some((item) => item.url === link.url)) {
        toast({
          title: "已存在",
          description: "该分类里已有相同 URL。",
        });
        return prev;
      }

      return {
        ...prev,
        categories: prev.categories.map((item) =>
          item.id === categoryId ? { ...item, links: [...item.links, link] } : item,
        ),
      };
    });
  }, [setState]);

  const onRemoveLink = useCallback((categoryId: string, linkId: string) => {
    setState((prev) => ({
      ...prev,
      categories: prev.categories.map((category) =>
        category.id === categoryId
          ? { ...category, links: category.links.filter((link) => link.id !== linkId) }
          : category,
      ),
    }));
  }, [setState]);

  const onUpdateLink = useCallback((categoryId: string, updatedLink: SiteLink) => {
    setState((prev) => ({
      ...prev,
      categories: prev.categories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              links: category.links.map((link) =>
                link.id === updatedLink.id ? updatedLink : link,
              ),
            }
          : category,
      ),
    }));
  }, [setState]);

  const onUpdateLinkTitle = useCallback((linkId: string, categoryId: string, newTitle: string) => {
    setState((prev) => ({
      ...prev,
      categories: prev.categories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              links: category.links.map((link) =>
                link.id === linkId ? { ...link, title: newTitle } : link,
              ),
            }
          : category,
      ),
    }));
  }, [setState]);

  const addRecentVisitToCategory = useCallback((
    categoryId: string,
    visit: RecentVisitItem,
    insertIndex?: number,
  ) => {
    let duplicateCategoryName: string | null = null;
    let addedCategoryName: string | null = null;

    setState((prev) => {
      const category = prev.categories.find((item) => item.id === categoryId);
      if (!category) return prev;

      if (category.links.some((link) => link.url === visit.url)) {
        duplicateCategoryName = category.name;
        return prev;
      }

      addedCategoryName = category.name;

      const newLink = {
        id: crypto.randomUUID(),
        title: visit.title.trim() || extractSiteName(visit.url),
        url: visit.url,
      };

      const clampedIndex =
        typeof insertIndex === "number"
          ? Math.max(0, Math.min(insertIndex, category.links.length))
          : category.links.length;

      const nextLinks = [...category.links];
      nextLinks.splice(clampedIndex, 0, newLink);

      return {
        ...prev,
        categories: prev.categories.map((item) =>
          item.id === categoryId ? { ...item, links: nextLinks } : item,
        ),
      };
    });

    if (duplicateCategoryName) {
      toast({
        title: "已存在",
        description: `「${duplicateCategoryName}」中已有相同 URL。`,
      });
      return;
    }

    if (addedCategoryName) {
      setActiveCategoryId(categoryId);
      toast({
        title: "已添加",
        description: `已加入「${addedCategoryName}」`,
      });
    }
  }, [setActiveCategoryId, setState]);

  const handleDeleteCategoryFromSettings = useCallback((id: string) => {
    if (state.categories.length <= 1) {
      toast({ title: "至少保留一个分类" });
      return;
    }
    deleteCategory(id);
  }, [deleteCategory, state.categories.length]);

  return {
    categoryById,
    createCategory,
    deleteCategory,
    renameCategory,
    onAddLink,
    onRemoveLink,
    onUpdateLink,
    onUpdateLinkTitle,
    addRecentVisitToCategory,
    handleDeleteCategoryFromSettings,
  };
}
