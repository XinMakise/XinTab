import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { QuickEditSortableNavLink } from "@/features/quick-edit/ui/quick-edit/QuickEditSortableNavLink";

vi.mock("@dnd-kit/sortable", () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: () => {},
    transform: null,
    transition: undefined,
    isDragging: false,
  }),
  SortableContext: ({ children }: { children: React.ReactNode }) => children,
  verticalListSortingStrategy: {},
}));

const link = {
  id: "link-1",
  title: "Example",
  url: "https://example.com",
};

describe("QuickEditSortableNavLink", () => {
  it("supports inline title editing", () => {
    const onUpdateTitle = vi.fn();

    render(
      <QuickEditSortableNavLink
        link={link}
        categoryId="dev"
        onRemove={() => {}}
        onUpdateTitle={onUpdateTitle}
      />,
    );

    fireEvent.doubleClick(screen.getByText("Example"));

    const input = screen.getByDisplayValue("Example");
    fireEvent.change(input, { target: { value: "Renamed" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onUpdateTitle).toHaveBeenCalledWith("link-1", "dev", "Renamed");
  });

  it("shows drop indicator and forwards remove action", () => {
    const onRemove = vi.fn();

    render(
      <QuickEditSortableNavLink
        link={link}
        categoryId="dev"
        onRemove={onRemove}
        isBookmarkDropTarget
      />,
    );

    expect(screen.getByTestId("qe-bookmark-drop-indicator-dev-link-1")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button"));
    expect(onRemove).toHaveBeenCalled();
  });
});
