import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useQuickEditDialogController } from "@/features/quick-edit";

const dndStub = {
  sensors: [],
  collisionDetection: () => [],
  onDragStart: vi.fn(),
  onDragOver: vi.fn(),
  onDragEnd: vi.fn(),
  onDragCancel: vi.fn(),
  activeDragItem: null,
  bookmarkDropTargetId: "qe-nav-link:cat-a:link-1",
};

const bookmarkStateStub = {
  workspaceBookmarkProps: {
    bookmarkCategories: [{ id: "bm-cat", name: "书签", links: [] }],
    bookmarksLoading: false,
    chromeAvailable: true,
    onEditBookmark: vi.fn(),
    onRemoveBookmark: vi.fn(),
    onQuickAddBookmark: vi.fn(),
  },
  dialogsProps: {
    editingBookmark: null,
    editingBookmarkCategoryId: "",
    bookmarkCategories: [{ id: "bm-cat", name: "书签", links: [] }],
    onCloseEditingBookmark: vi.fn(),
    onSaveBookmark: vi.fn(),
  },
};

const useQuickEditDndMock = vi.fn(() => dndStub);
const useQuickEditBookmarkStateMock = vi.fn(() => bookmarkStateStub);

vi.mock("@/features/quick-edit/model/useQuickEditDnd", () => ({
  useQuickEditDnd: (...args: unknown[]) => useQuickEditDndMock(...args),
}));

vi.mock("@/features/quick-edit/model/useQuickEditBookmarkState", () => ({
  useQuickEditBookmarkState: (...args: unknown[]) => useQuickEditBookmarkStateMock(...args),
}));

describe("useQuickEditDialogController", () => {
  it("combines bookmark state and dnd state into workspace/dialog props", () => {
    const categories = [{ id: "cat-a", name: "常用", links: [] }];
    const onAddLink = vi.fn();
    const onRemoveLink = vi.fn();
    const onUpdateLinkTitle = vi.fn();
    const onMoveLink = vi.fn();
    const onCreateCategory = vi.fn();
    const onDeleteCategory = vi.fn();

    const { result } = renderHook(() =>
      useQuickEditDialogController({
        open: true,
        categories,
        onAddLink,
        onRemoveLink,
        onUpdateLinkTitle,
        onMoveLink,
        onCreateCategory,
        onDeleteCategory,
      }),
    );

    expect(useQuickEditBookmarkStateMock).toHaveBeenCalledWith({
      open: true,
      categories,
      onAddLink,
    });
    expect(useQuickEditDndMock).toHaveBeenCalledWith({
      categories,
      onAddLink,
      onMoveLink,
    });

    expect(result.current.workspaceProps).toMatchObject({
      open: true,
      categories,
      bookmarkCategories: bookmarkStateStub.workspaceBookmarkProps.bookmarkCategories,
      bookmarksLoading: false,
      chromeAvailable: true,
      bookmarkDropTargetId: "qe-nav-link:cat-a:link-1",
      onAddLink,
      onRemoveLink,
      onUpdateLinkTitle,
      onCreateCategory,
      onDeleteCategory,
      onEditBookmark: bookmarkStateStub.workspaceBookmarkProps.onEditBookmark,
      onRemoveBookmark: bookmarkStateStub.workspaceBookmarkProps.onRemoveBookmark,
      onQuickAddBookmark: bookmarkStateStub.workspaceBookmarkProps.onQuickAddBookmark,
      activeDragItem: null,
    });

    expect(result.current.dialogsProps).toBe(bookmarkStateStub.dialogsProps);
  });
});
