import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useManualNavState } from "@/features/manual-nav";
import { RECENT_VISITS_CARD_SIZE_MIN } from "@/features/recent-visits";
import { storage } from "@/shared/browser/storage";
import type { ManualNavState } from "@/shared/types/manual-nav";

vi.mock("@/shared/lib/hooks/useDebounce", () => ({
  useDebouncedCallback: <T extends (...args: never[]) => unknown>(callback: T) => callback,
}));

vi.mock("@/shared/browser/storage", () => ({
  storage: {
    get: vi.fn(),
    set: vi.fn(() => Promise.resolve()),
  },
}));

vi.mock("@/shared/ui/primitives/use-toast", () => ({
  toast: vi.fn(),
}));

const mockedStorage = vi.mocked(storage);

const savedState: ManualNavState = {
  categories: [
    {
      id: "saved",
      name: "已保存",
      links: [{ id: "link-1", title: "Example", url: "https://example.com" }],
    },
  ],
  ui: {
    categoryLayout: "left",
    columnsPerRow: 2,
    recentVisitsCount: 4,
  },
};

describe("useManualNavState", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads saved state and merges missing UI defaults", async () => {
    mockedStorage.get.mockResolvedValueOnce(savedState);
    const setActiveCategoryId = vi.fn();

    const { result } = renderHook(() => useManualNavState({ setActiveCategoryId }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.state.categories[0]?.id).toBe("saved");
    expect(result.current.categoryLayout).toBe("left");
    expect(result.current.columnsPerRow).toBe(2);
    expect(result.current.showRecentVisits).toBe(true);
    expect(result.current.recentVisitsRows).toBe(1);
    expect(result.current.hiddenRecentVisitIds).toEqual([]);
    expect(setActiveCategoryId).toHaveBeenCalledWith("saved");
  });

  it("persists normalized UI settings after updates", async () => {
    mockedStorage.get.mockResolvedValueOnce(undefined);
    const setActiveCategoryId = vi.fn();

    const { result } = renderHook(() => useManualNavState({ setActiveCategoryId }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.state.categories).toEqual([
      {
        id: "quick",
        name: "常用",
        links: [
          { id: "github", title: "GitHub", url: "https://github.com" },
          { id: "weibo", title: "微博", url: "https://weibo.com" },
          { id: "xiaohongshu", title: "小红书", url: "https://www.xiaohongshu.com" },
          { id: "bilibili", title: "哔哩哔哩", url: "https://www.bilibili.com" },
        ],
      },
    ]);
    expect(result.current.categoryLayout).toBe("left");
    expect(result.current.columnsPerRow).toBe(6);
    expect(result.current.recentVisitsRows).toBe(1);
    expect(result.current.recentVisitsCardSize).toBe(RECENT_VISITS_CARD_SIZE_MIN);

    mockedStorage.set.mockClear();

    act(() => {
      result.current.handleCategoryLayoutChange("all");
      result.current.handleMaxVisibleRowsChange(4);
      result.current.handleColumnsPerRowChange(3);
      result.current.handleShowRecentVisitsChange(false);
      result.current.handleRecentVisitsRowsChange(1);
      result.current.handleRecentVisitsCardSizeChange(1);
      result.current.handleHideRecentVisit("https://openai.com");
    });

    await waitFor(() => {
      expect(mockedStorage.set).toHaveBeenCalled();
    });

    expect(mockedStorage.set).toHaveBeenLastCalledWith(
      "manual_nav_v1",
      expect.objectContaining({
        ui: expect.objectContaining({
          categoryLayout: "all",
          maxVisibleRows: 4,
          columnsPerRow: 3,
          showRecentVisits: false,
          recentVisitsRows: 1,
          recentVisitsCardSize: RECENT_VISITS_CARD_SIZE_MIN,
          hiddenRecentVisitIds: ["https://openai.com"],
        }),
      }),
    );
  });
});



