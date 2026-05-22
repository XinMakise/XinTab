import { describe, expect, it } from "vitest";

import {
  buildBookmarkUpdateChanges,
  resolveBookmarkSavePlan,
  resolveQuickAddBookmark,
} from "@/features/quick-edit/lib/quickEditBookmarkActions";
import type { Category } from "@/shared/types/category";
import type { SiteLink } from "@/shared/types/link";

const originalBookmark: SiteLink = {
  id: "bookmark-1",
  title: "Docs",
  url: "https://docs.example.com",
};

const categories: Category[] = [
  {
    id: "folder-1",
    name: "开发",
    links: [{ ...originalBookmark }],
  },
  {
    id: "folder-2",
    name: "学习",
    links: [],
  },
];

describe("quickEditBookmarkActions helpers", () => {
  it("builds bookmark update changes only for changed fields", () => {
    expect(
      buildBookmarkUpdateChanges(originalBookmark, {
        ...originalBookmark,
        title: "Docs Updated",
      }),
    ).toEqual({ title: "Docs Updated" });
  });

  it("resolves bookmark save plans for update and move decisions", () => {
    expect(
      resolveBookmarkSavePlan(
        originalBookmark,
        { ...originalBookmark, title: "Docs Updated" },
        "folder-1",
        "folder-2",
      ),
    ).toEqual({
      changes: { title: "Docs Updated" },
      shouldUpdate: true,
      shouldMove: true,
    });
  });

  it("resolves duplicate and missing-category quick-add states", () => {
    expect(resolveQuickAddBookmark([], originalBookmark)).toEqual({
      kind: "missing-category",
    });

    expect(resolveQuickAddBookmark(categories, originalBookmark)).toEqual({
      kind: "duplicate",
      categoryName: "开发",
    });
  });

  it("resolves quick-add target when the first category has no duplicate", () => {
    expect(
      resolveQuickAddBookmark(categories, {
        id: "bookmark-2",
        title: "Guide",
        url: "https://guide.example.com",
      }),
    ).toEqual({
      kind: "add",
      categoryId: "folder-1",
      categoryName: "开发",
    });
  });
});

