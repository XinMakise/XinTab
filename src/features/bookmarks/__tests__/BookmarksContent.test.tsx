import type { ComponentProps } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { BookmarksContent } from "@/features/bookmarks/ui/BookmarksContent";
import type { Category } from "@/shared/types/category";

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
    name: "开发",
    links: [
      { id: "1", title: "GitHub", url: "https://github.com" },
      { id: "2", title: "Vite", url: "https://vite.dev" },
      { id: "3", title: "MDN", url: "https://developer.mozilla.org" },
    ],
  },
];

function createModel(
  overrides: Partial<ComponentProps<typeof BookmarksContent>["model"]> = {},
): ComponentProps<typeof BookmarksContent>["model"] {
  return {
    status: {
      error: null,
      loading: false,
      ...overrides.status,
    },
    content: {
      view: {
        mode: "top",
        categories,
        activeCategory: categories[0],
        columnsPerRow: 1,
        maxVisibleRows: 1,
        expandedCategories: new Set(),
        editingCategoryId: null,
        emptyHint: "请选择一个分类",
      },
      actions: {
        onToggleExpanded: vi.fn(),
        onStartEditCategory: vi.fn(),
        onRenameCategory: vi.fn(),
        onRemoveLink: vi.fn(),
        onEditLink: vi.fn(),
        onAddLink: vi.fn(),
      },
      ...overrides.content,
      view: {
        mode: "top",
        categories,
        activeCategory: categories[0],
        columnsPerRow: 1,
        maxVisibleRows: 1,
        expandedCategories: new Set(),
        editingCategoryId: null,
        emptyHint: "请选择一个分类",
        ...overrides.content?.view,
      },
      actions: {
        onToggleExpanded: vi.fn(),
        onStartEditCategory: vi.fn(),
        onRenameCategory: vi.fn(),
        onRemoveLink: vi.fn(),
        onEditLink: vi.fn(),
        onAddLink: vi.fn(),
        ...overrides.content?.actions,
      },
    },
  };
}

function renderComponent(overrides: Partial<ComponentProps<typeof BookmarksContent>["model"]> = {}) {
  return render(<BookmarksContent model={createModel(overrides)} />);
}

describe("BookmarksContent", () => {
  it("renders error branch", () => {
    renderComponent({ status: { error: "bookmarks unavailable", loading: false } });

    expect(screen.getByText("当前环境无法读取 Chrome 书签")).toBeInTheDocument();
    expect(screen.getByText("bookmarks unavailable")).toBeInTheDocument();
  });

  it("renders loading branch", () => {
    renderComponent({ status: { error: null, loading: true } });

    expect(screen.getByText("正在读取书签…")).toBeInTheDocument();
  });

  it("renders all-layout sections with show more button", () => {
    renderComponent({
      content: {
        view: {
          mode: "all",
          categories,
          activeCategory: categories[0],
          columnsPerRow: 1,
          maxVisibleRows: 1,
          expandedCategories: new Set(),
          editingCategoryId: null,
          emptyHint: "请选择一个分类",
        },
      },
    });

    expect(screen.getByText("开发")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /查看更多/ })).toBeInTheDocument();
  });

  it("shows empty state when no active category exists", () => {
    renderComponent({
      content: {
        view: {
          mode: "top",
          categories,
          activeCategory: undefined,
          columnsPerRow: 1,
          maxVisibleRows: 1,
          expandedCategories: new Set(),
          editingCategoryId: null,
          emptyHint: "请选择一个分类",
        },
      },
    });

    expect(screen.getByText("请选择一个分类")).toBeInTheDocument();
  });
});

