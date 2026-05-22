import { useCallback, useState } from "react";

type UseCategoryPanelStateOptions = {
  onCreateCategory: (name: string) => void;
  onRenameCategory: (id: string, newName: string) => void;
};

export function useCategoryPanelState({
  onCreateCategory,
  onRenameCategory,
}: UseCategoryPanelStateOptions) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [addCategoryDialogOpen, setAddCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const handleAddCategory = useCallback(() => {
    const nextName = newCategoryName.trim();
    if (!nextName) return;
    onCreateCategory(nextName);
    setNewCategoryName("");
    setAddCategoryDialogOpen(false);
  }, [newCategoryName, onCreateCategory]);

  const handleRenameCategory = useCallback((id: string, newName: string) => {
    onRenameCategory(id, newName);
    setEditingCategoryId(null);
  }, [onRenameCategory]);

  const toggleCategoryExpanded = useCallback((categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  }, []);

  return {
    panelState: {
      expandedCategories,
      editingCategoryId,
      addCategoryDialogOpen,
      newCategoryName,
    },
    panelActions: {
      setEditingCategoryId,
      setAddCategoryDialogOpen,
      setNewCategoryName,
      handleAddCategory,
      handleRenameCategory,
      toggleCategoryExpanded,
    },
  };
}
