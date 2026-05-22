import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi, afterEach } from "vitest";

import { toast } from "@/shared/ui/primitives/use-toast";
import { useQuickEditDnd } from "@/features/quick-edit";
import { qeBookmarkLinkId, qeManualCategoryId, qeNavLinkId } from "@/shared/lib/dnd/dndUtils";
import type { Category } from "@/shared/types/category";
import type { SiteLink } from "@/shared/types/link";

vi.mock("@/shared/ui/primitives/use-toast", () => ({
  toast: vi.fn(),
}));

const mockedToast = vi.mocked(toast);

function buildBaseCategories(): Category[] {
  return [
    {
      id: "cat-a",
      name: "Cat A",
      links: [
        { id: "link-1", title: "Link One", url: "https://one.example" },
        { id: "link-2", title: "Link Two", url: "https://two.example" },
      ],
    },
    {
      id: "cat-b",
      name: "Cat B",
      links: [{ id: "link-3", title: "Link Three", url: "https://three.example" }],
    },
  ];
}

function buildDuplicateCategories(): Category[] {
  return [
    {
      id: "cat-a",
      name: "Cat A",
      links: [{ id: "link-dup", title: "Dup", url: "https://dup.example" }],
    },
  ];
}

const sampleBookmarkLink: SiteLink = {
  id: "bookmark-1",
  title: "Bookmark",
  url: "https://bookmark.example",
};

function buildBookmarkDragEvent(targetId: string, link: SiteLink = sampleBookmarkLink) {
  return {
    active: {
      id: qeBookmarkLinkId(link.id),
      data: {
        current: {
          type: "bookmark-link",
          link,
        },
      },
    },
    over: {
      id: targetId,
    },
  } as const;
}

