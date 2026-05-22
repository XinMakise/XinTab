import type { UniqueIdentifier } from "@dnd-kit/core";

import { findCategoryIdByLinkIdFast } from "./categoryUtils";
import { resolveLinkDropIndex } from "./dndMove";
import {
  parseDndLinkId,
  parseQeBookmarkLinkId,
  parseQeManualCategoryId,
  parseQeNavLinkId,
} from "./dndUtils";
import { resolveStandardDropCategoryId } from "./dndTargets";
import type { Category } from "@/shared/types/category";

export type StandardPageLinkDropResolution =
  | {
      kind: "same-category";
      categoryId: string;
      fromIndex: number;
      toIndex: number;
    }
  | {
      kind: "cross-category";
      fromCategoryId: string;
      toCategoryId: string;
      toIndex: number;
    };

export type StandardPageDragEndAction =
  | {
      kind: "reorder-category";
      activeCategoryId: string;
      overCategoryId: string;
    }
  | {
      kind: "move-link";
      linkId: string;
      resolution: StandardPageLinkDropResolution;
    };

type ResolveStandardPageDragEndActionOptions = {
  categories: Category[];
  categoryById: Map<string, Category>;
  activeId: UniqueIdentifier;
  activeType?: string;
  overId: UniqueIdentifier | null | undefined;
};

export function resolveStandardPageDragEndAction({
  categories,
  categoryById,
  activeId,
  activeType,
  overId,
}: ResolveStandardPageDragEndActionOptions): StandardPageDragEndAction | null {
  if (!overId) return null;

  if (activeType === "category-button") {
    const activeCategoryId = resolveStandardDropCategoryId(activeId, categoryById, categories);
    const overCategoryId = resolveStandardDropCategoryId(overId, categoryById, categories);
    if (
      !activeCategoryId ||
      !overCategoryId ||
      activeCategoryId === overCategoryId ||
      !categoryById.has(activeCategoryId) ||
      !categoryById.has(overCategoryId)
    ) {
      return null;
    }

    return {
      kind: "reorder-category",
      activeCategoryId,
      overCategoryId,
    };
  }

  const linkId = parseDndLinkId(activeId);
  if (!linkId) return null;

  const resolution = resolveStandardPageLinkDrop(
    categories,
    categoryById,
    linkId,
    overId,
  );
  if (!resolution) return null;

  return {
    kind: "move-link",
    linkId,
    resolution,
  };
}

export function resolveStandardPageLinkDrop(
  categories: Category[],
  categoryById: Map<string, Category>,
  activeLinkId: string,
  overId: UniqueIdentifier | null | undefined,
): StandardPageLinkDropResolution | null {
  if (!overId) return null;

  const fromCategoryId = findCategoryIdByLinkIdFast(categories, activeLinkId);
  if (!fromCategoryId) return null;

  const overContainerId = resolveStandardDropCategoryId(overId, categoryById, categories);
  if (!overContainerId) return null;

  if (fromCategoryId === overContainerId) {
    const category = categoryById.get(fromCategoryId);
    if (!category) return null;

    const fromIndex = category.links.findIndex((link) => link.id === activeLinkId);
    const overLinkId = parseDndLinkId(overId);
    const toIndex = resolveLinkDropIndex(
      category.links,
      overLinkId,
      category.links.length - 1,
    );

    if (fromIndex < 0 || toIndex < 0) {
      return null;
    }

    return {
      kind: "same-category",
      categoryId: fromCategoryId,
      fromIndex,
      toIndex,
    };
  }

  const targetCategory = categoryById.get(overContainerId);
  if (!targetCategory) return null;

  const overLinkId = parseDndLinkId(overId);
  return {
    kind: "cross-category",
    fromCategoryId,
    toCategoryId: overContainerId,
    toIndex: resolveLinkDropIndex(targetCategory.links, overLinkId, 0),
  };
}

export function resolveQuickEditBookmarkDrop(
  categories: Category[],
  overId: UniqueIdentifier | null | undefined,
): { targetCategoryId: string; targetIndex: number } | null {
  if (!overId) return null;

  const directCategoryId = parseQeManualCategoryId(overId);
  if (directCategoryId) {
    return { targetCategoryId: directCategoryId, targetIndex: -1 };
  }

  const navTarget = parseQeNavLinkId(overId);
  if (!navTarget) return null;

  const category = categories.find((item) => item.id === navTarget.categoryId);
  if (!category) return null;

  return {
    targetCategoryId: navTarget.categoryId,
    targetIndex: resolveLinkDropIndex(category.links, navTarget.linkId, -1),
  };
}

