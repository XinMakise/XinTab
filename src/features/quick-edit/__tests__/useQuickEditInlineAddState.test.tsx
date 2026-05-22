import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useQuickEditInlineAddState } from "@/features/quick-edit";

describe("useQuickEditInlineAddState", () => {
  it("normalizes url and derives title on submit", () => {
    const onAdd = vi.fn();
    vi.spyOn(crypto, "randomUUID").mockReturnValue("new-link-id");

    const { result } = renderHook(() =>
      useQuickEditInlineAddState({
        categoryId: "cat-1",
        onAdd,
      }),
    );

    act(() => {
      result.current.setValue("example.com/docs");
    });

    act(() => {
      result.current.submit();
    });

    expect(onAdd).toHaveBeenCalledWith("cat-1", {
      id: "new-link-id",
      title: "example.com/docs",
      url: "https://example.com/docs",
    });
    expect(result.current.value).toBe("");
  });

  it("ignores empty submit", () => {
    const onAdd = vi.fn();
    const { result } = renderHook(() =>
      useQuickEditInlineAddState({
        categoryId: "cat-1",
        onAdd,
      }),
    );

    act(() => {
      result.current.setValue("   ");
      result.current.submit();
    });

    expect(onAdd).not.toHaveBeenCalled();
  });
});
