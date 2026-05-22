import { useState } from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SettingsSheet } from "@/features/settings/ui/SettingsSheet";
import type { ManualSettingsSheetModel } from "@/features/settings";
import { qeBookmarkLinkId, qeManualCategoryId } from "@/shared/lib/dnd/dndUtils";
import type { Category } from "@/shared/types/category";
import type { SiteLink } from "@/shared/types/link";

const bookmarkLink: SiteLink = {
  id: "bookmark-1",
  title: "Docs",
  url: "https://docs.example.com",
};

const { dragBookmarkIntoCategoryMock } = vi.hoisted(() => ({
  dragBookmarkIntoCategoryMock: vi.fn<() => void>(),
}));

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.mock("@/features/appearance/ui/AppearancePanel", () => ({
  AppearancePanel: () => null,
}));

vi.mock("@/features/manual-nav/ui/CategoryManagePanel", () => ({
  CategoryManagePanel: () => null,
}));

vi.mock("@/features/backup/ui/DataManagePanel", () => ({
  DataManagePanel: () => null,
}));

vi.mock("@/features/settings/ui/SearchSettingsPanel", () => ({
  SearchSettingsPanel: () => null,
}));

vi.mock("@/features/settings/ui/LayoutSettingsPanel", () => ({
  LayoutSettingsPanel: () => null,
}));

vi.mock("@/features/bookmarks/ui/BookmarksPanel", () => ({
  BookmarksLayoutPanel: () => null,
  BookmarksManagePanel: () => null,
}));

vi.mock("@/shared/ui/primitives/use-toast", () => ({
  toast: vi.fn(),
}));

vi.mock("@/features/bookmarks/model/useBookmarkOverview", () => ({
  useBookmarkOverview: () => ({
    categories: [
      {
        id: "bookmark-folder",
        name: "开发",
        links: [bookmarkLink],
      },
    ],
    loading: false,
    refresh: vi.fn(),
    chromeAvailable: true,
  }),
}));

vi.mock("@/features/quick-edit/model/useQuickEditBookmarkActions", () => ({
  useQuickEditBookmarkActions: () => ({
    editingBookmark: null,
    editingBookmarkCategoryId: "",
    openEditBookmark: vi.fn(),
    handleSaveBookmark: vi.fn(),
    handleRemoveBookmark: vi.fn(),
    handleQuickAddBookmark: vi.fn(),
    clearEditingBookmark: vi.fn(),
  }),
}));

vi.mock("@/features/quick-edit/model/useQuickEditDnd", async () => {
  const actual = await vi.importActual<typeof import("@/features/quick-edit/model/useQuickEditDnd")>(
    "@/features/quick-edit/model/useQuickEditDnd",
  );

  return {
    ...actual,
    useQuickEditDnd: (options: Parameters<typeof actual.useQuickEditDnd>[0]) => {
      const result = actual.useQuickEditDnd(options);
      dragBookmarkIntoCategoryMock.mockImplementation(() => {
        result.onDragEnd({
          active: {
            id: qeBookmarkLinkId(bookmarkLink.id),
            data: { current: { type: "bookmark-link", link: bookmarkLink } },
          },
          over: { id: qeManualCategoryId("cat-1") },
        } as never);
      });
      return result;
    },
  };
});

function QuickEditSettingsHarness() {
  const [categories, setCategories] = useState<Category[]>([
    { id: "cat-1", name: "常用", links: [] },
  ]);

  const model: ManualSettingsSheetModel = {
    kind: "manual",
    categoryManagement: {
      categories,
      onCreateCategory: () => {},
      onDeleteCategory: () => {},
      onAddLink: (categoryId, link) => {
        setCategories((prev) =>
          prev.map((category) =>
            category.id === categoryId
              ? { ...category, links: [...category.links, link] }
              : category,
          ),
        );
      },
      onRemoveLink: () => {},
      onUpdateLinkTitle: () => {},
      onMoveLink: () => {},
    },
    layout: {
      categoryLayout: "top",
      onCategoryLayoutChange: () => {},
      maxVisibleRows: 3,
      onMaxVisibleRowsChange: () => {},
      columnsPerRow: 5,
      onColumnsPerRowChange: () => {},
    },
    recentVisits: {
      showRecentVisits: true,
      onShowRecentVisitsChange: () => {},
      recentVisitsRows: 2,
      onRecentVisitsRowsChange: () => {},
      recentVisitsCardSize: 100,
      onRecentVisitsCardSizeChange: () => {},
    },
    appearance: {},
    dataManagement: {
      state: { categories },
      onImport: () => {},
    },
  };

  return (
    <SettingsSheet
      model={model}
      trigger={<button type="button">打开设置</button>}
    />
  );
}

describe("quick edit linkage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dragBookmarkIntoCategoryMock.mockReset();
    globalThis.ResizeObserver = ResizeObserverMock as typeof ResizeObserver;
    HTMLElement.prototype.hasPointerCapture = vi.fn(() => false);
    HTMLElement.prototype.setPointerCapture = vi.fn();
    HTMLElement.prototype.releasePointerCapture = vi.fn();
    HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  it("adds a dragged Chrome bookmark into the target manual category through SettingsSheet", async () => {
    render(<QuickEditSettingsHarness />);

    fireEvent.click(screen.getByRole("button", { name: "打开设置" }));
    fireEvent.click(await screen.findByRole("button", { name: "快速编辑" }));

    await waitFor(() => {
      expect(screen.getByText("我的导航")).toBeInTheDocument();
    });
    expect(screen.queryByText("Docs")).not.toBeInTheDocument();

    act(() => {
      dragBookmarkIntoCategoryMock();
    });

    await waitFor(() => {
      expect(screen.getByText("Docs")).toBeInTheDocument();
    });
  });
});

