import type { UniqueIdentifier } from "@dnd-kit/core";

/**
 * 生成分类容器的 DnD ID
 * @param categoryId 分类 ID
 * @returns DnD 容器 ID (格式: cat:xxx)
 */
export const dndContainerId = (categoryId: string) => `cat:${categoryId}`;

/**
 * 生成链接的 DnD ID
 * @param linkId 链接 ID
 * @returns DnD 链接 ID (格式: link:xxx)
 */
export const dndLinkId = (linkId: string) => `link:${linkId}`;

/**
 * 解析 DnD 链接 ID,提取原始链接 ID
 * @param id DnD ID
 * @returns 原始链接 ID,如果不是链接 ID 则返回 null
 */
export const parseDndLinkId = (id: UniqueIdentifier) =>
  typeof id === "string" && id.startsWith("link:") ? id.slice(5) : null;

/**
 * 解析 DnD 容器 ID,提取原始分类 ID
 * @param id DnD ID
 * @returns 原始分类 ID,如果不是容器 ID 则返回 null
 */
export const parseDndContainerId = (id: UniqueIdentifier) =>
  typeof id === "string" && id.startsWith("cat:") ? id.slice(4) : null;

export const recentVisitLinkId = (recentVisitId: string) => `recent-link:${recentVisitId}`;

export const parseRecentVisitLinkId = (id: UniqueIdentifier) =>
  typeof id === "string" && id.startsWith("recent-link:") ? id.slice(12) : null;

// --- Quick Edit 命名空间 ---

export const qeManualCategoryId = (catId: string) => `qe-manual-cat:${catId}`;
export const qeBookmarkLinkId = (linkId: string) => `qe-bm-link:${linkId}`;

export const parseQeManualCategoryId = (id: UniqueIdentifier) =>
  typeof id === "string" && id.startsWith("qe-manual-cat:") ? id.slice(14) : null;

export const parseQeBookmarkLinkId = (id: UniqueIdentifier) =>
  typeof id === "string" && id.startsWith("qe-bm-link:") ? id.slice(11) : null;

export const qeNavLinkId = (catId: string, linkId: string) =>
  `qe-nav-link:${catId}:${linkId}`;

export const parseQeNavLinkId = (
  id: UniqueIdentifier,
): { categoryId: string; linkId: string } | null => {
  if (typeof id !== "string" || !id.startsWith("qe-nav-link:")) return null;
  const rest = id.slice(12);
  const sep = rest.indexOf(":");
  if (sep < 0) return null;
  return { categoryId: rest.slice(0, sep), linkId: rest.slice(sep + 1) };
};
