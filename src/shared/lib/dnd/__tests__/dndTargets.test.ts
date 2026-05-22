import { describe, expect, it } from "vitest";

import { dndContainerId, dndLinkId } from "@/shared/lib/dnd/dndUtils";
import { isOverCategoryButton, resolveStandardDropCategoryId } from "@/shared/lib/dnd/dndTargets";
import type { Category } from "@/shared/types/category";

const categories: Category[] = [
  {
    id: "cat-a",
    name: "A",
    links: [
      { id: "link-a", title: "A", url: "https://a.example.com" },
      { id: "link-b", title: "B", url: "https://b.example.com" },
    ],
  },
  {
    id: "cat-b",
    name: "B",
    links: [{ id: "link-c", title: "C", url: "https://c.example.com" }],
  },
];

const categoryById = new Map(categories.map((category) => [category.id, category]));

describe("dndTargets", () => {
  it("detects category-button style drop targets", () => {
    expect(isOverCategoryButton({ type: "category-button" })).toBe(true);
    expect(isOverCategoryButton({ type: "container", categoryId: "cat-a" })).toBe(true);
    expect(isOverCategoryButton({ type: "container" })).toBe(false);
    expect(isOverCategoryButton({ type: "link", categoryId: "cat-a" })).toBe(false);
    expect(isOverCategoryButton(undefined)).toBe(false);
  });

  it("resolves standard drop category ids from buttons, containers, and links", () => {
    expect(resolveStandardDropCategoryId("cat-a", categoryById, categories)).toBe("cat-a");
    expect(resolveStandardDropCategoryId(dndContainerId("cat-b"), categoryById, categories)).toBe(
      "cat-b",
    );
    // category button droppable prefix (cat-btn:)
    expect(resolveStandardDropCategoryId("cat-btn:cat-a", categoryById, categories)).toBe("cat-a");
    expect(resolveStandardDropCategoryId("cat-btn:cat-b", categoryById, categories)).toBe("cat-b");
    expect(resolveStandardDropCategoryId(dndLinkId("link-c"), categoryById, categories)).toBe(
      "cat-b",
    );
  });

  it("returns null for unknown drop targets", () => {
    expect(resolveStandardDropCategoryId("missing", categoryById, categories)).toBeNull();
    expect(resolveStandardDropCategoryId(dndLinkId("missing-link"), categoryById, categories)).toBeNull();
    expect(resolveStandardDropCategoryId(null, categoryById, categories)).toBeNull();
  });
});

