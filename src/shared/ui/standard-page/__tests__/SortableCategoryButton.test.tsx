import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SortableCategoryButton } from "../SortableCategoryButton";

vi.mock("@dnd-kit/sortable", () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: () => undefined,
    transform: null,
    transition: undefined,
    isDragging: false,
  }),
}));

vi.mock("@dnd-kit/core", () => ({
  useDroppable: () => ({
    isOver: false,
    setNodeRef: () => undefined,
  }),
  useDndContext: () => ({
    active: null,
  }),
}));

describe("SortableCategoryButton", () => {
  it("uses card opacity for category button and count badge backgrounds", () => {
    render(
      <SortableCategoryButton
        id="dev"
        name="开发"
        count={3}
        isActive={false}
        onClick={() => undefined}
        layout="top"
      />,
    );

    const button = screen.getByRole("button", { name: /开发/ });
    expect(button).toHaveStyle({
      backgroundColor: "hsl(var(--secondary) / var(--app-category-button-opacity, 1))",
    });

    expect(screen.getByText("3")).toHaveStyle({
      backgroundColor: "hsl(var(--muted) / var(--app-category-button-opacity, 1))",
    });
  });
});
