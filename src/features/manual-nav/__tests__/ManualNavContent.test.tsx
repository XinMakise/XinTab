import type { ComponentProps } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ManualNavContent } from "@/features/manual-nav/ui/ManualNavContent";
import type { Category } from "@/shared/types/category";
import type { RecentVisitItem } from "@/shared/types/recent-visit";

vi.mock("@/features/recent-visits/ui/RecentVisitsSection", () => ({
  RecentVisitsSection: ({
    items,
    rows,
    cardSize,
    onRemoveItem,
  }: {
    items: RecentVisitItem[];
    rows?: number;
    cardSize?: number;
    onRemoveItem?: (itemId: string) => void;
  }) => (
    <div data-testid="recent-visits-section">{`${items.length}-${rows}-${cardSize}-${typeof onRemoveItem}`}</div>
  ),
}));

vi.mock("@/features/manual-nav/ui/ManualNavCategoryBar", () => ({
  ManualNavCategoryBar: () => <div data-testid="manual-nav-category-bar">category-bar</div>,
}));

vi.mock("@/shared/ui/standard-page/CategoryLinksPanel", () => ({
  CategoryLinksPanel: ({ categoryId }: { categoryId: string }) => (
    <div data-testid="category-links-panel">{categoryId}</div>
  ),
}));

vi.mock("@/shared/ui/standard-page/EditableCategoryHeader", () => ({
  EditableCategoryHeader: ({ name }: { name: string }) => <div>{name}</div>,
}));

const categories: Category[] = [
  {
    id: "cat-a",
    name: "常用",
    links: [
      { id: "1", title: "GitHub", url: "https://github.com" },
      { id: "2", title: "MDN", url: "https://developer.mozilla.org" },
      { id: "3", title: "Vite", url: "https://vite.dev" },
    ],
  },
];

const recentVisits: RecentVisitItem[] = [
  {
    id: "visit-1",
    title: "OpenAI",
    url: "https://openai.com",
    origin: "https://openai.com",
    lastVisitedAt: Date.now(),
  },
];

function createModel(
  overrides: Partial<ComponentProps<typeof ManualNavContent>["model"]> = {},
): ComponentProps<typeof ManualNavContent>["model"] {
  return {
    view: {
      recentVisits: {
        historyAvailable: true,
        show: true,
        items: recentVisits,
        rows: 2,
        cardSize: 110,
      },
      categoryBar: {
        zoneId: "category-bar-zone",
        containerRef: { current: null },
        navRef: { current: null },
        categories,
        layout: "top",
        activeCategoryId: "cat-a",
        dragSourceCategoryId: null,
        editingCategoryId: null,
        addCategoryDialogOpen: false,
        newCategoryName: "",
      },
      content: {
        mode: "top",
        categories,
        activeCategory: categories[0],
        columnsPerRow: 1,
        maxVisibleRows: 1,
        expandedCategories: new Set(),
        editingCategoryId: null,
        emptyHint: "暂无内容",
      },
      ...overrides.view,
    },
    actions: {
      recentVisits: {
        onRemoveRecentVisit: vi.fn(),
        ...overrides.actions?.recentVisits,
      },
      categoryBar: {
        onSelectCategory: vi.fn(),
        onStartEditCategory: vi.fn(),
        onRenameCategory: vi.fn(),
        onAddCategoryDialogOpenChange: vi.fn(),
        onNewCategoryNameChange: vi.fn(),
        onSubmitNewCategory: vi.fn(),
        ...overrides.actions?.categoryBar,
      },
      content: {
        onToggleExpanded: vi.fn(),
        onRemoveLink: vi.fn(),
        onEditLink: vi.fn(),
        onAddLink: vi.fn(),
        onStartEditCategory: vi.fn(),
        onRenameCategory: vi.fn(),
        ...overrides.actions?.content,
      },
    },
  };
}

function renderComponent(overrides: Partial<ComponentProps<typeof ManualNavContent>["model"]> = {}) {
  return render(<ManualNavContent model={createModel(overrides)} />);
}

describe("ManualNavContent", () => {
  it("renders recent visits when enabled and data exists", () => {
    renderComponent();

    expect(screen.getByTestId("recent-visits-section")).toHaveTextContent("1-2-110-function");
  });

  it("renders all-layout sections with show more button", () => {
    renderComponent({
      view: {
        content: {
          mode: "all",
          categories,
          activeCategory: categories[0],
          columnsPerRow: 1,
          maxVisibleRows: 1,
          expandedCategories: new Set(),
          editingCategoryId: null,
          emptyHint: "暂无内容",
        },
      },
    });

    expect(screen.getByText("常用")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /查看更多/ })).toBeInTheDocument();
  });

  it("renders category bar and active category panel for non-all layouts", () => {
    renderComponent({
      view: {
        categoryBar: {
          zoneId: "category-bar-zone",
          containerRef: { current: null },
          navRef: { current: null },
          categories,
          layout: "left",
          activeCategoryId: "cat-a",
          dragSourceCategoryId: null,
          editingCategoryId: null,
          addCategoryDialogOpen: false,
          newCategoryName: "",
        },
        content: {
          mode: "left",
          categories,
          activeCategory: categories[0],
          columnsPerRow: 1,
          maxVisibleRows: 1,
          expandedCategories: new Set(),
          editingCategoryId: null,
          emptyHint: "暂无内容",
        },
      },
    });

    expect(screen.getByTestId("manual-nav-category-bar")).toBeInTheDocument();
    expect(screen.getByTestId("category-links-panel")).toHaveTextContent("cat-a");
  });

  it("shows empty state when no active category is selected", () => {
    renderComponent({
      view: {
        content: {
          mode: "top",
          categories,
          activeCategory: undefined,
          columnsPerRow: 1,
          maxVisibleRows: 1,
          expandedCategories: new Set(),
          editingCategoryId: null,
          emptyHint: "暂无内容",
        },
      },
    });

    expect(screen.getByText("暂无内容")).toBeInTheDocument();
  });
});

