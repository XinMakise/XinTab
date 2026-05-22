import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { QuickEditInlineQuickAdd } from "@/features/quick-edit/ui/quick-edit/QuickEditInlineQuickAdd";

describe("QuickEditInlineQuickAdd", () => {
  it("normalizes url and adds a link on Enter", () => {
    const onAdd = vi.fn();
    vi.spyOn(crypto, "randomUUID").mockReturnValue("new-link-id");

    render(
      <QuickEditInlineQuickAdd
        categoryId="dev"
        onAdd={onAdd}
      />,
    );

    const input = screen.getByPlaceholderText("粘贴 URL 回车快速添加…");
    fireEvent.change(input, { target: { value: "example.com/docs" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onAdd).toHaveBeenCalledWith("dev", {
      id: "new-link-id",
      title: "example.com/docs",
      url: "https://example.com/docs",
    });
  });
});
