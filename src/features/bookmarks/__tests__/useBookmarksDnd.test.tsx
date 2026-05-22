import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { moveBookmark } from "@/features/bookmarks/lib/chromeBookmarkEditor";
import { toast } from "@/shared/ui/primitives/use-toast";
import { useBookmarksDnd } from "@/features/bookmarks/model/useBookmarksDnd";
import { dndLinkId } from "@/shared/lib/dnd/dndUtils";
import type { Category } from "@/shared/types/category";

vi.mock("@/features/bookmarks/lib/chromeBookmarkEditor", () => ({
  moveBookmark: vi.fn(() => Promise.resolve()),
}));
vi.mock("@/shared/ui/primitives/use-toast", () => ({
  toast: vi.fn(),
}));

const mockedMoveBookmark = vi.mocked(moveBookmark);
const mockedToast = vi.mocked(toast);

const baseCategories = [
  {
    id: "cat-a",
    name: "Cat A",
    links: [
      { id: "link-1", title: "Link 1", url: "https://example.com/1" },
      { id: "link-2", title: "Link 2", url: "https://example.com/2" },
    ],
  },
  {
    id: "cat-b",
    name: "Cat B",
    links: [{ id: "link-3", title: "Link 3", url: "https://example.com/3" }],
  },
] satisfies Category[];

function setupHook(options = {}) {
  const categories = baseCategories.map((category) => ({
    ...category,
    links: category.links.map((link) => ({ ...link })),
  }));
  let currentCategories = categories;
  const setCategories = vi.fn((updater) => {
    currentCategories =
      typeof updater === "function" ? updater(currentCategories) : updater;
  });
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const setActiveCategoryId = vi.fn();
  const onCategoryReorder = vi.fn();

  const { result } = renderHook(() =>
    useBookmarksDnd({
      categories: currentCategories,
      setCategories,
      categoryById,
      setActiveCategoryId,
      onCategoryReorder,
      ...options,
    }),
  );

  return {
    result,
    setCategories,
    onCategoryReorder,
    setActiveCategoryId,
    getCategories: () => currentCategories,
  };
}

describe("useBookmarksDnd", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedMoveBookmark.mockResolvedValue(undefined);
  });

  it("calls onCategoryReorder when a category button is reordered", () => {
    const { result, onCategoryReorder } = setupHook();

    act(() => {
      result.current.onDragEnd({
        active: { id: "cat-a", data: { current: { type: "category-button" } } },
        over: { id: "cat-b" },
      } as const);
    });

    expect(onCategoryReorder).toHaveBeenCalledWith(["cat-b", "cat-a"]);
  });

  it("reorders links within the same category and calls moveBookmark", () => {
    const { result } = setupHook();
    const linkId = dndLinkId("link-1");

    act(() => {
      result.current.onDragStart({
        active: { id: linkId, data: { current: { type: "link" } } },
      } as const);
    });

    act(() => {
      result.current.onDragEnd({
        active: { id: linkId, data: { current: { type: "link" } } },
        over: { id: dndLinkId("link-2") },
      } as const);
    });

    expect(mockedMoveBookmark).toHaveBeenCalledWith("link-1", {
      parentId: "cat-a",
      index: expect.any(Number),
    });
  });

  it("moves links across categories, updates active category, and calls moveBookmark", () => {
    const { result, setActiveCategoryId } = setupHook();
    const linkId = dndLinkId("link-2");

    act(() => {
      result.current.onDragStart({
        active: { id: linkId, data: { current: { type: "link" } } },
      } as const);
    });

    act(() => {
      result.current.onDragEnd({
        active: { id: linkId, data: { current: { type: "link" } } },
        over: { id: dndLinkId("link-3") },
      } as const);
    });

    expect(setActiveCategoryId).toHaveBeenCalledWith("cat-b");
    expect(mockedMoveBookmark).toHaveBeenCalledWith("link-2", {
      parentId: "cat-b",
      index: expect.any(Number),
    });
  });

  it("switches dragOverZone during onDragOver", () => {
    const { result } = setupHook();
    act(() => {
      result.current.onDragOver({
        active: { id: "dummy", data: { current: {} } },
        over: { id: "cat-a", data: { current: { type: "category-button" } } },
      } as const);
    });
    expect(result.current.dragOverZone).toBe("category-bar");
  });

  it("rolls back and toasts when moveBookmark fails", async () => {
    mockedMoveBookmark.mockRejectedValueOnce(new Error("boom"));
    const { result } = setupHook();

    await act(async () => {
      result.current.onDragEnd({
        active: { id: dndLinkId("link-1"), data: { current: { type: "link" } } },
        over: { id: dndLinkId("link-2") },
      } as const);
    });

    expect(mockedToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "操作失败", variant: "destructive" }),
    );
  });
});


