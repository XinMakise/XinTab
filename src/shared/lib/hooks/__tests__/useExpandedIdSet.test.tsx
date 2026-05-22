import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useExpandedIdSet } from "@/shared/lib/hooks/useExpandedIdSet";

describe("useExpandedIdSet", () => {
  it("keeps collapsed items collapsed and auto-expands new ids when enabled", () => {
    const { result, rerender } = renderHook(
      ({ ids }) =>
        useExpandedIdSet(ids, { defaultExpanded: true, expandNewIds: true }),
      {
        initialProps: { ids: ["a", "b"] },
      },
    );

    act(() => {
      result.current.toggleExpandedId("a");
    });

    rerender({ ids: ["a", "b", "c"] });

    expect(result.current.expandedIds.has("a")).toBe(false);
    expect(result.current.expandedIds.has("b")).toBe(true);
    expect(result.current.expandedIds.has("c")).toBe(true);
  });

  it("prunes removed ids and keeps new ids collapsed by default", () => {
    const { result, rerender } = renderHook(
      ({ ids }) => useExpandedIdSet(ids),
      {
        initialProps: { ids: ["a", "b"] },
      },
    );

    act(() => {
      result.current.toggleExpandedId("b");
    });

    rerender({ ids: ["b", "c"] });

    expect(result.current.expandedIds.has("a")).toBe(false);
    expect(result.current.expandedIds.has("b")).toBe(true);
    expect(result.current.expandedIds.has("c")).toBe(false);
  });
});
