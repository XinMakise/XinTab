import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useBookmarkOverview } from "@/features/bookmarks/model/useBookmarkOverview";
import { getBookmarkOverview } from "@/features/bookmarks/lib/bookmarks";
import { hasChromeBookmarks } from "@/shared/browser/chrome";

vi.mock("@/features/bookmarks/lib/bookmarks", () => ({
  getBookmarkOverview: vi.fn(),
}));

vi.mock("@/shared/browser/chrome", () => ({
  hasChromeBookmarks: vi.fn(),
}));

const mockedGetBookmarkOverview = vi.mocked(getBookmarkOverview);
const mockedHasChromeBookmarks = vi.mocked(hasChromeBookmarks);

describe("useBookmarkOverview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads bookmark overview when enabled and Chrome bookmarks are available", async () => {
    mockedHasChromeBookmarks.mockReturnValue(true);
    mockedGetBookmarkOverview.mockResolvedValueOnce({
      categories: [
        { id: "dev", name: "开发", links: [{ id: "vite", title: "Vite", url: "https://vite.dev" }] },
      ],
    });

    const { result } = renderHook(() => useBookmarkOverview(true));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.categories).toHaveLength(1);
    });
  });

  it("recovers after a failed load when refresh succeeds later", async () => {
    mockedHasChromeBookmarks.mockReturnValue(true);
    mockedGetBookmarkOverview.mockRejectedValueOnce(new Error("boom"));

    const { result } = renderHook(() => useBookmarkOverview(true));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.categories).toEqual([]);
    });

    mockedGetBookmarkOverview.mockResolvedValueOnce({
      categories: [
        { id: "docs", name: "文档", links: [{ id: "mdn", title: "MDN", url: "https://developer.mozilla.org" }] },
      ],
    });

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.categories).toEqual([
      {
        id: "docs",
        name: "文档",
        links: [{ id: "mdn", title: "MDN", url: "https://developer.mozilla.org" }],
      },
    ]);
    expect(result.current.loading).toBe(false);
  });

  it("stays empty and skips loading when Chrome bookmarks are unavailable", async () => {
    mockedHasChromeBookmarks.mockReturnValue(false);

    const { result } = renderHook(() => useBookmarkOverview(true));

    await waitFor(() => {
      expect(result.current.chromeAvailable).toBe(false);
      expect(result.current.loading).toBe(false);
      expect(result.current.categories).toEqual([]);
    });

    expect(mockedGetBookmarkOverview).not.toHaveBeenCalled();
  });
});
