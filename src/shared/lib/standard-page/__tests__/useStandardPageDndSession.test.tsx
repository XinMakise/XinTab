import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useStandardPageDndSession } from "@/shared/lib/standard-page/useStandardPageDndSession";
import type { Category } from "@/shared/types/category";

const categories: Category[] = [
  {
    id: "cat-a",
    name: "Cat A",
    links: [{ id: "link-1", title: "Link 1", url: "https://example.com/1" }],
  },
  {
    id: "cat-b",
    name: "Cat B",
    links: [{ id: "link-2", title: "Link 2", url: "https://example.com/2" }],
  },
];

describe("useStandardPageDndSession", () => {
  it("tracks dragged category buttons", () => {
    const categoryById = new Map(categories.map((category) => [category.id, category]));
    const { result } = renderHook(() =>
      useStandardPageDndSession({ categories, categoryById }),
    );

    act(() => {
      result.current.handleDragStart({
        active: { id: "cat-a", data: { current: { type: "category-button" } } },
      } as never);
    });

    expect(result.current.activeDragCategory?.id).toBe("cat-a");
    expect(result.current.activeDragLink).toBeNull();
  });

  it("tracks dragged links and source category", () => {
    const categoryById = new Map(categories.map((category) => [category.id, category]));
    const { result } = renderHook(() =>
      useStandardPageDndSession({ categories, categoryById }),
    );

    act(() => {
      result.current.handleDragStart({
        active: { id: "link:link-1", data: { current: { type: "nav-link" } } },
      } as never);
    });

    expect(result.current.activeDragLink?.id).toBe("link-1");
    expect(result.current.dragSourceCategoryId).toBe("cat-a");
  });

  it("updates dragOverZone and resets all transient state", () => {
    const categoryById = new Map(categories.map((category) => [category.id, category]));
    const { result } = renderHook(() =>
      useStandardPageDndSession({ categories, categoryById }),
    );

    act(() => {
      result.current.handleDragStart({
        active: { id: "link:link-1", data: { current: { type: "nav-link" } } },
      } as never);
      result.current.handleDragOver({
        active: { id: "link:link-1", data: { current: { type: "nav-link" } } },
        over: { id: "cat-b", data: { current: { type: "category-button" } } },
      } as never);
    });

    expect(result.current.dragOverZone).toBe("category-bar");
    expect(result.current.lastOverIdRef.current).toBe("cat-b");

    act(() => {
      result.current.resetDragState();
    });

    expect(result.current.dragOverZone).toBe("card-grid");
    expect(result.current.activeDragLink).toBeNull();
    expect(result.current.activeDragCategory).toBeNull();
    expect(result.current.dragSourceCategoryId).toBeNull();
    expect(result.current.lastOverIdRef.current).toBeNull();
  });

  it("clears active category state when switching from category drag to link drag", () => {
    const categoryById = new Map(categories.map((category) => [category.id, category]));
    const { result } = renderHook(() =>
      useStandardPageDndSession({ categories, categoryById }),
    );

    act(() => {
      result.current.handleDragStart({
        active: { id: "cat-a", data: { current: { type: "category-button" } } },
      } as never);
      result.current.handleDragStart({
        active: { id: "link:link-2", data: { current: { type: "nav-link" } } },
      } as never);
    });

    expect(result.current.activeDragCategory).toBeNull();
    expect(result.current.activeDragLink?.id).toBe("link-2");
    expect(result.current.dragSourceCategoryId).toBe("cat-b");
  });
});

