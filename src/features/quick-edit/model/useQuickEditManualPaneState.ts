import { useEffect, useMemo, useState } from "react";

import { useExpandedIdSet } from "@/shared/lib/hooks/useExpandedIdSet";
import type { Category } from "@/shared/types/category";

type UseQuickEditManualPaneStateOptions = {
  categories: Category[];
  open: boolean;
  onCreateCategory: (name: string) => void;
};

export function useQuickEditManualPaneState({
  categories,
  open,
  onCreateCategory,
}: UseQuickEditManualPaneStateOptions) {
  const { expandedIds, toggleExpandedId } = useExpandedIdSet(
    categories.map((category) => category.id),
    { defaultExpanded: true, expandNewIds: true },
  );

  const [newCategoryName, setNewCategoryName] = useState("");
  const [manualSearch, setManualSearch] = useState("");
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);

  const filteredCategories = useMemo(() => {
    if (!manualSearch) return categories;

    const query = manualSearch.toLowerCase();

    return categories
      .map((category) => {
        const nameMatch = category.name.toLowerCase().includes(query);
        if (nameMatch) {
          return category;
        }

        const links = category.links.filter(
          (link) =>
            link.title.toLowerCase().includes(query) ||
            link.url.toLowerCase().includes(query),
        );

        return { ...category, links };
      })
      .filter(
        (category) =>
          category.links.length > 0 || category.name.toLowerCase().includes(query),
      );
  }, [categories, manualSearch]);

  const handleCreateCategory = () => {
    const nextName = newCategoryName.trim();
    if (!nextName) return;

    onCreateCategory(nextName);
    setNewCategoryName("");
    setAddCategoryOpen(false);
  };

  useEffect(() => {
    if (open) return;
    setManualSearch("");
    setAddCategoryOpen(false);
    setNewCategoryName("");
  }, [open]);

  return {
    expandedIds,
    newCategoryName,
    manualSearch,
    addCategoryOpen,
    filteredCategories,
    toggleExpandedId,
    setNewCategoryName,
    setManualSearch,
    setAddCategoryOpen,
    handleCreateCategory,
  };
}

