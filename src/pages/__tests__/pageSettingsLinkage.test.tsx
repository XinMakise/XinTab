import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { MemoryRouter } from "react-router-dom";
import HomePage from "@/pages/home/ui/Page";
import BookmarksPage from "@/pages/bookmarks/ui/Page";

const recentVisits = [
  {
    id: "visit-1",
    title: "OpenAI",
    url: "https://openai.com",
    origin: "https://openai.com",
    lastVisitedAt: 1,
  },
];

const manualNavState = {
  categories: [
    {
      id: "quick",
      name: "常用",
      links: [{ id: "github", title: "GitHub", url: "https://github.com" }],
    },
  ],
  ui: {
    categoryLayout: "top" as const,
    showRecentVisits: false,
    recentVisitsCount: 4,
    recentVisitsCardSize: 100,
  },
};

vi.mock("@/features/settings/ui/SettingsSheet", () => ({
  SettingsSheet: (props: {
    model:
      | {
          kind: "manual";
          recentVisits: { onShowRecentVisitsChange?: (checked: boolean) => void };
        }
      | {
          kind: "bookmarks";
          layout: { onBookmarksLayoutChange?: (layout: "top" | "left" | "all") => void };
        };
    trigger: React.ReactNode;
  }) => (
    <div>
      {props.trigger}
      {props.model.kind === "manual" && props.model.recentVisits.onShowRecentVisitsChange ? (
        <button
          type="button"
          onClick={() => props.model.recentVisits.onShowRecentVisitsChange?.(true)}
        >
          显示最近访问
        </button>
      ) : null}
      {props.model.kind === "bookmarks" && props.model.layout.onBookmarksLayoutChange ? (
        <button
          type="button"
          onClick={() => props.model.layout.onBookmarksLayoutChange?.("all")}
        >
          切换书签全布局
        </button>
      ) : null}
    </div>
  ),
}));

vi.mock("@/features/recent-visits/ui/RecentVisitsSection", () => ({
  RecentVisitsSection: ({ items }: { items: typeof recentVisits }) => (
    <div data-testid="recent-visits-section">
      {items.map((item) => item.title).join(",")}
    </div>
  ),
}));

vi.mock("@/features/manual-nav/model/useManualNavDnd", () => ({
  useManualNavDnd: () => ({
    sensors: [],
    customCollisionDetection: null,
    activeDragLink: null,
    activeDragCategory: null,
    dragSourceCategoryId: null,
    moveLink: vi.fn(),
    resolveDropCategoryId: () => null,
    onDragStart: () => {},
    onDragEnd: () => {},
    onDragOver: () => {},
    onDragCancel: () => {},
  }),
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

vi.mock("@/features/recent-visits/model/useRecentVisits", () => ({
  useRecentVisits: () => ({ recentVisits, historyAvailable: true }),
}));

vi.mock("@/shared/browser/storage", () => ({
  storage: {
    get: vi.fn((key: string) => {
      if (key === "manual_nav_v1") return Promise.resolve(manualNavState);
      if (key === "bookmarks_ui_v1") {
        return Promise.resolve({
          categoryLayout: "top",
          maxVisibleRows: 3,
          columnsPerRow: 5,
        });
      }
      return Promise.resolve(null);
    }),
    set: vi.fn(() => Promise.resolve()),
  },
}));

vi.mock("@/features/bookmarks/lib/bookmarks", () => ({
  getBookmarksByFolders: vi.fn(() =>
    Promise.resolve([
      {
        id: "root",
        name: "Root",
        links: [{ id: "link-1", title: "Example", url: "https://example.com" }],
      },
    ]),
  ),
  getBookmarksBarId: vi.fn(() => Promise.resolve("root")),
}));

describe("page settings linkage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates the Home page when settings toggle recent visits", async () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <HomePage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /设置/ })).toBeInTheDocument();
    });

    expect(screen.queryByTestId("recent-visits-section")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "显示最近访问" }));

    await waitFor(() => {
      expect(screen.getByTestId("recent-visits-section")).toHaveTextContent("OpenAI");
    });
  });

  it("updates the Bookmarks page when settings switch to all layout", async () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <BookmarksPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Root")).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: "添加分类" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "切换书签全布局" }));

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "添加分类" })).not.toBeInTheDocument();
    });
  });
});
