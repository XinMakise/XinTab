import { describe, expect, it } from "vitest";

import {
  resolveQuickEditDragEndAction,
  resolveQuickEditBookmarkDrop,
  resolveQuickEditNavDrop,
  resolveStandardPageDragEndAction,
  resolveStandardPageLinkDrop,
} from "@/shared/lib/dnd/dndDropResolvers";
import { dndLinkId, qeBookmarkLinkId, qeManualCategoryId, qeNavLinkId } from "@/shared/lib/dnd/dndUtils";
import type { Category } from "@/shared/types/category";

function buildCategories(): Category[] {
  return [
    {
      id: "cat-a",
      name: "A",
      links: [
        { id: "link-1", title: "One", url: "https://one.example" },
        { id: "link-2", title: "Two", url: "https://two.example" },
      ],
    },
    {
      id: "cat-b",
      name: "B",
      links: [{ id: "link-3", title: "Three", url: "https://three.example" }],
    },
  ];
}

describe("dndDropResolvers", () => {
  it("resolves standard-page same-category link reorder", () => {
    const categories = buildCategories();
    const categoryById = new Map(categories.map((category) => [category.id, category]));

    expect(
      resolveStandardPageLinkDrop(
        categories,
        categoryById,
        "link-1",
        dndLinkId("link-2"),
      ),
    ).toEqual({
      kind: "same-category",
      categoryId: "cat-a",
      fromIndex: 0,
      toIndex: 1,
    });
  });

  it("resolves standard-page cross-category link move", () => {
    const categories = buildCategories();
    const categoryById = new Map(categories.map((category) => [category.id, category]));

    expect(
      resolveStandardPageLinkDrop(
        categories,
        categoryById,
        "link-2",
        dndLinkId("link-3"),
      ),
    ).toEqual({
      kind: "cross-category",
      fromCategoryId: "cat-a",
      toCategoryId: "cat-b",
      toIndex: 0,
    });
  });

  it("resolves standard-page category-button drag into reorder action", () => {
    const categories = buildCategories();
    const categoryById = new Map(categories.map((category) => [category.id, category]));

    expect(
      resolveStandardPageDragEndAction({
        categories,
        categoryById,
        activeId: "cat-a",
        activeType: "category-button",
        overId: "cat-b",
      }),
    ).toEqual({
      kind: "reorder-category",
      activeCategoryId: "cat-a",
      overCategoryId: "cat-b",
    });
  });

  it("resolves category-button reorder when the category tab droppable is hit", () => {
    const categories = buildCategories();
    const categoryById = new Map(categories.map((category) => [category.id, category]));

    expect(
      resolveStandardPageDragEndAction({
        categories,
        categoryById,
        activeId: "cat-a",
        activeType: "category-button",
        overId: "cat-btn:cat-b",
      }),
    ).toEqual({
      kind: "reorder-category",
      activeCategoryId: "cat-a",
      overCategoryId: "cat-b",
    });
  });

  it("resolves standard-page link drag into move action", () => {
    const categories = buildCategories();
    const categoryById = new Map(categories.map((category) => [category.id, category]));

    expect(
      resolveStandardPageDragEndAction({
        categories,
        categoryById,
        activeId: dndLinkId("link-2"),
        activeType: "nav-link",
        overId: dndLinkId("link-3"),
      }),
    ).toEqual({
      kind: "move-link",
      linkId: "link-2",
      resolution: {
        kind: "cross-category",
        fromCategoryId: "cat-a",
        toCategoryId: "cat-b",
        toIndex: 0,
      },
    });
  });

  it("resolves Quick Edit bookmark drop into a nav insertion slot", () => {
    const categories = buildCategories();

    expect(
      resolveQuickEditBookmarkDrop(categories, qeNavLinkId("cat-b", "link-3")),
    ).toEqual({
      targetCategoryId: "cat-b",
      targetIndex: 0,
    });
  });

  it("resolves Quick Edit duplicate bookmark add into duplicate action", () => {
    const categories = buildCategories();

    expect(
      resolveQuickEditDragEndAction({
        categories,
        activeId: qeBookmarkLinkId("bookmark-1"),
        activeLink: { title: "One Copy", url: "https://one.example" },
        overId: qeManualCategoryId("cat-a"),
      }),
    ).toEqual({
      kind: "duplicate-bookmark",
      link: { title: "One Copy", url: "https://one.example" },
      targetCategoryId: "cat-a",
    });
  });

  it("resolves Quick Edit nav drag into move action", () => {
    const categories = buildCategories();

    expect(
      resolveQuickEditDragEndAction({
        categories,
        activeId: qeNavLinkId("cat-a", "link-1"),
        overId: qeNavLinkId("cat-b", "link-3"),
      }),
    ).toEqual({
      kind: "move-nav",
      linkId: "link-1",
      fromCategoryId: "cat-a",
      toCategoryId: "cat-b",
      toIndex: 0,
    });
  });

  it("resolves Quick Edit nav drop into category tail", () => {
    const categories = buildCategories();

    expect(
      resolveQuickEditNavDrop(
        categories,
        { categoryId: "cat-a", linkId: "link-1" },
        qeManualCategoryId("cat-b"),
      ),
    ).toEqual({
      kind: "cross-category",
      fromCategoryId: "cat-a",
      toCategoryId: "cat-b",
      toIndex: 1,
    });
  });
});

