import { getChrome, hasChromeStorageSync } from "./chrome";

// chrome.storage.sync 限制
const SYNC_QUOTA_BYTES_PER_ITEM = 8192; // 单个 key 最大 8KB

export class StorageQuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StorageQuotaError";
  }
}

/**
 * 估算 JSON 序列化后的字节大小
 */
function estimateBytes(value: unknown): number {
  const json = JSON.stringify(value);
  // UTF-8 编码，中文字符约 3 字节
  return new Blob([json]).size;
}

export const storage = {
  async get<T>(key: string): Promise<T | null> {
    if (hasChromeStorageSync()) {
      const c = getChrome();
      return await new Promise((resolve, reject) => {
        c!.storage!.sync!.get([key], (items) => {
          if (c?.runtime?.lastError) {
            reject(new Error(c.runtime.lastError.message));
            return;
          }
          resolve((items?.[key] as T) ?? null);
        });
      });
    }

    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  async set<T>(key: string, value: T): Promise<void> {
    if (hasChromeStorageSync()) {
      const bytes = estimateBytes(value);
      // 检查单项配额
      if (bytes > SYNC_QUOTA_BYTES_PER_ITEM) {
        throw new StorageQuotaError(
          `数据过大 (${Math.round(bytes / 1024)}KB)，超过 chrome.storage.sync 单项限制 (8KB)。`
        );
      }

      const c = getChrome();
      await new Promise<void>((resolve, reject) => {
        c!.storage!.sync!.set({ [key]: value }, () => {
          if (c?.runtime?.lastError) {
            const msg = c.runtime.lastError.message ?? "存储失败";
            // 检测配额错误
            if (msg.includes("QUOTA") || msg.includes("quota")) {
              reject(new StorageQuotaError(`存储配额不足: ${msg}`));
            } else {
              reject(new Error(msg));
            }
            return;
          }
          resolve();
        });
      });
      return;
    }

    // localStorage 通常有 5MB 限制
    try {
      const json = JSON.stringify(value);
      localStorage.setItem(key, json);
    } catch (e) {
      if (e instanceof DOMException && e.name === "QuotaExceededError") {
        throw new StorageQuotaError("localStorage 存储空间不足");
      }
      throw e;
    }
  },

  /**
   * 删除指定 key
   */
  async remove(key: string): Promise<void> {
    if (hasChromeStorageSync()) {
      const c = getChrome();
      await new Promise<void>((resolve) => {
        // chrome.storage.sync.remove 需要在 chrome.ts 中添加类型
        (c!.storage!.sync as { remove?: (keys: string[], cb: () => void) => void })
          .remove?.([key], () => resolve());
      });
      return;
    }
    localStorage.removeItem(key);
  },
};
