import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { QuickEditBookmarkPane } from "@/features/quick-edit/ui/QuickEditBookmarkPane";
import type { Category } from "@/shared/types/category";

const categories: Category[] = [
  {
    id: "dev",
    name: "开发",
    links: [
      { id: "vite", title: "Vite Docs", url: "https://vite.dev" },
      { id: "react", title: "React", url: "https://react.dev" },
    ],
  },
  {
    id: "docs",
    name: "文档",
    links: [{ id: "mdn", title: "MDN", url: "https://developer.mozilla.org" }],
  },
];

describe("QuickEditBookmarkPane", () => {
  it("shows unavailable and loading states", () => {
    const { rerender } = render(
      <QuickEditBookmarkPane
        categories={categories}
        loading={false}
        isAvailable={false}
      />,
    );

    expect(screen.getByText("Chrome 书签不可用")).toBeInTheDocument();

    rerender(
      <QuickEditBookmarkPane
        categories={categories}
        loading
        isAvailable
      />,
    );

    expect(screen.getByText("加载书签中...")).toBeInTheDocument();
  });

  it("filters bookmark folders and resets search after close and reopen", () => {
    const { rerender } = render(
      <QuickEditBookmarkPane
        categories={categories}
        loading={false}
        isAvailable
        open
      />,
    );

    const input = screen.getByPlaceholderText("搜索书签...");
    fireEvent.change(input, { target: { value: "vite" } });

    expect(screen.getByText("开发")).toBeInTheDocument();
    expect(screen.queryByText("文档")).toBeNull();

    rerender(
      <QuickEditBookmarkPane
        categories={categories}
        loading={false}
        isAvailable
        open={false}
      />,
    );
    rerender(
      <QuickEditBookmarkPane
        categories={categories}
        loading={false}
        isAvailable
        open
      />,
    );

    expect(screen.getByPlaceholderText("搜索书签...")).toHaveValue("");
  });
});

