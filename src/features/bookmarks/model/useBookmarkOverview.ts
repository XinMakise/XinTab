import { useCallback, useEffect, useState } from "react";

import { getBookmarkOverview } from "@/features/bookmarks/lib/bookmarks";
import { hasChromeBookmarks } from "@/shared/browser/chrome";
import type { Category } from "@/shared/types/category";

export function useBookmarkOverview(enabled: boolean) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const chromeAvailable = hasChromeBookmarks();

  const refresh = useCallback(() => {
    if (!chromeAvailable) {
      setCategories([]);
      return;
    }

    setLoading(true);
    return getBookmarkOverview({ includeEmpty: true })
      .then(({ categories }) => {
        setCategories(categories);
      })
      .catch(() => {
        setCategories([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [chromeAvailable]);

  useEffect(() => {
    if (!enabled || !chromeAvailable) return;
    void refresh();
  }, [enabled, chromeAvailable, refresh]);

  return { categories, loading, refresh, chromeAvailable };
}

