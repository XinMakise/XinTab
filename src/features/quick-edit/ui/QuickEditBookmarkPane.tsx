import { BookmarkIcon } from "lucide-react";

import { useQuickEditBookmarkPaneState } from "@/features/quick-edit/model/useQuickEditBookmarkPaneState";
import { QuickEditBookmarkFolder } from "@/features/quick-edit/ui/quick-edit/QuickEditBookmarkFolder";
import { QuickEditPaneMessage } from "@/features/quick-edit/ui/quick-edit/QuickEditPaneMessage";
import { QuickEditSearchInput } from "@/features/quick-edit/ui/quick-edit/QuickEditSearchInput";
import type { Category } from "@/shared/types/category";
import type { SiteLink } from "@/shared/types/link";

interface QuickEditBookmarkPaneProps {
  categories: Category[];
  loading: boolean;
  isAvailable: boolean;
  onEdit?: (link: SiteLink, categoryId: string) => void;
  onRemove?: (linkId: string) => void;
  onQuickAdd?: (link: SiteLink) => void;
  open?: boolean;
}

export function QuickEditBookmarkPane({
  categories,
  loading,
  isAvailable,
  onEdit,
  onRemove,
  onQuickAdd,
  open = true,
}: QuickEditBookmarkPaneProps) {
  const {
    expandedIds,
    bookmarkSearch,
    filteredCategories,
    toggleExpandedId,
    setBookmarkSearch,
  } = useQuickEditBookmarkPaneState({
    categories,
    open,
  });

  if (!isAvailable) {
    return (
      <QuickEditPaneMessage
        icon={<BookmarkIcon className="mx-auto h-8 w-8 opacity-50" />}
        title="Chrome 书签不可用"
        description="请在 Chrome 扩展环境中使用此功能"
      />
    );
  }

  if (loading) {
    return <QuickEditPaneMessage title="加载书签中..." />;
  }

  if (filteredCategories.length === 0) {
    return <QuickEditPaneMessage title="暂无书签" />;
  }

  return (
    <div className="p-2 space-y-1">
      <QuickEditSearchInput
        placeholder="搜索书签..."
        className="relative mb-2"
        value={bookmarkSearch}
        onValueChange={setBookmarkSearch}
      />
      {filteredCategories.map((category) => (
        <QuickEditBookmarkFolder
          key={category.id}
          category={category}
          expanded={expandedIds.has(category.id)}
          onToggle={() => toggleExpandedId(category.id)}
          onEdit={onEdit}
          onRemove={onRemove}
          onQuickAdd={onQuickAdd}
        />
      ))}
    </div>
  );
}

