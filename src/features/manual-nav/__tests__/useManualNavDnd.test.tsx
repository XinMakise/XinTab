import { useMemo, useState } from "react";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useManualNavDnd } from "@/features/manual-nav/model/useManualNavDnd";
import type { ManualNavState } from "@/shared/types/manual-nav";

const initialState: ManualNavState = {
  categories: [
    {
      id: "cat-a",
      name: "Cat A",
      links: [
        { id: "link-1", title: "Link 1", url: "https://one.example" },
        { id: "link-2", title: "Link 2", url: "https://two.example" },
      ],
    },
    {
      id: "cat-b",
      name: "Cat B",
      links: [{ id: "link-3", title: "Link 3", url: "https://three.example" }],
    },
  ],
};

const makeHook = (stateOverride?: ManualNavState, activeId?: string) => {
  const { result } = renderHook(() => {
    const [state, setState] = useState(stateOverride ?? initialState);
    const [activeCategoryId, setActiveCategoryId] = useState(activeId ?? (stateOverride ?? initialState).categories[0].id);
    const categoryById = useMemo(() => {
      const map = new Map<string, typeof state.categories[0]>();
      for (const category of state.categories) {
        map.set(category.id, category);
      }
      return map;
    }, [state]);

    const hook = useManualNavDnd({
      state,
      setState,
      categoryById,
      setActiveCategoryId,
    });

    return { hook, state, setState, activeCategoryId };
  });
  return result;
};

describe("useManualNavDnd", () => {
  it("reorders categories when dragging category button", () => {
    const result = makeHook();
    act(() => {
      result.current.hook.onDragStart({
        active: { id: "cat-a", data: { current: { type: "category-button" } } },
      } as never);
      result.current.hook.onDragEnd({
        active: { id: "cat-a", data: { current: { type: "category-button" } } },
        over: { id: "cat-b", data: { current: { type: "category-button" } } },
      } as never);
    });
    expect(result.current.state.categories.map((c) => c.id)).toEqual(["cat-b", "cat-a"]);
  });

  it("reorders links within the same category", () => {
    const result = makeHook();
    act(() => {
      result.current.hook.onDragEnd({
        active: { id: "link:link-1", data: { current: { type: "nav-link" } } },
        over: { id: "link:link-2", data: { current: { type: "nav-link" } } },
      } as never);
    });
    expect(result.current.state.categories[0].links.map((l) => l.id)).toEqual([
      "link-2",
      "link-1",
    ]);
  });

  it("moves link across categories and updates active category", () => {
    const result = makeHook();
    act(() => {
      result.current.hook.onDragEnd({
        active: { id: "link:link-1", data: { current: { type: "nav-link" } } },
        over: { id: "link:link-3", data: { current: { type: "nav-link" } } },
      } as never);
    });
    expect(result.current.state.categories[1].links.some((link) => link.id === "link-1")).toBe(
      true,
    );
    expect(result.current.activeCategoryId).toBe("cat-b");
  });

  it("switches dragOverZone when dragging over category button", () => {
    const result = makeHook();
    act(() => {
      result.current.hook.onDragOver({
        active: { id: "link:link-1", data: { current: { type: "nav-link" } } },
        over: { data: { current: { type: "category-button" } }, id: "cat-b" },
      } as never);
    });
    expect(result.current.hook.dragOverZone).toBe("category-bar");
  });

  it("clears drag state on cancel", () => {
    const result = makeHook();
    act(() => {
      result.current.hook.onDragStart({
        active: { id: "link:link-1", data: { current: { type: "nav-link" } } },
      } as never);
      result.current.hook.onDragCancel();
    });
    expect(result.current.hook.activeDragLink).toBeNull();
    expect(result.current.hook.activeDragCategory).toBeNull();
    expect(result.current.hook.dragSourceCategoryId).toBeNull();
  });
});

