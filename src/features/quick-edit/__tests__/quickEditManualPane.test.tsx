import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { QuickEditManualPane } from "@/features/quick-edit/ui/QuickEditManualPane";
import { qeManualCategoryId, qeNavLinkId } from "@/shared/lib/dnd/dndUtils";

const categories = [
  { id: "dev", name: "Development", links: [] },
  { id: "docs", name: "Documentation", links: [] },
];

const props = {
  categories,
  onAddLink: () => {},
  onRemoveLink: () => {},
  onCreateCategory: () => {},
  onDeleteCategory: () => {},
};

describe("QuickEditManualPane", () => {
  it("renders categories and search UI", () => {
    render(<QuickEditManualPane {...props} open />);

    expect(screen.getByPlaceholderText("搜索我的导航...")).toBeInTheDocument();
    expect(screen.getByText("Development")).toBeInTheDocument();
    expect(screen.getByText("Documentation")).toBeInTheDocument();
  });

  it("filters categories when typing", () => {
    render(<QuickEditManualPane {...props} open />);

    const input = screen.getByPlaceholderText("搜索我的导航...");
    fireEvent.change(input, { target: { value: "Dev" } });

    expect(screen.getByText("Development")).toBeVisible();
    expect(screen.queryByText("Documentation")).toBeNull();
  });

  it("toggles add-category input", () => {
    render(<QuickEditManualPane {...props} open />);

    const button = screen.getByRole("button", { name: "添加分类" });
    fireEvent.click(button);

    expect(screen.getByPlaceholderText("新分类名称")).toBeInTheDocument();
  });

  it("keeps bookmark drop indicators working while search filters categories", () => {
    render(
      <QuickEditManualPane
        categories={[
          {
            id: "dev",
            name: "Development",
            links: [
              { id: "vite", title: "Vite Docs", url: "https://vite.dev" },
              { id: "github", title: "GitHub", url: "https://github.com" },
            ],
          },
          {
            id: "docs",
            name: "Documentation",
            links: [{ id: "mdn", title: "MDN", url: "https://developer.mozilla.org" }],
          },
        ]}
        onAddLink={() => {}}
        onRemoveLink={() => {}}
        onCreateCategory={() => {}}
        onDeleteCategory={() => {}}
        bookmarkDropTargetId={qeNavLinkId("dev", "vite")}
        open
      />,
    );

    fireEvent.change(screen.getByPlaceholderText("搜索我的导航..."), {
      target: { value: "vite" },
    });

    expect(screen.getByText("Development")).toBeVisible();
    expect(screen.queryByText("Documentation")).toBeNull();
    expect(screen.getByText("Vite Docs")).toBeVisible();
    expect(screen.queryByText("GitHub")).toBeNull();
    expect(screen.getByTestId("qe-bookmark-drop-indicator-dev-vite")).toBeInTheDocument();
  });

  it("shows a tail drop indicator when dropping to the end of a category", () => {
    render(
      <QuickEditManualPane
        categories={[
          {
            id: "dev",
            name: "Development",
            links: [
              { id: "vite", title: "Vite Docs", url: "https://vite.dev" },
              { id: "github", title: "GitHub", url: "https://github.com" },
            ],
          },
        ]}
        onAddLink={() => {}}
        onRemoveLink={() => {}}
        onCreateCategory={() => {}}
        onDeleteCategory={() => {}}
        bookmarkDropTargetId={qeManualCategoryId("dev")}
        open
      />,
    );

    expect(screen.getByTestId("qe-bookmark-drop-indicator-tail-dev")).toBeInTheDocument();
  });
});
