import { useCallback, useState } from "react";
import type { ComponentProps } from "react";

import type { Category } from "@/shared/types/category";
import type { SiteLink } from "@/shared/types/link";

import { BookmarksPageDialogs } from "../ui/BookmarksPageDialogs";

type EditingLinkState = { categoryId: string; link: SiteLink } | null;

type UseBookmarksPageDialogsStateOptions = {
  categories: Category[];
  onSaveBookmark: (updatedLink: SiteLink, targetCategoryId: string, oldCategoryId: string) => void;
  onDeleteCategory: (category: Category) => void | Promise<void>;
};

export function useBookmarksPageDialogsState({
  categories,
  onSaveBookmark,
  onDeleteCategory,
}: UseBookmarksPageDialogsStateOptions): {
  setEditingLink: React.Dispatch<React.SetStateAction<EditingLinkState>>;
  onDeleteCategoryIntent: (id: string) => void;
  dialogsProps: ComponentProps<typeof BookmarksPageDialogs>;
} {
  const [editingLink, setEditingLink] = useState<EditingLinkState>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  const onDeleteCategoryIntent = useCallback((id: string) => {
    const category = categories.find((item) => item.id === id);
    if (category) {
      setDeletingCategory(category);
    }
  }, [categories]);

  const handleConfirmDeleteCategory = useCallback(async (category: Category) => {
    setDeletingCategory(null);
    await onDeleteCategory(category);
  }, [onDeleteCategory]);

  return {
    setEditingLink,
    onDeleteCategoryIntent,
    dialogsProps: {
      categories,
      editingLink,
      onEditingLinkChange: setEditingLink,
      onSaveBookmark,
      deletingCategory,
      onDeletingCategoryChange: setDeletingCategory,
      onConfirmDeleteCategory: handleConfirmDeleteCategory,
    },
  };
}

