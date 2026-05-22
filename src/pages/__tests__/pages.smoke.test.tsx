import { act, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, vi } from "vitest";

import { MemoryRouter } from "react-router-dom";
import { dndContainerId, recentVisitLinkId } from "@/shared/lib/dnd/dndUtils";
import HomePage from "@/pages/home/ui/Page";
import BookmarksPage from "@/pages/bookmarks/ui/Page";

const {
  useRecentVisitsMock,
  storageGetMock,
  storageSetMock,
  getBookmarksByFoldersMock,
  dragRecentVisitIntoCategoryMock,
} = vi.hoisted(() => ({
  useRecentVisitsMock: vi.fn(),
  storageGetMock: vi.fn(),
  storageSetMock: vi.fn(() => Promise.resolve()),
  getBookmarksByFoldersMock: vi.fn(),
  dragRecentVisitIntoCategoryMock: vi.fn<() => void>(),
}));

const manualNavState = {
  categories: [
    {
      id: "quick",
      name: "常用",
      links: [{ id: "github", title: "GitHub", url: "https://github.com" }],
    },
    {
      id: "dev",
      name: "开发",
      links: [{ id: "vite", title: "Vite", url: "https://vite.dev" }],
    },
  ],
  ui: {
    categoryLayout: "top",
    showRecentVisits: true,
    recentVisitsCount: 4,
    recentVisitsCardSize: 100,
  },
};

const recentVisit = {
  id: "visit-1",
  title: "OpenAI",
  url: "https://openai.com",
  origin: "https://openai.com",
  lastVisitedAt: Date.now(),
};

vi.mock("@/features/manual-nav/model/useManualNavDnd", () => ({
  useManualNavDnd: () => ({
    sensors: [],
    customCollisionDetection: null,
    activeDragLink: null,
    activeDragCategory: null,
    dragSourceCategoryId: null,
    moveLink: vi.fn(),
    resolveDropCategoryId: (overId: string | null | undefined) =>
      typeof overId === "string" && overId.startsWith("cat:") ? overId.slice(4) : null,
    onDragStart: () => {},
    onDragEnd: () => {},
    onDragOver: () => {},
    onDragCancel: () => {},
  }),
}));

vi.mock("@/features/manual-nav/model/useManualNavDragSession", async () => {
  const actual = await vi.importActual<typeof import("@/features/manual-nav/model/useManualNavDragSession")>(
    "@/features/manual-nav/model/useManualNavDragSession",
  );

  return {
    ...actual,
    useManualNavDragSession: (options: Parameters<typeof actual.useManualNavDragSession>[0]) => {
      const result = actual.useManualNavDragSession(options);
      dragRecentVisitIntoCategoryMock.mockImplementation(() => {
        result.handleDragEnd({
          active: { id: recentVisitLinkId(recentVisit.id) },
          over: { id: dndContainerId("dev") },
        } as never);
      });
      return result;
    },
  };
});

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

vi.mock("@/features/recent-visits/model/useRecentVisits", () => ({
  useRecentVisits: (...args: unknown[]) => useRecentVisitsMock(...args),
}));

vi.mock("@/shared/browser/storage", () => ({
  storage: {
    get: storageGetMock,
    set: storageSetMock,
  },
}));

vi.mock("@/features/bookmarks/lib/bookmarks", () => ({
  getBookmarksByFolders: getBookmarksByFoldersMock,
  getBookmarksBarId: vi.fn(() => Promise.resolve("root")),
}));

vi.mock("@/features/recent-visits/ui/RecentVisitsSection", () => ({
  RecentVisitsSection: ({ items }: { items: Array<{ id: string }> }) => (
    <div data-testid="recent-visits-section">{items.length}</div>
  ),
}));

vi.mock("@/features/settings/ui/SearchSettingsPanel", () => ({
  SearchSettingsPanel: ({
    onShowRecentVisitsChange,
  }: {
    onShowRecentVisitsChange?: (checked: boolean) => void;
  }) => (
    <button type="button" onClick={() => onShowRecentVisitsChange?.(false)}>
      隐藏最近访问
    </button>
  ),
}));

vi.mock("@/features/manual-nav/ui/CategoryManagePanel", () => ({
  CategoryManagePanel: () => <div>分类管理占位</div>,
}));

vi.mock("@/features/appearance/ui/AppearancePanel", () => ({
  AppearancePanel: () => <div>外观设置占位</div>,
}));

vi.mock("@/features/settings/ui/LayoutSettingsPanel", () => ({
  LayoutSettingsPanel: ({
    onLayoutChange,
  }: {
    onLayoutChange?: (layout: "top" | "left" | "all") => void;
  }) => (
    <button type="button" onClick={() => onLayoutChange?.("all")}>
      切换收藏页为全部分类纵向
    </button>
  ),
}));

vi.mock("@/features/bookmarks/ui/BookmarksPanel", () => ({
  BookmarksLayoutPanel: ({
    onBookmarksLayoutChange,
  }: {
    onBookmarksLayoutChange?: (layout: "top" | "left" | "all") => void;
  }) => (
    <button type="button" onClick={() => onBookmarksLayoutChange?.("all")}>
      切换收藏页为全部分类纵向
    </button>
  ),
  BookmarksManagePanel: () => <div>收藏管理占位</div>,
}));

describe("Smoke tests for pages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useRecentVisitsMock.mockReturnValue({ recentVisits: [], historyAvailable: false });
    storageGetMock.mockImplementation(async (key: string) => {
      if (key === "manual_nav_v1") return manualNavState;
      if (key === "bookmarks_ui_v1") return undefined;
      return undefined;
    });
    getBookmarksByFoldersMock.mockResolvedValue([
      {
        id: "root",
        name: "Root",
        links: [{ id: "link-1", title: "Example", url: "https://example.com" }],
      },
    ]);
    dragRecentVisitIntoCategoryMock.mockReset();
  });

  it("renders the Home page without crashing", async () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <HomePage />
      </MemoryRouter>,
    );
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /设置/ })).toBeInTheDocument();
    });
    expect(screen.getByText("常用")).toBeInTheDocument();
  });

  it("renders the Bookmarks page shell", async () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <BookmarksPage />
      </MemoryRouter>,
    );
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "收藏页" })).toBeInTheDocument();
    });
    expect(screen.getByText("Root")).toBeInTheDocument();
  });

  it("adds a recent visit into the target homepage category after drag end", async () => {
    useRecentVisitsMock.mockReturnValue({
      recentVisits: [recentVisit],
      historyAvailable: true,
    });

    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <HomePage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("recent-visits-section")).toBeInTheDocument();
    });

    act(() => {
      dragRecentVisitIntoCategoryMock();
    });

    await waitFor(() => {
      expect(screen.getByText("OpenAI")).toBeInTheDocument();
    });
  });

});
