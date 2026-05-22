import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { QuickEditCreateCategoryRow } from "@/features/quick-edit/ui/quick-edit/QuickEditCreateCategoryRow";

describe("QuickEditCreateCategoryRow", () => {
  it("supports enter submit and escape cancel", () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    const onValueChange = vi.fn();

    render(
      <QuickEditCreateCategoryRow
        value="新分类"
        onValueChange={onValueChange}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />,
    );

    const input = screen.getByPlaceholderText("新分类名称");
    fireEvent.keyDown(input, { key: "Enter" });
    fireEvent.keyDown(input, { key: "Escape" });

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("disables submit button for blank value", () => {
    render(
      <QuickEditCreateCategoryRow
        value="   "
        onValueChange={() => {}}
        onSubmit={() => {}}
        onCancel={() => {}}
      />,
    );

    expect(screen.getByRole("button", { name: "添加" })).toBeDisabled();
  });
});
