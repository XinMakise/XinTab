import { describe, expect, it } from "vitest";

import {
  findCategoryIdByLinkId,
  findCategoryIdByLinkIdFast,
  findLinkById,
  findLinkByIdFast,
  getCategoryIndex,
} from "@/shared/lib/dnd/categoryUtils";
import type { Category } from "@/shared/types/category";

const categories: Category[] = [
  {
    id: "frontend",
    name: "Frontend",
    links: [
      { id: "react", title: "React", url: "https://react.dev" },
      { id: "vite", title: "Vite", url: "https://vite.dev" },
    ],
  },
  {
    id: "docs",
    name: "Docs",
    links: [{ id: "mdn", title: "MDN", url: "https://developer.mozilla.org" }],
  },
];

describe("categoryUtils", () => {
  it("finds links and category ids with the basic lookup helpers", () => {
    expect(findLinkById(categories, "react")?.title).toBe("React");
    expect(findCategoryIdByLinkId(categories, "mdn")).toBe("docs");
    expect(findLinkById(categories, "missing")).toBeNull();
    expect(findCategoryIdByLinkId(categories, "missing")).toBeNull();
  });

  it("reuses the cached index for the same category array reference", () => {
    const first = getCategoryIndex(categories);
    const second = getCategoryIndex(categories);

    expect(first).toBe(second);
  });

  it("supports fast lookup helpers backed by the cached index", () => {
    expect(findLinkByIdFast(categories, "vite")?.url).toBe("https://vite.dev");
    expect(findCategoryIdByLinkIdFast(categories, "react")).toBe("frontend");
    expect(findLinkByIdFast(categories, "missing")).toBeNull();
    expect(findCategoryIdByLinkIdFast(categories, "missing")).toBeNull();
  });
});

