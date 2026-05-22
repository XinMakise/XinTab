// Minimal runtime guards for Chrome extension APIs.

/** Chrome 书签节点类型 */
export type ChromeBookmarkNode = {
  id: string;
  title?: string;
  url?: string;
  parentId?: string;
  index?: number;
  dateAdded?: number;
  dateLastUsed?: number;
  children?: ChromeBookmarkNode[];
};

export type ChromeHistoryItem = {
  id?: string;
  url?: string;
  title?: string;
  lastVisitTime?: number;
  visitCount?: number;
  typedCount?: number;
};

export type ChromeLike = {
  bookmarks?: {
    getTree: (cb: (nodes: ChromeBookmarkNode[]) => void) => void;
    search?: (
      query: string,
      cb: (results: ChromeBookmarkNode[]) => void
    ) => void;
    remove?: (id: string, cb: () => void) => void;
    removeTree?: (id: string, cb: () => void) => void;
    create?: (
      bookmark: { parentId: string; title: string; url?: string },
      cb: (result: ChromeBookmarkNode) => void
    ) => void;
    update?: (
      id: string,
      changes: { title?: string; url?: string },
      cb: (result: ChromeBookmarkNode) => void
    ) => void;
    move?: (
      id: string,
      destination: { parentId?: string; index?: number },
      cb: (result: ChromeBookmarkNode) => void
    ) => void;
  };
  storage?: {
    sync?: {
      get: (keys: string[] | string, cb: (items: Record<string, unknown>) => void) => void;
      set: (items: Record<string, unknown>, cb: () => void) => void;
      remove?: (keys: string[], cb: () => void) => void;
    };
  };
  history?: {
    search: (
      query: {
        text: string;
        startTime?: number;
        endTime?: number;
        maxResults: number;
      },
      cb: (items: ChromeHistoryItem[]) => void
    ) => void;
  };
  runtime?: {
    lastError?: { message?: string };
  };
};

export function getChrome(): ChromeLike | undefined {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c = (globalThis as any)?.chrome as ChromeLike | undefined;
  return c;
}

export function hasChromeBookmarks(): boolean {
  const c = getChrome();
  return !!c?.bookmarks?.getTree;
}

export function hasChromeStorageSync(): boolean {
  const c = getChrome();
  return !!c?.storage?.sync?.get && !!c?.storage?.sync?.set;
}

export function hasChromeHistory(): boolean {
  const c = getChrome();
  return !!c?.history?.search;
}
