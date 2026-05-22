import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useQuickEditDndSession } from "@/features/quick-edit";
import { qeBookmarkLinkId, qeManualCategoryId, qeNavLinkId } from "@/shared/lib/dnd/dndUtils";
import type { Category } from "@/shared/types/category";
import type { SiteLink } from "@/shared/types/link";

const categories: Category[] = [
  {
    id: "cat-a",
    name: "Cat A",
    links: [{ id: "link-1", title: "Link One", url: "https://one.example" }],
  },
];

const bookmark: SiteLink = {
  id: "bookmark-1",
  title: "Bookmark",
  url: "https://bookmark.example",
};

describe("useQuickEditDndSession", () => {
  it("tracks bookmark drag state and clears it on reset", () => {
    const { result } = renderHook(() => useQuickEditDndSession({ categories }));

    act(() => {
      result.current.handleDragStart({
        active: {
          id: qeBookmarkLinkId(bookmark.id),
          data: {
            current: {
              type: "bookmark-link",
              link: bookmark,
            },
          },
        },
      } as const);
    });

    act(() => {
      result.current.handleDragOver({
        active: {
          id: qeBookmarkLinkId(bookmark.id),
          data: {
            current: {
              type: "bookmark-link",
              link: bookmark,
            },
          },
        },
        over: {
          id: qeNavLinkId("cat-a", "link-1"),
        },
      } as const);
    });

    expect(result.current.activeDragItem).toEqual(bookmark);
    expect(result.current.dragSourceCategoryId).toBeNull();
    expect(result.current.bookmarkDropTargetId).toBe(qeNavLinkId("cat-a", "link-1"));
    expect(result.current.lastOverIdRef.current).toBe(qeNavLinkId("cat-a", "link-1"));

    act(() => {
      result.current.resetDragState();
    });

    expect(result.current.activeDragItem).toBeNull();
    expect(result.current.dragSourceCategoryId).toBeNull();
    expect(result.current.bookmarkDropTargetId).toBeNull();
    expect(result.current.lastOverIdRef.current).toBeNull();
  });

  it("ignores bookmark drop target tracking for non-bookmark drags", () => {
    const { result } = renderHook(() => useQuickEditDndSession({ categories }));

    act(() => {
      result.current.handleDragOver({
        active: {
          id: qeNavLinkId("cat-a", "link-1"),
          data: {
            current: {
              type: "nav-link",
              link: categories[0].links[0],
            },
          },
        },
        over: {
          id: qeNavLinkId("cat-a", "link-1"),
        },
      } as const);
    });

    expect(result.current.bookmarkDropTargetId).toBeNull();
  });

  it("tracks source category for dragged navigation links", () => {
    const { result } = renderHook(() => useQuickEditDndSession({ categories }));

    act(() => {
      result.current.handleDragStart({
        active: {
          id: qeNavLinkId("cat-a", "link-1"),
          data: {
            current: {
              type: "nav-link",
              link: categories[0].links[0],
            },
          },
        },
      } as const);
    });

    expect(result.current.activeDragItem).toEqual(categories[0].links[0]);
    expect(result.current.dragSourceCategoryId).toBe("cat-a");
  });

  it("tracks category tail targets for bookmark drops", () => {
    const { result } = renderHook(() => useQuickEditDndSession({ categories }));

    act(() => {
      result.current.handleDragOver({
        active: {
          id: qeBookmarkLinkId(bookmark.id),
          data: {
            current: {
              type: "bookmark-link",
              link: bookmark,
            },
          },
        },
        over: {
          id: qeManualCategoryId("cat-a"),
        },
      } as const);
    });

    expect(result.current.bookmarkDropTargetId).toBe(qeManualCategoryId("cat-a"));
  });
});

