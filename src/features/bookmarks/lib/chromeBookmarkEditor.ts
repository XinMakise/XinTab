import { getChrome, hasChromeBookmarks } from "@/shared/browser/chrome";

/**
 * Remove a bookmark from Chrome bookmarks
 */
export async function removeBookmark(bookmarkId: string): Promise<void> {
  if (!hasChromeBookmarks()) {
    throw new Error("Chrome bookmarks API is not available");
  }

  const chrome = getChrome();
  return new Promise((resolve, reject) => {
    chrome!.bookmarks!.remove?.(bookmarkId, () => {
      if (chrome?.runtime?.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve();
      }
    });
  });
}

/**
 * Create a new bookmark in a folder
 */
export async function createBookmark(
  parentId: string,
  title: string,
  url: string,
): Promise<{ id: string }> {
  if (!hasChromeBookmarks()) {
    throw new Error("Chrome bookmarks API is not available");
  }

  const chrome = getChrome();
  return new Promise((resolve, reject) => {
    chrome!.bookmarks!.create?.({ parentId, title, url }, (result) => {
      if (chrome?.runtime?.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(result as { id: string });
      }
    });
  });
}

/**
 * Create a new bookmark folder
 */
export async function createBookmarkFolder(
  parentId: string,
  title: string,
): Promise<{ id: string }> {
  if (!hasChromeBookmarks()) {
    throw new Error("Chrome bookmarks API is not available");
  }

  const chrome = getChrome();
  return new Promise((resolve, reject) => {
    chrome!.bookmarks!.create?.({ parentId, title }, (result) => {
      if (chrome?.runtime?.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(result as { id: string });
      }
    });
  });
}

/**
 * Update a bookmark or folder
 */
export async function updateBookmark(
  bookmarkId: string,
  changes: { title?: string; url?: string },
): Promise<void> {
  if (!hasChromeBookmarks()) {
    throw new Error("Chrome bookmarks API is not available");
  }

  const chrome = getChrome();
  return new Promise((resolve, reject) => {
    chrome!.bookmarks!.update?.(bookmarkId, changes, () => {
      if (chrome?.runtime?.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve();
      }
    });
  });
}

/**
 * Move a bookmark to another folder (or reorder in the same folder)
 */
export async function moveBookmark(
  bookmarkId: string,
  destination: { parentId?: string; index?: number },
): Promise<void> {
  if (!hasChromeBookmarks()) {
    throw new Error("Chrome bookmarks API is not available");
  }

  const chrome = getChrome();
  return new Promise((resolve, reject) => {
    chrome!.bookmarks!.move?.(bookmarkId, destination, () => {
      if (chrome?.runtime?.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve();
      }
    });
  });
}

/**
 * Remove a bookmark folder (will fail if not empty)
 */
export async function removeBookmarkFolder(folderId: string): Promise<void> {
  if (!hasChromeBookmarks()) {
    throw new Error("Chrome bookmarks API is not available");
  }

  const chrome = getChrome();
  return new Promise((resolve, reject) => {
    chrome!.bookmarks!.removeTree?.(folderId, () => {
      if (chrome?.runtime?.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve();
      }
    });
  });
}
