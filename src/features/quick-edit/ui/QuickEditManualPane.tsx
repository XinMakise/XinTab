import { Plus } from "lucide-react";

import { Button } from "@/shared/ui/primitives/button";
import { useQuickEditManualPaneState } from "@/features/quick-edit/model/useQuickEditManualPaneState";
import { QuickEditCreateCategoryRow } from "@/features/quick-edit/ui/quick-edit/QuickEditCreateCategoryRow";
import { QuickEditManualCategory } from "@/features/quick-edit/ui/quick-edit/QuickEditManualCategory";
import { QuickEditSearchInput } from "@/features/quick-edit/ui/quick-edit/QuickEditSearchInput";
import type { Category } from "@/shared/types/category";
import type { SiteLink } from "@/shared/types/link";

interface QuickEditManualPaneProps {
  categories: Category[];
  categoryOptions?: Category[];
  onAddLink: (categoryId: string, link: SiteLink) => void;
  onRemoveLink: (categoryId: string, linkId: string) => void;
  onUpdateLinkTitle?: (linkId: string, categoryId: string, newTitle: string) => void;
  onCreateCategory: (name: string) => void;
  onDeleteCategory: (id: string) => void;
  bookmarkDropTargetId?: string | null;
  showCreate?: boolean;
  open?: boolean;
}

export function QuickEditManualPane({
  categories,
  categoryOptions,
  onAddLink,
  onRemoveLink,
  onUpdateLinkTitle,
  onCreateCategory,
  onDeleteCategory,
  bookmarkDropTargetId,
  showCreate = true,
  open = true,
}: QuickEditManualPaneProps) {
  const {
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
  } = useQuickEditManualPaneState({
    categories,
    open,
    onCreateCategory,
  });

  return (
    <div className="p-2 space-y-1">
      <div className="mb-2 flex items-center gap-2">
        <QuickEditSearchInput
          placeholder="搜索我的导航..."
          className="relative flex-1"
          value={manualSearch}
          onValueChange={setManualSearch}
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label="添加分类"
          onClick={() => setAddCategoryOpen((value) => !value)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {(showCreate || addCategoryOpen) && (
        <QuickEditCreateCategoryRow
          value={newCategoryName}
          onValueChange={setNewCategoryName}
          onSubmit={handleCreateCategory}
          onCancel={() => setAddCategoryOpen(false)}
        />
      )}

      {filteredCategories.map((category) => (
        <QuickEditManualCategory
          key={category.id}
          category={category}
          categoryOptions={categoryOptions ?? categories}
          expanded={expandedIds.has(category.id)}
          onToggle={() => toggleExpandedId(category.id)}
          onAddLink={onAddLink}
          onRemoveLink={onRemoveLink}
          onUpdateLinkTitle={onUpdateLinkTitle}
          onDeleteCategory={onDeleteCategory}
          bookmarkDropTargetId={bookmarkDropTargetId}
        />
      ))}
    </div>
  );
}


