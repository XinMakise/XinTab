import { afterEach, beforeEach, describe, expect, it } from "vitest";

import type { ChromeLike } from "@/shared/browser/chrome";
import { StorageQuotaError, storage } from "@/shared/browser/storage";

const chromeHost = globalThis as typeof globalThis & { chrome?: ChromeLike };
const originalChrome = chromeHost.chrome;

function setGlobalChrome(chrome: ChromeLike | undefined) {
  if (chrome === undefined) {
    delete chromeHost.chrome;
    return;
  }

  Object.defineProperty(globalThis, "chrome", {
    configurable: true,
    writable: true,
    value: chrome,
  });
}

function createChromeStorageMock(): {
  chrome: ChromeLike;
  store: Record<string, unknown>;
} {
  const store: Record<string, unknown> = {};

  const chrome: ChromeLike = {
    runtime: {},
    storage: {
      sync: {
        get: (keys, cb) => {
          const requestedKeys = Array.isArray(keys) ? keys : [keys];
          const result: Record<string, unknown> = {};

          for (const key of requestedKeys) {
            if (key in store) {
              result[key] = store[key];
            }
          }

          cb(result);
        },
        set: (items, cb) => {
          Object.assign(store, items);
          cb();
        },
        remove: (keys, cb) => {
          for (const key of keys) {
            delete store[key];
          }
          cb();
        },
      },
    },
  };

  return { chrome, store };
}

beforeEach(() => {
  localStorage.clear();
  setGlobalChrome(undefined);
});

afterEach(() => {
  localStorage.clear();
  setGlobalChrome(originalChrome);
});

describe("storage", () => {
  it("reads and writes localStorage when chrome sync is unavailable", async () => {
    await storage.set("prefs", { theme: "light" });

    expect(localStorage.getItem("prefs")).toBe(JSON.stringify({ theme: "light" }));
    await expect(storage.get<{ theme: string }>("prefs")).resolves.toEqual({ theme: "light" });

    await storage.remove("prefs");

    expect(localStorage.getItem("prefs")).toBeNull();
  });

  it("returns null for invalid localStorage JSON", async () => {
    localStorage.setItem("broken", "{");

    await expect(storage.get("broken")).resolves.toBeNull();
  });

  it("uses chrome.storage.sync when available", async () => {
    const { chrome, store } = createChromeStorageMock();
    setGlobalChrome(chrome);

    await storage.set("prefs", { theme: "dark" });
    await expect(storage.get<{ theme: string }>("prefs")).resolves.toEqual({ theme: "dark" });

    expect(store.prefs).toEqual({ theme: "dark" });

    await storage.remove("prefs");

    expect(store.prefs).toBeUndefined();
  });

  it("throws StorageQuotaError when a chrome sync item exceeds the per-item limit", async () => {
    const { chrome } = createChromeStorageMock();
    setGlobalChrome(chrome);

    const oversizedPayload = { value: "中".repeat(4000) };

    await expect(storage.set("oversized", oversizedPayload)).rejects.toBeInstanceOf(StorageQuotaError);
  });
});
