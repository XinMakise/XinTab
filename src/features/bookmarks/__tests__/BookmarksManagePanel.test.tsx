import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

import { BookmarksManagePanel } from "@/features/bookmarks/ui/BookmarksPanel";
import { Accordion } from "@/shared/ui/primitives/accordion";
import Bookmarks from "@/pages/bookmarks/ui/Page";
import type { Category } from "@/shared/types/category";

const toastMock = vi.fn();
const removeBookmarkMock = vi.fn();
const getBookmarksByFoldersMock = vi.fn();
const hasChromeBookmarksMock = vi.fn();
const handleDeleteFolderMock = vi.fn();

const bookmarkCategories: Category[] = [
  {
    id: "folder-1",
    name: "开发",
    links: [{ id: "bookmark-1", title: "Docs", url: "https://docs.example.com" }],
  },
  {
    id: "folder-2",
    name: "学习",
    links: [{ id: "bookmark-2", title: "TypeScript", url: "https://typescriptlang.org" }],
  },
];

vi.mock("@/shared/ui/primitives/use-toast", () => ({
  toast: (...args: Parameters<typeof toastMock>) => toastMock(...args),
}));

vi.mock("@/features/bookmarks/lib/chromeBookmarkEditor", () => ({
  removeBookmark: (...args: Parameters<typeof removeBookmarkMock>) => removeBookmarkMock(...args),
}));

vi.mock("@/features/bookmarks/lib/bookmarks", () => ({
  getBookmarksByFolders: (...args: Parameters<typeof getBookmarksByFoldersMock>) =>
    getBookmarksByFoldersMock(...args),
}));

vi.mock("@/shared/browser/chrome", () => ({
  hasChromeBookmarks: (...args: Parameters<typeof hasChromeBookmarksMock>) =>
    hasChromeBookmarksMock(...args),
}));

vi.mock("@/features/settings/ui/SettingsSheet", () => ({
  SettingsSheet: (props: {
    model: {
      kind: "bookmarks";
      categoryManagement: { onDeleteCategory?: (id: string) => void };
    };
    trigger: React.ReactNode;
  }) => (
    <div>
      {props.trigger}
      <button
        type="button"
        onClick={() => props.model.categoryManagement.onDeleteCategory?.("folder-1")}
      >
        打开删除分类确认
      </button>
    </div>
  ),
}));

vi.mock("@/features/bookmarks/ui/BookmarksCategoryNav", () => ({
  BookmarksCategoryNav: () => <div>BookmarksCategoryNav</div>,
}));

vi.mock("@/features/bookmarks/ui/BookmarksContent", () => ({
  BookmarksContent: () => <div>BookmarksContent</div>,
}));

vi.mock("@/features/bookmarks/ui/BookmarksDragOverlay", () => ({
  BookmarksDragOverlay: () => null,
}));

vi.mock("@/features/bookmarks/model/useBookmarksDnd", () => ({
  useBookmarksDnd: () => ({
    sensors: [],
    customCollisionDetection: null,
    activeDragLink: null,
    activeDragCategory: null,
    dragSourceCategoryId: null,
    onDragStart: () => {},
    onDragOver: () => {},
    onDragEnd: () => {},
    onDragCancel: () => {},
  }),
}));

vi.mock("@/features/bookmarks/model/useBookmarksPageState", () => ({
  useBookmarksPageState: () => ({
    categories: bookmarkCategories,
    setCategories: vi.fn(),
    loading: false,
    error: null,
    activeId: "folder-1",
    setActiveId: vi.fn(),
    uiState: { categoryLayout: "top", columnsPerRow: 5, maxVisibleRows: 3 },
    orderedCategories: bookmarkCategories,
    categoryById: new Map(bookmarkCategories.map((category) => [category.id, category])),
    activeCategory: bookmarkCategories[0],
    layout: "top",
    columnsPerRow: 5,
    handleAddBookmark: vi.fn(),
    handleRemoveBookmark: vi.fn(),
    handleUpdateBookmark: vi.fn(),
    handleCreateFolder: vi.fn(),
    handleRenameFolder: vi.fn(),
    handleDeleteFolder: handleDeleteFolderMock,
    handleCategoryOrderChange: vi.fn(),
    handleLayoutChange: vi.fn(),
    handleMaxVisibleRowsChange: vi.fn(),
    handleColumnsPerRowChange: vi.fn(),
  }),
}));

describe("BookmarksManagePanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hasChromeBookmarksMock.mockReturnValue(true);
    getBookmarksByFoldersMock.mockResolvedValue(bookmarkCategories);
    removeBookmarkMock.mockResolvedValue(undefined);
  });

  it("loads bookmarks and removes a bookmark successfully", async () => {
    render(
      <Accordion type="single" collapsible value="bookmarks-management">
        <BookmarksManagePanel />
      </Accordion>,
    );

    fireEvent.click(screen.getByRole("button", { name: "内容管理" }));

    expect(await screen.findByText("开发")).toBeInTheDocument();
    fireEvent.click(screen.getByText("开发"));

    fireEvent.click(screen.getByRole("button", { name: "删除书签" }));

    await waitFor(() => {
      expect(removeBookmarkMock).toHaveBeenCalledWith("bookmark-1");
      expect(toastMock).toHaveBeenCalledWith(expect.objectContaining({ title: "已删除" }));
    });
  });

  it("shows destructive toast when bookmark deletion fails", async () => {
    removeBookmarkMock.mockRejectedValue(new Error("delete failed"));

    render(
      <Accordion type="single" collapsible value="bookmarks-management">
        <BookmarksManagePanel />
      </Accordion>,
    );

    fireEvent.click(screen.getByRole("button", { name: "内容管理" }));
    expect(await screen.findByText("开发")).toBeInTheDocument();
    fireEvent.click(screen.getByText("开发"));

    fireEvent.click(screen.getByRole("button", { name: "删除书签" }));

    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({ title: "删除失败", variant: "destructive" }),
      );
    });
  });

  it("supports expanding multiple folders and deleting bookmarks sequentially", async () => {
    getBookmarksByFoldersMock
      .mockResolvedValueOnce(bookmarkCategories)
      .mockResolvedValueOnce([
        bookmarkCategories[1],
      ])
      .mockResolvedValueOnce([]);

    render(
      <Accordion type="single" collapsible value="bookmarks-management">
        <BookmarksManagePanel />
      </Accordion>,
    );

    fireEvent.click(screen.getByRole("button", { name: "内容管理" }));

    expect(await screen.findByText("开发")).toBeInTheDocument();
    fireEvent.click(screen.getByText("开发"));
    fireEvent.click(screen.getByText("学习"));

    expect(screen.getByText("Docs")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "删除书签" })[0]!);

    await waitFor(() => {
      expect(removeBookmarkMock).toHaveBeenCalledWith("bookmark-1");
    });

    expect(await screen.findByText("学习")).toBeInTheDocument();
    fireEvent.click(screen.getByText("学习"));
    fireEvent.click(screen.getByRole("button", { name: "删除书签" }));

    await waitFor(() => {
      expect(removeBookmarkMock).toHaveBeenCalledWith("bookmark-2");
      expect(getBookmarksByFoldersMock).toHaveBeenCalledTimes(3);
    });
  });
});

describe("Bookmarks delete-category linkage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("confirms folder deletion from the Bookmarks page", async () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Bookmarks />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "打开删除分类确认" }));

    expect(await screen.findByText("确认删除分类？")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "删除" }));

    await waitFor(() => {
      expect(handleDeleteFolderMock).toHaveBeenCalledWith(bookmarkCategories[0]);
    });
  });
});


