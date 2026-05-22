import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useQuickEditNavLinkEditor } from "@/features/quick-edit";

const link = {
  id: "link-1",
  title: "Example",
  url: "https://example.com",
};

describe("useQuickEditNavLinkEditor", () => {
  it("submits trimmed title changes and exits editing", () => {
    const onUpdateTitle = vi.fn();
    const { result } = renderHook(() =>
      useQuickEditNavLinkEditor({
        link,
        categoryId: "cat-1",
        onUpdateTitle,
      }),
    );

    act(() => {
      result.current.startEdit();
    });

    act(() => {
      result.current.setEditValue("  Renamed  ");
    });

    act(() => {
      result.current.submitEdit();
    });

    expect(onUpdateTitle).toHaveBeenCalledWith("link-1", "cat-1", "Renamed");
    expect(result.current.editing).toBe(false);
  });

  it("restores original title when canceling edit", () => {
    const { result } = renderHook(() =>
      useQuickEditNavLinkEditor({
        link,
        categoryId: "cat-1",
      }),
    );

    act(() => {
      result.current.startEdit();
      result.current.setEditValue("Changed");
      result.current.cancelEdit();
    });

    expect(result.current.editValue).toBe("Example");
    expect(result.current.editing).toBe(false);
  });
});
