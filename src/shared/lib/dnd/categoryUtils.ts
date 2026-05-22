import type { Category } from "@/shared/types/category";
import type { SiteLink } from "@/shared/types/link";

/**
 * 在所有分类中查找指定 ID 的链接
 */
export function findLinkById(categories: Category[], linkId: string): SiteLink | null {
  for (const c of categories) {
    const found = c.links.find((l) => l.id === linkId);
    if (found) return found;
  }
  return null;
}

/**
 * 查找包含指定链接的分类 ID
 */
export function findCategoryIdByLinkId(categories: Category[], linkId: string): string | null {
  for (const c of categories) {
    if (c.links.some((l) => l.id === linkId)) return c.id;
  }
  return null;
}

/**
 * 分类索引缓存，用于频繁查找场景（如拖拽）
 * 使用 WeakMap 避免内存泄漏
 */
const indexCache = new WeakMap<Category[], CategoryIndex>();

interface CategoryIndex {
  linkToCategory: Map<string, string>;
  linkById: Map<string, SiteLink>;
}

function buildIndex(categories: Category[]): CategoryIndex {
  const linkToCategory = new Map<string, string>();
  const linkById = new Map<string, SiteLink>();

  for (const c of categories) {
    for (const link of c.links) {
      linkToCategory.set(link.id, c.id);
      linkById.set(link.id, link);
    }
  }

  return { linkToCategory, linkById };
}

/**
 * 获取或创建分类索引（带缓存）
 */
export function getCategoryIndex(categories: Category[]): CategoryIndex {
  let index = indexCache.get(categories);
  if (!index) {
    index = buildIndex(categories);
    indexCache.set(categories, index);
  }
  return index;
}

/**
 * 使用索引快速查找链接
 */
export function findLinkByIdFast(categories: Category[], linkId: string): SiteLink | null {
  return getCategoryIndex(categories).linkById.get(linkId) ?? null;
}

/**
 * 使用索引快速查找分类 ID
 */
export function findCategoryIdByLinkIdFast(categories: Category[], linkId: string): string | null {
  return getCategoryIndex(categories).linkToCategory.get(linkId) ?? null;
}