export type QuickEditNavDropResolution =
  | {
      kind: "same-category";
      categoryId: string;
      toIndex: number;
    }
  | {
      kind: "cross-category";
      fromCategoryId: string;
      toCategoryId: string;
      toIndex: number;
    };

export type QuickEditDragEndAction =
  | {
      kind: "duplicate-bookmark";
      link: { title: string; url: string };
      targetCategoryId: string;
    }
  | {
      kind: "add-bookmark";
      link: { title: string; url: string };
      targetCategoryId: string;
      targetIndex: number;
    }
  | {
      kind: "move-nav";
      linkId: string;
      fromCategoryId: string;
      toCategoryId: string;
      toIndex: number;
    };

type ResolveQuickEditDragEndActionOptions = {
  categories: Category[];
  activeId: UniqueIdentifier;
  activeLink?: { title: string; url: string } | null;
  overId: UniqueIdentifier | null | undefined;
};

export function resolveQuickEditDragEndAction({
  categories,
  activeId,
  activeLink,
  overId,
}: ResolveQuickEditDragEndActionOptions): QuickEditDragEndAction | null {
  const bookmarkLinkId = parseQeBookmarkLinkId(activeId);
  if (bookmarkLinkId) {
    if (!activeLink) return null;

    const bookmarkDrop = resolveQuickEditBookmarkDrop(categories, overId);
    if (!bookmarkDrop) return null;

    const targetCategory = categories.find((category) => category.id === bookmarkDrop.targetCategoryId);
    if (targetCategory?.links.some((link) => link.url === activeLink.url)) {
      return {
        kind: "duplicate-bookmark",
        link: activeLink,
        targetCategoryId: bookmarkDrop.targetCategoryId,
      };
    }

    return {
      kind: "add-bookmark",
      link: activeLink,
      targetCategoryId: bookmarkDrop.targetCategoryId,
      targetIndex: bookmarkDrop.targetIndex,
    };
  }

  const activeNav = parseQeNavLinkId(activeId);
  if (!activeNav) return null;

  const navDrop = resolveQuickEditNavDrop(categories, activeNav, overId);
  if (!navDrop) return null;

  if (navDrop.kind === "same-category") {
    return {
      kind: "move-nav",
      linkId: activeNav.linkId,
      fromCategoryId: navDrop.categoryId,
      toCategoryId: navDrop.categoryId,
      toIndex: navDrop.toIndex,
    };
  }

  return {
    kind: "move-nav",
    linkId: activeNav.linkId,
    fromCategoryId: navDrop.fromCategoryId,
    toCategoryId: navDrop.toCategoryId,
    toIndex: navDrop.toIndex,
  };
}

export function resolveQuickEditNavDrop(
  categories: Category[],
  activeNav: { categoryId: string; linkId: string },
  overId: UniqueIdentifier | null | undefined,
): QuickEditNavDropResolution | null {
  if (!overId) return null;

  const overNav = parseQeNavLinkId(overId);
  if (overNav) {
    if (activeNav.linkId === overNav.linkId) return null;

    if (activeNav.categoryId === overNav.categoryId) {
      const category = categories.find((item) => item.id === activeNav.categoryId);
      if (!category) return null;

      const toIndex = resolveLinkDropIndex(category.links, overNav.linkId, -1);
      if (toIndex < 0) return null;

      return {
        kind: "same-category",
        categoryId: activeNav.categoryId,
        toIndex,
      };
    }

    const targetCategory = categories.find((item) => item.id === overNav.categoryId);
    if (!targetCategory) return null;

    const targetIndex = resolveLinkDropIndex(
      targetCategory.links,
      overNav.linkId,
      targetCategory.links.length,
    );

    return {
      kind: "cross-category",
      fromCategoryId: activeNav.categoryId,
      toCategoryId: overNav.categoryId,
      toIndex: targetIndex >= 0 ? targetIndex : targetCategory.links.length,
    };
  }

  const overCategoryId = parseQeManualCategoryId(overId);
  if (!overCategoryId || overCategoryId === activeNav.categoryId) {
    return null;
  }

  const targetCategory = categories.find((item) => item.id === overCategoryId);
  return {
    kind: "cross-category",
    fromCategoryId: activeNav.categoryId,
    toCategoryId: overCategoryId,
    toIndex: targetCategory ? targetCategory.links.length : 0,
  };
}

