import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useQuickEditBookmarkActions } from "@/features/quick-edit";
import {
  moveBookmark,
  removeBookmark,
  updateBookmark,
} from "@/features/bookmarks/lib/chromeBookmarkEditor";
import type { Category } from "@/shared/types/category";
import type { SiteLink } from "@/shared/types/link";

const toastMock = vi.fn();

vi.mock("@/shared/ui/primitives/use-toast", () => ({
  toast: (...args: Parameters<typeof toastMock>) => toastMock(...args),
}));

vi.mock("@/features/bookmarks/lib/chromeBookmarkEditor", () => ({
  moveBookmark: vi.fn(() => Promise.resolve()),
  removeBookmark: vi.fn(() => Promise.resolve()),
  updateBookmark: vi.fn(() => Promise.resolve()),
}));

const categories: Category[] = [
  { id: "folder-1", name: "开发", links: [] },
  { id: "folder-2", name: "学习", links: [] },
];

const originalBookmark: SiteLink = {
  id: "bookmark-1",
  title: "Docs",
  url: "https://docs.example.com",
};

describe("useQuickEditBookmarkActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates, moves, toasts, and refreshes after editing a bookmark", async () => {
    const refreshBookmarkOverview = vi.fn(() => Promise.resolve());
    const { result } = renderHook(() =>
      useQuickEditBookmarkActions({
        open: true,
        categories,
        onAddLink: vi.fn(),
        refreshBookmarkOverview,
      }),
    );

    act(() => {
      result.current.openEditBookmark(originalBookmark, "folder-1");
    });

    await act(async () => {
      await result.current.handleSaveBookmark(
        {
          ...originalBookmark,
          title: "Docs Updated",
          url: "https://docs-updated.example.com",
        },
        "folder-2",
      );
    });

    expect(updateBookmark).toHaveBeenCalledWith("bookmark-1", {
      title: "Docs Updated",
      url: "https://docs-updated.example.com",
    });
    expect(moveBookmark).toHaveBeenCalledWith("bookmark-1", { parentId: "folder-2" });
    expect(refreshBookmarkOverview).toHaveBeenCalled();
    expect(toastMock).toHaveBeenCalledWith({ title: "已保存" });
  });

  it("removes bookmarks and refreshes the overview", async () => {
    const refreshBookmarkOverview = vi.fn(() => Promise.resolve());
    const { result } = renderHook(() =>
      useQuickEditBookmarkActions({
        open: true,
        categories,
        onAddLink: vi.fn(),
        refreshBookmarkOverview,
      }),
    );

    await act(async () => {
      await result.current.handleRemoveBookmark("bookmark-1");
    });

    expect(removeBookmark).toHaveBeenCalledWith("bookmark-1");
    expect(refreshBookmarkOverview).toHaveBeenCalled();
    expect(toastMock).toHaveBeenCalledWith({ title: "已删除" });
  });

  it("skips move when the edited bookmark stays in the same folder", async () => {
    const refreshBookmarkOverview = vi.fn(() => Promise.resolve());
    const { result } = renderHook(() =>
      useQuickEditBookmarkActions({
        open: true,
        categories,
        onAddLink: vi.fn(),
        refreshBookmarkOverview,
      }),
    );

    act(() => {
      result.current.openEditBookmark(originalBookmark, "folder-1");
    });

    await act(async () => {
      await result.current.handleSaveBookmark(
        {
          ...originalBookmark,
          title: "Docs Updated",
        },
        "folder-1",
      );
    });

    expect(updateBookmark).toHaveBeenCalledWith("bookmark-1", { title: "Docs Updated" });
    expect(moveBookmark).not.toHaveBeenCalled();
    expect(refreshBookmarkOverview).toHaveBeenCalled();
  });
});


