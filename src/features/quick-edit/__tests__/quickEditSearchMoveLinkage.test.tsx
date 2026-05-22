import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { QuickEditManualPane } from "@/features/quick-edit/ui/QuickEditManualPane";
import { useQuickEditDnd } from "@/features/quick-edit";
import { moveLinkBetweenCategories } from "@/shared/lib/dnd/dndMove";
import { qeNavLinkId } from "@/shared/lib/dnd/dndUtils";
import type { Category } from "@/shared/types/category";

function QuickEditSearchMoveHarness() {
  const [categories, setCategories] = useState<Category[]>([
    {
      id: "cat-a",
      name: "Docs A",
      links: [
        { id: "link-1", title: "Alpha", url: "https://alpha.example" },
        { id: "link-2", title: "Bravo", url: "https://bravo.example" },
      ],
    },
    {
      id: "cat-b",
      name: "Docs B",
      links: [{ id: "link-3", title: "Target", url: "https://target.example" }],
    },
  ]);

  const { onDragEnd } = useQuickEditDnd({
    categories,
    onAddLink: vi.fn(),
    onMoveLink: (linkId, fromCategoryId, toCategoryId, toIndex) => {
      setCategories((prev) => {
        const link = prev
          .find((category) => category.id === fromCategoryId)
          ?.links.find((item) => item.id === linkId);
        if (!link) return prev;
        return moveLinkBetweenCategories(prev, link, fromCategoryId, toCategoryId, toIndex);
      });
    },
  });

  return (
    <>
      <div data-testid="summary">
        {categories
          .map((category) => `${category.id}:${category.links.map((link) => link.id).join(",")}`)
          .join("|")}
      </div>
      <QuickEditManualPane
        categories={categories}
        onAddLink={() => {}}
        onRemoveLink={() => {}}
        onCreateCategory={() => {}}
        onDeleteCategory={() => {}}
        open
      />
      <button
        type="button"
        onClick={() =>
          onDragEnd({
            active: {
              id: qeNavLinkId("cat-a", "link-1"),
              data: { current: { type: "nav-link" } },
            },
            over: {
              id: qeNavLinkId("cat-b", "link-3"),
            },
          } as never)
        }
      >
        执行跨分类移动
      </button>
    </>
  );
}

describe("quick edit search + move linkage", () => {
  it("keeps cross-category nav moves working while manual search is active", async () => {
    render(<QuickEditSearchMoveHarness />);

    fireEvent.change(screen.getByPlaceholderText("搜索我的导航..."), {
      target: { value: "docs" },
    });

    expect(screen.getByText("Docs A")).toBeInTheDocument();
    expect(screen.getByText("Docs B")).toBeInTheDocument();
    expect(screen.getByTestId("summary")).toHaveTextContent("cat-a:link-1,link-2|cat-b:link-3");

    fireEvent.click(screen.getByRole("button", { name: "执行跨分类移动" }));

    await waitFor(() => {
      expect(screen.getByTestId("summary")).toHaveTextContent("cat-a:link-2|cat-b:link-1,link-3");
    });
  });
});