function buildNavDragEvent(activeCat: string, activeLinkId: string, overCat: string, overLinkId: string) {
  return {
    active: {
      id: qeNavLinkId(activeCat, activeLinkId),
      data: {
        current: {
          type: "nav-link",
        },
      },
    },
    over: {
      id: qeNavLinkId(overCat, overLinkId),
    },
  } as const;
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

describe("useQuickEditDnd", () => {
  it("adds a bookmark to the target category", () => {
    const categories = buildBaseCategories();
    const onAddLink = vi.fn();
    const onMoveLink = vi.fn();
    vi.spyOn(crypto, "randomUUID").mockReturnValue("new-bookmark-id");

    const { result } = renderHook(() =>
      useQuickEditDnd({ categories, onAddLink, onMoveLink }),
    );

    act(() => {
      result.current.onDragEnd(buildBookmarkDragEvent(qeManualCategoryId("cat-a")));
    });

    expect(onAddLink).toHaveBeenCalledWith("cat-a", {
      id: "new-bookmark-id",
      title: sampleBookmarkLink.title,
      url: sampleBookmarkLink.url,
    });
    expect(onMoveLink).not.toHaveBeenCalled();
  });

  it("inserts a bookmark before a navigation link and follows up with a move", () => {
    const categories = buildBaseCategories();
    const onAddLink = vi.fn();
    const onMoveLink = vi.fn();
    vi.spyOn(crypto, "randomUUID").mockReturnValue("followup-id");

    const { result } = renderHook(() =>
      useQuickEditDnd({ categories, onAddLink, onMoveLink }),
    );

    act(() => {
      result.current.onDragStart({
        active: {
          id: qeBookmarkLinkId(sampleBookmarkLink.id),
          data: {
            current: {
              type: "bookmark-link",
              link: sampleBookmarkLink,
            },
          },
        },
      } as const);
    });

    act(() => {
      result.current.onDragOver({
        active: {
          id: qeBookmarkLinkId(sampleBookmarkLink.id),
          data: {
            current: {
              type: "bookmark-link",
              link: sampleBookmarkLink,
            },
          },
        },
        over: {
          id: qeNavLinkId("cat-b", "link-3"),
        },
      } as const);
    });

    act(() => {
      result.current.onDragEnd({
        active: {
          id: qeBookmarkLinkId(sampleBookmarkLink.id),
          data: {
            current: {
              type: "bookmark-link",
              link: sampleBookmarkLink,
            },
          },
        },
        over: {
          id: qeNavLinkId("cat-b", "link-3"),
        },
      } as const);
    });

    expect(onAddLink).toHaveBeenCalled();
    expect(onMoveLink).toHaveBeenCalled();
    const addOrder = onAddLink.mock.invocationCallOrder[0];
    const moveOrder = onMoveLink.mock.invocationCallOrder[0];
    expect(addOrder).toBeLessThan(moveOrder);
  });

  it("prevents adding a bookmark when the URL already exists in the target category", () => {
    const categories = buildDuplicateCategories();
    const onAddLink = vi.fn();
    const onMoveLink = vi.fn();
    const { result } = renderHook(() =>
      useQuickEditDnd({ categories, onAddLink, onMoveLink }),
    );

    act(() => {
      const event = buildBookmarkDragEvent(qeManualCategoryId("cat-a"), {
        id: "bookmark-dup",
        title: "Dup",
        url: "https://dup.example",
      });
      result.current.onDragEnd(event);
    });

    expect(onAddLink).not.toHaveBeenCalled();
    expect(onMoveLink).not.toHaveBeenCalled();
    expect(mockedToast).toHaveBeenCalledWith(expect.objectContaining({ title: "已存在" }));
  });

  it("reorders navigation links within the same category", () => {
    const categories = buildBaseCategories();
    const onAddLink = vi.fn();
    const onMoveLink = vi.fn();
    const { result } = renderHook(() =>
      useQuickEditDnd({ categories, onAddLink, onMoveLink }),
    );

    act(() => {
      result.current.onDragEnd(buildNavDragEvent("cat-a", "link-1", "cat-a", "link-2"));
    });

    expect(onMoveLink).toHaveBeenCalledWith("link-1", "cat-a", "cat-a", 1);
    expect(onAddLink).not.toHaveBeenCalled();
  });

  it("moves a navigation link across categories", () => {
    const categories = buildBaseCategories();
    const onAddLink = vi.fn();
    const onMoveLink = vi.fn();
    const { result } = renderHook(() =>
      useQuickEditDnd({ categories, onAddLink, onMoveLink }),
    );

    act(() => {
      result.current.onDragEnd(buildNavDragEvent("cat-a", "link-2", "cat-b", "link-3"));
    });

    expect(onMoveLink).toHaveBeenCalledWith("link-2", "cat-a", "cat-b", 0);
    expect(onAddLink).not.toHaveBeenCalled();
  });

  it("moves across categories even after categories reorder (search scenario)", () => {
    const categories = buildBaseCategories();
    const onAddLink = vi.fn();
    const onMoveLink = vi.fn();
    const { result, rerender } = renderHook(
      (args) => useQuickEditDnd(args),
      {
        initialProps: { categories, onAddLink, onMoveLink },
      },
    );

    const reordered = [categories[1], categories[0]];
    rerender({ categories: reordered, onAddLink, onMoveLink });

    act(() => {
      result.current.onDragEnd(buildNavDragEvent("cat-a", "link-1", "cat-b", "link-3"));
    });

    expect(onMoveLink).toHaveBeenCalledWith("link-1", "cat-a", "cat-b", 0);
  });

  it("tracks bookmarkDropTargetId while dragging over navigation links", () => {
    const categories = buildBaseCategories();
    const onAddLink = vi.fn();
    const onMoveLink = vi.fn();
    const { result } = renderHook(() =>
      useQuickEditDnd({ categories, onAddLink, onMoveLink }),
    );

    act(() => {
      result.current.onDragStart({
        active: {
          id: qeBookmarkLinkId(sampleBookmarkLink.id),
          data: {
            current: {
              type: "bookmark-link",
              link: sampleBookmarkLink,
            },
          },
        },
      } as const);
    });

    act(() => {
      result.current.onDragOver({
        active: {
          id: qeBookmarkLinkId(sampleBookmarkLink.id),
          data: {
            current: {
              type: "bookmark-link",
              link: sampleBookmarkLink,
            },
          },
        },
        over: {
          id: qeNavLinkId("cat-a", "link-1"),
        },
      } as const);
    });

    expect(result.current.bookmarkDropTargetId).toBe(qeNavLinkId("cat-a", "link-1"));

    act(() => {
      result.current.onDragOver({
        active: {
          id: qeBookmarkLinkId(sampleBookmarkLink.id),
          data: {
            current: {
              type: "bookmark-link",
              link: sampleBookmarkLink,
            },
          },
        },
        over: null,
      } as const);
    });

    expect(result.current.bookmarkDropTargetId).toBeNull();
  });

  it("clears drag state after drag end", () => {
    const categories = buildBaseCategories();
    const onAddLink = vi.fn();
    const onMoveLink = vi.fn();
    const { result } = renderHook(() =>
      useQuickEditDnd({ categories, onAddLink, onMoveLink }),
    );

    const activeBookmark: SiteLink = {
      id: "bookmark-drop",
      title: "Drag Me",
      url: "https://drag.example",
    };

    act(() => {
      result.current.onDragStart({
        active: {
          id: qeBookmarkLinkId(activeBookmark.id),
          data: {
            current: {
              type: "bookmark-link",
              link: activeBookmark,
            },
          },
        },
      } as const);
    });

    expect(result.current.activeDragItem).toEqual(activeBookmark);

    act(() => {
      result.current.onDragEnd(buildBookmarkDragEvent(qeManualCategoryId("cat-a"), activeBookmark));
    });

    expect(result.current.activeDragItem).toBeNull();
    expect(result.current.bookmarkDropTargetId).toBeNull();
  });

  it("falls back to the last hovered target when drag end loses over", () => {
    const categories = buildBaseCategories();
    const onAddLink = vi.fn();
    const onMoveLink = vi.fn();
    const { result } = renderHook(() =>
      useQuickEditDnd({ categories, onAddLink, onMoveLink }),
    );

    act(() => {
      result.current.onDragStart({
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
      result.current.onDragOver({
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
          id: qeNavLinkId("cat-b", "link-3"),
        },
      } as const);
      result.current.onDragEnd({
        active: {
          id: qeNavLinkId("cat-a", "link-1"),
          data: {
            current: {
              type: "nav-link",
              link: categories[0].links[0],
            },
          },
        },
        over: null,
      } as const);
    });

    expect(onMoveLink).toHaveBeenCalledWith("link-1", "cat-a", "cat-b", 0);
  });

  it("clears drag state on cancel", () => {
    const categories = buildBaseCategories();
    const onAddLink = vi.fn();
    const onMoveLink = vi.fn();
    const { result } = renderHook(() =>
      useQuickEditDnd({ categories, onAddLink, onMoveLink }),
    );

    act(() => {
      result.current.onDragStart({
        active: {
          id: qeBookmarkLinkId(sampleBookmarkLink.id),
          data: {
            current: {
              type: "bookmark-link",
              link: sampleBookmarkLink,
            },
          },
        },
      } as const);
      result.current.onDragOver({
        active: {
          id: qeBookmarkLinkId(sampleBookmarkLink.id),
          data: {
            current: {
              type: "bookmark-link",
              link: sampleBookmarkLink,
            },
          },
        },
        over: {
          id: qeNavLinkId("cat-a", "link-1"),
        },
      } as const);
      result.current.onDragCancel();
    });

    expect(result.current.activeDragItem).toBeNull();
    expect(result.current.bookmarkDropTargetId).toBeNull();
  });

  it("tracks bookmarkDropTargetId while dragging over a category tail", () => {
    const categories = buildBaseCategories();
    const onAddLink = vi.fn();
    const onMoveLink = vi.fn();
    const { result } = renderHook(() =>
      useQuickEditDnd({ categories, onAddLink, onMoveLink }),
    );

    act(() => {
      result.current.onDragStart({
        active: {
          id: qeBookmarkLinkId(sampleBookmarkLink.id),
          data: {
            current: {
              type: "bookmark-link",
              link: sampleBookmarkLink,
            },
          },
        },
      } as const);
      result.current.onDragOver({
        active: {
          id: qeBookmarkLinkId(sampleBookmarkLink.id),
          data: {
            current: {
              type: "bookmark-link",
              link: sampleBookmarkLink,
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

  it("cancels bookmark add when the pointer leaves the manual navigation targets before drop", () => {
    const categories = buildBaseCategories();
    const onAddLink = vi.fn();
    const onMoveLink = vi.fn();
    const { result } = renderHook(() =>
      useQuickEditDnd({ categories, onAddLink, onMoveLink }),
    );

    act(() => {
      result.current.onDragStart({
        active: {
          id: qeBookmarkLinkId(sampleBookmarkLink.id),
          data: {
            current: {
              type: "bookmark-link",
              link: sampleBookmarkLink,
            },
          },
        },
      } as const);
      result.current.onDragOver({
        active: {
          id: qeBookmarkLinkId(sampleBookmarkLink.id),
          data: {
            current: {
              type: "bookmark-link",
              link: sampleBookmarkLink,
            },
          },
        },
        over: {
          id: qeNavLinkId("cat-a", "link-1"),
        },
      } as const);
      result.current.onDragOver({
        active: {
          id: qeBookmarkLinkId(sampleBookmarkLink.id),
          data: {
            current: {
              type: "bookmark-link",
              link: sampleBookmarkLink,
            },
          },
        },
        over: null,
      } as const);
      result.current.onDragEnd({
        active: {
          id: qeBookmarkLinkId(sampleBookmarkLink.id),
          data: {
            current: {
              type: "bookmark-link",
              link: sampleBookmarkLink,
            },
          },
        },
        over: null,
      } as const);
    });

    expect(onAddLink).not.toHaveBeenCalled();
    expect(onMoveLink).not.toHaveBeenCalled();
  });
});


