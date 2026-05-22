import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useDndLifecycleState } from "@/shared/lib/hooks/useDndLifecycleState";

describe("useDndLifecycleState", () => {
  it("tracks active drag item, source category, and last over id", () => {
    const { result } = renderHook(() => useDndLifecycleState<{ id: string }>());

    act(() => {
      result.current.beginDrag({ id: "link-1" }, "cat-a");
      result.current.rememberOverId("cat-b");
    });

    expect(result.current.activeDragItem).toEqual({ id: "link-1" });
    expect(result.current.dragSourceCategoryId).toBe("cat-a");
    expect(result.current.lastOverIdRef.current).toBe("cat-b");
  });

  it("clears all transient lifecycle state on reset", () => {
    const { result } = renderHook(() => useDndLifecycleState<{ id: string }>());

    act(() => {
      result.current.beginDrag({ id: "link-1" }, "cat-a");
      result.current.rememberOverId("cat-b");
      result.current.resetDragLifecycle();
    });

    expect(result.current.activeDragItem).toBeNull();
    expect(result.current.dragSourceCategoryId).toBeNull();
    expect(result.current.lastOverIdRef.current).toBeNull();
  });
});
