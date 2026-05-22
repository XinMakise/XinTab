import { arrayMove } from "@dnd-kit/sortable";

import type { Category } from "@/shared/types/category";
import type { SiteLink } from "@/shared/types/link";

export function reorderCategoriesById(
  categories: Category[],
  activeCategoryId: string,
  overCategoryId: string,
): Category[] {
  if (activeCategoryId === overCategoryId) return categories;

  const oldIndex = categories.findIndex((category) => category.id === activeCategoryId);
  const newIndex = categories.findIndex((category) => category.id === overCategoryId);
  if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return categories;

  return arrayMove(categories, oldIndex, newIndex);
}

export function resolveLinkDropIndex(
  links: SiteLink[],
  overLinkId: string | null | undefined,
  fallbackIndex: number,
): number {
  if (!overLinkId) return fallbackIndex;

  const matchedIndex = links.findIndex((link) => link.id === overLinkId);
  return matchedIndex >= 0 ? matchedIndex : fallbackIndex;
}

export function reorderLinksInCategory(
  categories: Category[],
  categoryId: string,
  fromIndex: number,
  toIndex: number,
): Category[] {
  if (fromIndex === toIndex) return categories;

  let didReorder = false;
  const nextCategories = categories.map((category) => {
    if (category.id !== categoryId) return category;

    if (
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= category.links.length ||
      toIndex >= category.links.length
    ) {
      return category;
    }

    didReorder = true;
    return {
      ...category,
      links: arrayMove(category.links, fromIndex, toIndex),
    };
  });

  return didReorder ? nextCategories : categories;
}

export function moveLinkBetweenCategories(
  categories: Category[],
  link: SiteLink,
  fromCategoryId: string,
  toCategoryId: string,
  toIndex: number,
): Category[] {
  if (fromCategoryId === toCategoryId) return categories;

  const fromCategory = categories.find((category) => category.id === fromCategoryId);
  const toCategory = categories.find((category) => category.id === toCategoryId);
  if (!fromCategory || !toCategory) return categories;
  if (!fromCategory.links.some((item) => item.id === link.id)) return categories;

  return categories.map((category) => {
    if (category.id === fromCategoryId) {
      return {
        ...category,
        links: category.links.filter((item) => item.id !== link.id),
      };
    }

    if (category.id === toCategoryId) {
      const clampedIndex = Math.max(0, Math.min(toIndex, category.links.length));
      const nextLinks = [...category.links];
      nextLinks.splice(clampedIndex, 0, link);

      return {
        ...category,
        links: nextLinks,
      };
    }

    return category;
  });
}

export function moveLinkById(
  categories: Category[],
  linkId: string,
  fromCategoryId: string,
  toCategoryId: string,
  toIndex: number,
): Category[] {
  if (fromCategoryId === toCategoryId) {
    const category = categories.find((item) => item.id === fromCategoryId);
    if (!category) return categories;

    const fromIndex = category.links.findIndex((link) => link.id === linkId);
    return reorderLinksInCategory(categories, fromCategoryId, fromIndex, toIndex);
  }

  const fromCategory = categories.find((item) => item.id === fromCategoryId);
  const link = fromCategory?.links.find((item) => item.id === linkId);
  if (!link) return categories;

  return moveLinkBetweenCategories(
    categories,
    link,
    fromCategoryId,
    toCategoryId,
    toIndex,
  );
}

