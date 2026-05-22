import type { Category } from "@/shared/types/category";
import type { SiteLink } from "@/shared/types/link";

export function buildBookmarkUpdateChanges(
  originalLink: SiteLink,
  nextLink: SiteLink,
): { title?: string; url?: string } {
  const changes: { title?: string; url?: string } = {};
  if (nextLink.title !== originalLink.title) changes.title = nextLink.title;
  if (nextLink.url !== originalLink.url) changes.url = nextLink.url;
  return changes;
}

export function resolveBookmarkSavePlan(
  originalLink: SiteLink,
  nextLink: SiteLink,
  sourceCategoryId: string,
  targetCategoryId: string,
) {
  const changes = buildBookmarkUpdateChanges(originalLink, nextLink);

  return {
    changes,
    shouldUpdate: Object.keys(changes).length > 0,
    shouldMove: targetCategoryId !== sourceCategoryId,
  };
}

export type QuickAddBookmarkResolution =
  | { kind: "missing-category" }
  | { kind: "duplicate"; categoryName: string }
  | { kind: "add"; categoryId: string; categoryName: string };

export function resolveQuickAddBookmark(
  categories: Category[],
  link: SiteLink,
): QuickAddBookmarkResolution {
  const targetCategory = categories[0];
  if (!targetCategory) {
    return { kind: "missing-category" };
  }

  const exists = targetCategory.links.some((item) => item.url === link.url);
  if (exists) {
    return {
      kind: "duplicate",
      categoryName: targetCategory.name,
    };
  }

  return {
    kind: "add",
    categoryId: targetCategory.id,
    categoryName: targetCategory.name,
  };
}

