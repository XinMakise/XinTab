import type { ComponentProps } from "react";

import { useQuickEditBookmarkState } from "@/features/quick-edit/model/useQuickEditBookmarkState";
import { useQuickEditDnd } from "@/features/quick-edit/model/useQuickEditDnd";
import { QuickEditDialogs } from "@/features/quick-edit/ui/QuickEditDialogs";
import { QuickEditWorkspace } from "@/features/quick-edit/ui/QuickEditWorkspace";
import type { Category } from "@/shared/types/category";
import type { SiteLink } from "@/shared/types/link";

type UseQuickEditDialogControllerOptions = {
  open: boolean;
  categories: Category[];
  onAddLink: (categoryId: string, link: SiteLink) => void;
  onRemoveLink: (categoryId: string, linkId: string) => void;
  onUpdateLinkTitle?: (linkId: string, categoryId: string, newTitle: string) => void;
  onMoveLink?: (linkId: string, fromCategoryId: string, toCategoryId: string, toIndex: number) => void;
  onCreateCategory: (name: string) => void;
  onDeleteCategory: (id: string) => void;
};

export function useQuickEditDialogController({
  open,
  categories,
  onAddLink,
  onRemoveLink,
  onUpdateLinkTitle,
  onMoveLink,
  onCreateCategory,
  onDeleteCategory,
}: UseQuickEditDialogControllerOptions): {
  workspaceProps: ComponentProps<typeof QuickEditWorkspace>;
  dialogsProps: ComponentProps<typeof QuickEditDialogs>;
} {
  const { workspaceBookmarkProps, dialogsProps } = useQuickEditBookmarkState({
    open,
    categories,
    onAddLink,
  });

  const {
    sensors,
    collisionDetection,
    onDragStart,
    onDragOver,
    onDragEnd,
    onDragCancel,
    activeDragItem,
    bookmarkDropTargetId,
  } = useQuickEditDnd({
    categories,
    onAddLink,
    onMoveLink,
  });

  return {
    workspaceProps: {
      open,
      categories,
      ...workspaceBookmarkProps,
      bookmarkDropTargetId,
      onAddLink,
      onRemoveLink,
      onUpdateLinkTitle,
      onCreateCategory,
      onDeleteCategory,
      sensors,
      collisionDetection,
      onDragStart,
      onDragOver,
      onDragEnd,
      onDragCancel,
      activeDragItem,
    },
    dialogsProps,
  };
}

