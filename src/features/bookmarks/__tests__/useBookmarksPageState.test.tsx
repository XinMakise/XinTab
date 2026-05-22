import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useBookmarksPageState } from "@/features/bookmarks";
import { getBookmarksByFolders } from "@/features/bookmarks/lib/bookmarks";
import { storage } from "@/shared/browser/storage";
import type { Category } from "@/shared/types/category";

vi.mock("@/shared/lib/hooks/useDebounce", () => ({
  useDebouncedCallback: <T extends (...args: never[]) => unknown>(callback: T) => callback,
}));

vi.mock("@/shared/browser/storage", () => ({
  storage: {
    get: vi.fn(),
    set: vi.fn(() => Promise.resolve()),
  },
}));

vi.mock("@/features/bookmarks/lib/bookmarks", () => ({
  getBookmarksByFolders: vi.fn(),
  getBookmarksBarId: vi.fn(() => Promise.resolve("bookmarks-bar")),
}));

vi.mock("@/features/bookmarks/lib/chromeBookmarkEditor", () => ({
  createBookmark: vi.fn(),
  createBookmarkFolder: vi.fn(),
  moveBookmark: vi.fn(),
  removeBookmark: vi.fn(),
  removeBookmarkFolder: vi.fn(),
  updateBookmark: vi.fn(),
}));

vi.mock("@/shared/ui/primitives/use-toast", () => ({
  toast: vi.fn(),
}));

const mockedStorage = vi.mocked(storage);
const mockedGetBookmarksByFolders = vi.mocked(getBookmarksByFolders);

const categories: Category[] = [
  {
    id: "folder-1",
    name: "开发",
    links: [{ id: "link-1", title: "GitHub", url: "https://github.com" }],
  },
  {
    id: "folder-2",
    name: "学习",
    links: [{ id: "link-2", title: "MDN", url: "https://developer.mozilla.org" }],
  },
];

describe("useBookmarksPageState", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedGetBookmarksByFolders.mockResolvedValue(categories);
  });

  it("loads saved UI state and applies custom category order", async () => {
    mockedStorage.get.mockResolvedValueOnce({
      categoryLayout: "left",
      columnsPerRow: 2,
      maxVisibleRows: 1,
      categoryOrder: ["folder-2", "folder-1"],
    });

    const { result } = renderHook(() => useBookmarksPageState());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.layout).toBe("left");
    expect(result.current.columnsPerRow).toBe(2);
    expect(result.current.orderedCategories.map((category) => category.id)).toEqual([
      "folder-2",
      "folder-1",
    ]);
  });

  it("persists updated bookmarks UI preferences", async () => {
    mockedStorage.get.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useBookmarksPageState());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    mockedStorage.set.mockClear();

    act(() => {
      result.current.handleLayoutChange("all");
      result.current.handleColumnsPerRowChange(3);
      result.current.handleMaxVisibleRowsChange(5);
      result.current.handleCategoryOrderChange(["folder-2", "folder-1"]);
    });

    await waitFor(() => {
      expect(mockedStorage.set).toHaveBeenCalled();
    });

    expect(mockedStorage.set).toHaveBeenLastCalledWith("bookmarks_ui_v1", {
      categoryOrder: ["folder-2", "folder-1"],
      categoryLayout: "all",
      maxVisibleRows: 5,
      columnsPerRow: 3,
    });
  });
});


