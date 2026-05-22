import { afterEach, describe, expect, it } from "vitest";

import type { ChromeHistoryItem, ChromeLike } from "@/shared/browser/chrome";
import {
  RECENT_VISITS_LIMIT,
  RECENT_VISITS_MAX,
  formatRecentVisitTime,
  formatRecentVisitUrl,
  getRecentVisitItems,
  normalizeRecentVisitItems,
} from "@/features/recent-visits";

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

describe("recentVisits", () => {
  it("filters non-http urls, deduplicates by exact hostname, and keeps the newest items first", () => {
    const items: ChromeHistoryItem[] = [
      {
        url: "https://github.com/openai/openai",
        title: "OpenAI Repo",
        lastVisitTime: 3_000,
      },
      {
        url: "https://github.com/docs",
        title: "GitHub Docs",
        lastVisitTime: 2_000,
      },
      {
        url: "http://github.com/features",
        title: "GitHub Features",
        lastVisitTime: 3_500,
      },
      {
        url: "https://docs.github.com/en",
        title: "Docs",
        lastVisitTime: 2_500,
      },
      {
        url: "chrome://settings",
        title: "Settings",
        lastVisitTime: 4_000,
      },
      {
        url: "https://developer.mozilla.org/en-US/docs",
        title: "",
        lastVisitTime: 1_500,
      },
    ];

    expect(normalizeRecentVisitItems(items, RECENT_VISITS_LIMIT)).toEqual([
      {
        id: "github.com",
        title: "GitHub Features",
        url: "http://github.com/features",
        origin: "http://github.com",
        lastVisitedAt: 3_500,
      },
      {
        id: "docs.github.com",
        title: "Docs",
        url: "https://docs.github.com/en",
        origin: "https://docs.github.com",
        lastVisitedAt: 2_500,
      },
      {
        id: "developer.mozilla.org",
        title: "developer.mozilla.org/en-US",
        url: "https://developer.mozilla.org/en-US/docs",
        origin: "https://developer.mozilla.org",
        lastVisitedAt: 1_500,
      },
    ]);
  });

  it("queries chrome history and returns normalized recent visits", async () => {
    const chrome: ChromeLike = {
      runtime: {},
      history: {
        search: (_query, callback) => {
          callback([
            {
              url: "https://react.dev/learn",
              title: "Learn React",
              lastVisitTime: 7_000,
            },
            {
              url: "https://react.dev/blog",
              title: "React Blog",
              lastVisitTime: 6_000,
            },
            {
              url: "https://vite.dev/guide/",
              title: "Vite Guide",
              lastVisitTime: 5_000,
            },
          ]);
        },
      },
    };

    setGlobalChrome(chrome);

    await expect(getRecentVisitItems(10)).resolves.toEqual([
      {
        id: "react.dev",
        title: "Learn React",
        url: "https://react.dev/learn",
        origin: "https://react.dev",
        lastVisitedAt: 7_000,
      },
      {
        id: "vite.dev",
        title: "Vite Guide",
        url: "https://vite.dev/guide/",
        origin: "https://vite.dev",
        lastVisitedAt: 5_000,
      },
    ]);
  });

  it("over-fetches raw history so repeated same-domain pages do not collapse the card list", async () => {
    let requestedMaxResults: number | undefined;
    const chrome: ChromeLike = {
      runtime: {},
      history: {
        search: (query, callback) => {
          requestedMaxResults = query.maxResults;

          if (query.maxResults <= 3) {
            callback([
              {
                url: "https://openai.com/a",
                title: "A",
                lastVisitTime: 9_000,
              },
              {
                url: "https://openai.com/b",
                title: "B",
                lastVisitTime: 8_000,
              },
              {
                url: "https://openai.com/c",
                title: "C",
                lastVisitTime: 7_000,
              },
            ]);
            return;
          }

          callback([
            {
              url: "https://openai.com/a",
              title: "A",
              lastVisitTime: 9_000,
            },
            {
              url: "https://openai.com/b",
              title: "B",
              lastVisitTime: 8_000,
            },
            {
              url: "https://openai.com/c",
              title: "C",
              lastVisitTime: 7_000,
            },
            {
              url: "https://react.dev/learn",
              title: "React",
              lastVisitTime: 6_000,
            },
            {
              url: "https://vite.dev/guide",
              title: "Vite",
              lastVisitTime: 5_000,
            },
          ]);
        },
      },
    };

    setGlobalChrome(chrome);

    await expect(getRecentVisitItems(3)).resolves.toEqual([
      {
        id: "openai.com",
        title: "A",
        url: "https://openai.com/a",
        origin: "https://openai.com",
        lastVisitedAt: 9_000,
      },
      {
        id: "react.dev",
        title: "React",
        url: "https://react.dev/learn",
        origin: "https://react.dev",
        lastVisitedAt: 6_000,
      },
      {
        id: "vite.dev",
        title: "Vite",
        url: "https://vite.dev/guide",
        origin: "https://vite.dev",
        lastVisitedAt: 5_000,
      },
    ]);
    expect(requestedMaxResults).toBeGreaterThan(3);
  });

  it("supports fetching more than the visible cap for homepage backfill", async () => {
    let requestedMaxResults: number | undefined;
    const chrome: ChromeLike = {
      runtime: {},
      history: {
        search: (query, callback) => {
          requestedMaxResults = query.maxResults;
          callback(
            Array.from({ length: RECENT_VISITS_MAX + 1 }, (_, index) => ({
              url: `https://site-${index}.example/page`,
              title: `Site ${index}`,
              lastVisitTime: 10_000 - index,
            })),
          );
        },
      },
    };

    setGlobalChrome(chrome);

    await expect(getRecentVisitItems(RECENT_VISITS_MAX + 1)).resolves.toHaveLength(
      RECENT_VISITS_MAX + 1,
    );
    expect(requestedMaxResults).toBeGreaterThanOrEqual(RECENT_VISITS_MAX + 1);
  });

  it("formats visit meta for the card subtitle", () => {
    expect(formatRecentVisitUrl("https://docs.github.com/en/actions?query=1#top")).toBe(
      "docs.github.com/en/actions",
    );
    expect(formatRecentVisitTime(60_000, 90_000)).toBe("刚刚");
    expect(formatRecentVisitTime(60_000, 180_000)).toBe("2 分钟前");
  });
});
