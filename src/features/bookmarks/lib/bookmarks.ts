import { getChrome, hasChromeBookmarks, type ChromeBookmarkNode } from "@/shared/browser/chrome";
import type { Category } from "@/shared/types/category";
import type { SiteLink } from "@/shared/types/link";

export type BookmarkOverview = {
  categories: Category[];
  topFolders: ChromeBookmarkNode[];
};

function toLink(node: ChromeBookmarkNode): SiteLink | null {
  if (!node.url) return null;
  return {
    id: node.id,
    title: node.title?.trim() || node.url,
    url: node.url,
  };
}

function walkFolder(
  folder: ChromeBookmarkNode,
  parentTitle: string | undefined,
  includeEmpty: boolean,
): Category[] {
  const name = folder.title?.trim() || parentTitle || "未命名";
  const links: SiteLink[] = [];
  const subfolders: ChromeBookmarkNode[] = [];

  for (const child of folder.children || []) {
    if (child.url) {
      const l = toLink(child);
      if (l) links.push(l);
    } else {
      subfolders.push(child);
    }
  }

  const categories: Category[] = [];
  if (includeEmpty || links.length) {
    categories.push({ id: folder.id, name, links });
  }
  for (const sf of subfolders) categories.push(...walkFolder(sf, sf.title, includeEmpty));
  return categories;
}

export async function getBookmarkOverview(options?: {
  includeEmpty?: boolean;
}): Promise<BookmarkOverview> {
  if (!hasChromeBookmarks()) {
    throw new Error(
      "未检测到 chrome.bookmarks：请在 Chrome 扩展新标签页环境中运行（Manifest V3 + bookmarks 权限）。",
    );
  }

  const c = getChrome();
  const tree = await new Promise<ChromeBookmarkNode[]>((resolve) => {
    c!.bookmarks!.getTree((nodes) => resolve(nodes as ChromeBookmarkNode[]));
  });

  const root = tree?.[0];
  if (!root?.children?.length) return { categories: [], topFolders: [] };

  // Usually: Bookmarks Bar / Other Bookmarks / Mobile Bookmarks
  const topFolders = root.children.filter((n) => n.children);
  const includeEmpty = options?.includeEmpty ?? false;
  const categories = topFolders.flatMap((f) => walkFolder(f, f.title, includeEmpty));

  // Keep stable order: by name then by link count desc
  const ordered = categories.sort((a, b) => {
    if (a.name !== b.name) return a.name.localeCompare(b.name, "zh-Hans-CN");
    return b.links.length - a.links.length;
  });

  return { categories: ordered, topFolders };
}

export async function getBookmarksByFolders(options?: {
  includeEmpty?: boolean;
}): Promise<Category[]> {
  const { categories } = await getBookmarkOverview(options);
  if (options?.includeEmpty) return categories;
  return categories.filter((c) => c.links.length);
}

/**
 * 获取书签栏（Bookmarks Bar）的 ID。
 * Chrome 中通常是 "1"，但为稳健起见从树中读取。
 */
export async function getBookmarksBarId(): Promise<string> {
  if (!hasChromeBookmarks()) {
    throw new Error("Chrome bookmarks API is not available");
  }
  const c = getChrome();
  const tree = await new Promise<ChromeBookmarkNode[]>((resolve) => {
    c!.bookmarks!.getTree((nodes) => resolve(nodes as ChromeBookmarkNode[]));
  });
  const root = tree?.[0];
  return root?.children?.[0]?.id ?? "1";
}

