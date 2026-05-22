import { describe, expect, it } from "vitest";

import {
  moveLinkBetweenCategories,
  reorderCategoriesById,
  reorderLinksInCategory,
  resolveLinkDropIndex,
} from "@/shared/lib/dnd/dndMove";
import type { Category } from "@/shared/types/category";
import type { SiteLink } from "@/shared/types/link";

function buildCategories(): Category[] {
  return [
    {
      id: "cat-a",
      name: "A",
      links: [
        { id: "link-a", title: "A", url: "https://a.example.com" },
        { id: "link-b", title: "B", url: "https://b.example.com" },
        { id: "link-c", title: "C", url: "https://c.example.com" },
      ],
    },
    {
      id: "cat-b",
      name: "B",
      links: [{ id: "link-d", title: "D", url: "https://d.example.com" }],
    },
  ];
}

describe("dndMove", () => {
  it("reorders links within the same category", () => {
    const categories = buildCategories();

    const next = reorderLinksInCategory(categories, "cat-a", 0, 2);

    expect(next[0].links.map((link) => link.id)).toEqual(["link-b", "link-c", "link-a"]);
    expect(next[1]).toBe(categories[1]);
  });

  it("keeps the original array when reorder input is invalid", () => {
    const categories = buildCategories();

    expect(reorderLinksInCategory(categories, "cat-a", 1, 1)).toBe(categories);
    expect(reorderLinksInCategory(categories, "cat-a", -1, 2)).toBe(categories);
    expect(reorderLinksInCategory(categories, "missing", 0, 1)).toBe(categories);
  });

  it("moves a link across categories and clamps the insertion index", () => {
    const categories = buildCategories();
    const linkToMove = categories[0].links[1] as SiteLink;

    const next = moveLinkBetweenCategories(categories, linkToMove, "cat-a", "cat-b", 99);

    expect(next[0].links.map((link) => link.id)).toEqual(["link-a", "link-c"]);
    expect(next[1].links.map((link) => link.id)).toEqual(["link-d", "link-b"]);
  });

  it("ignores invalid cross-category move requests", () => {
    const categories = buildCategories();
    const linkToMove = categories[0].links[0] as SiteLink;

    expect(moveLinkBetweenCategories(categories, linkToMove, "cat-a", "cat-a", 0)).toBe(categories);
    expect(moveLinkBetweenCategories(categories, linkToMove, "missing", "cat-b", 0)).toBe(categories);
    expect(
      moveLinkBetweenCategories(
        categories,
        { id: "missing", title: "Missing", url: "https://missing.example.com" },
        "cat-a",
        "cat-b",
        0,
      ),
    ).toBe(categories);
  });

  it("reorders categories by id", () => {
    const categories = buildCategories();

    const next = reorderCategoriesById(categories, "cat-a", "cat-b");

    expect(next.map((category) => category.id)).toEqual(["cat-b", "cat-a"]);
  });

  it("resolves drop index from link id with fallback", () => {
    const links = buildCategories()[0].links;

    expect(resolveLinkDropIndex(links, "link-b", links.length - 1)).toBe(1);
    expect(resolveLinkDropIndex(links, "missing", 0)).toBe(0);
    expect(resolveLinkDropIndex(links, null, 2)).toBe(2);
  });
});

