import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { QuickEditBookmarkFolder } from "@/features/quick-edit/ui/quick-edit/QuickEditBookmarkFolder";
import type { Category } from "@/shared/types/category";
import type { SiteLink } from "@/shared/types/link";

vi.mock("@dnd-kit/core", () => ({
  useDraggable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: () => {},
    isDragging: false,
  }),
}));

const category: Category = {
  id: "dev",
  name: "开发",
  links: [{ id: "vite", title: "Vite Docs", url: "https://vite.dev" }],
};

describe("QuickEditBookmarkFolder", () => {
  it("wires quick-add, edit, and remove actions for bookmark items", () => {
    const onEdit = vi.fn();
    const onRemove = vi.fn();
    const onQuickAdd = vi.fn();

    render(
      <QuickEditBookmarkFolder
        category={category}
        expanded
        onToggle={() => {}}
        onEdit={onEdit}
        onRemove={onRemove}
        onQuickAdd={onQuickAdd}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "添加到导航" }));
    fireEvent.click(screen.getByRole("button", { name: "编辑" }));
    fireEvent.click(screen.getByRole("button", { name: "删除" }));

    expect(onQuickAdd).toHaveBeenCalledWith(category.links[0] as SiteLink);
    expect(onEdit).toHaveBeenCalledWith(category.links[0], "dev");
    expect(onRemove).toHaveBeenCalledWith("vite");
  });
});

