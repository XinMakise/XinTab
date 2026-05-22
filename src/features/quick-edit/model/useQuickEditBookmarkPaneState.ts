import { useEffect, useMemo, useState } from "react";

import { useExpandedIdSet } from "@/shared/lib/hooks/useExpandedIdSet";
import type { Category } from "@/shared/types/category";

type UseQuickEditBookmarkPaneStateOptions = {
  categories: Category[];
  open: boolean;
};

export function useQuickEditBookmarkPaneState({
  categories,
  open,
}: UseQuickEditBookmarkPaneStateOptions) {
  const { expandedIds, toggleExpandedId } = useExpandedIdSet(
    categories.map((category) => category.id),
  );
  const [bookmarkSearch, setBookmarkSearch] = useState("");

  const filteredCategories = useMemo(() => {
    if (!bookmarkSearch) return categories;

    const query = bookmarkSearch.toLowerCase();

    return categories
      .map((category) => ({
        ...category,
        links: category.links.filter(
          (link) =>
            link.title.toLowerCase().includes(query) ||
            link.url.toLowerCase().includes(query),
        ),
      }))
      .filter((category) => category.links.length > 0);
  }, [categories, bookmarkSearch]);

  useEffect(() => {
    if (open) return;
    setBookmarkSearch("");
  }, [open]);

  return {
    expandedIds,
    bookmarkSearch,
    filteredCategories,
    toggleExpandedId,
    setBookmarkSearch,
  };
}

