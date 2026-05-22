import { afterEach, describe, expect, it } from "vitest";

import {
  getChrome,
  hasChromeBookmarks,
  hasChromeHistory,
  hasChromeStorageSync,
  type ChromeLike,
} from "@/shared/browser/chrome";

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

afterEach(() => {
  setGlobalChrome(originalChrome);
});

describe("chrome runtime guards", () => {
  it("returns undefined when chrome is unavailable", () => {
    setGlobalChrome(undefined);

    expect(getChrome()).toBeUndefined();
    expect(hasChromeBookmarks()).toBe(false);
    expect(hasChromeHistory()).toBe(false);
    expect(hasChromeStorageSync()).toBe(false);
  });

  it("detects bookmarks, history, and storage capabilities from the global chrome object", () => {
    const chrome: ChromeLike = {
      bookmarks: {
        getTree: () => {},
      },
      history: {
        search: () => {},
      },
      storage: {
        sync: {
          get: () => {},
          set: () => {},
        },
      },
    };

    setGlobalChrome(chrome);

    expect(getChrome()).toBe(chrome);
    expect(hasChromeBookmarks()).toBe(true);
    expect(hasChromeHistory()).toBe(true);
    expect(hasChromeStorageSync()).toBe(true);
  });
});
