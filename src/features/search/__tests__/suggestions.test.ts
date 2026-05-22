import { afterEach, beforeEach, describe, expect, it } from "vitest";

import type { ChromeLike } from "../../../shared/browser/chrome";
import {
  dedupeSuggestionCollections,
  formatSuggestionUrl,
  getSuggestionDedupKey,
  getSuggestionSiteKey,
  getSuggestionScore,
  searchBookmarkSuggestions,
  searchHistorySuggestions,
} from "../lib/suggestions";

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

beforeEach(() => {
  setGlobalChrome(undefined);
});

afterEach(() => {
  setGlobalChrome(originalChrome);
});

describe("search suggestions helpers", () => {
  it("formats URLs for compact suggestion display", () => {
    expect(formatSuggestionUrl("https://www.github.com/openai/")).toBe("www.github.com/openai");
    expect(formatSuggestionUrl("not-a-url")).toBe("not-a-url");
  });

  it("builds stable dedup keys for paginated and tracked URLs", () => {
    expect(getSuggestionDedupKey("https://www.linux.do/t/topic/2127682/3?utm_source=test#top")).toBe(
      "linux.do/t/topic/2127682",
    );
    expect(getSuggestionDedupKey("https://docs.example.com/page/2?ref=nav&lang=zh")).toBe(
      "docs.example.com?lang=zh",
    );
  });

  it("derives a shared site key for subdomains", () => {
    expect(getSuggestionSiteKey("https://chat.z.ai/c/abc")).toBe("z.ai");
    expect(getSuggestionSiteKey("https://z.ai/login/callback")).toBe("z.ai");
    expect(getSuggestionSiteKey("https://zh.z-library.sk/s/book")).toBe("z-library.sk");
  });

  it("scores title prefix matches above URL-only matches", () => {
    const titlePrefixScore = getSuggestionScore("git", {
      title: "GitHub",
      url: "https://example.com/page",
      subtitle: "example.com/page",
    });
    const urlOnlyScore = getSuggestionScore("git", {
      title: "Portal",
      url: "https://git.example.com/page",
      subtitle: "git.example.com/page",
    });

    expect(titlePrefixScore).toBeGreaterThan(urlOnlyScore);
  });

  it("deduplicates within each source and prefers bookmarks across sources", () => {
    const deduped = dedupeSuggestionCollections(
      [
        {
          id: "history:thread-page",
          source: "history",
          title: "LINUX DO Thread",
          url: "https://linux.do/t/topic/2127682/3",
          subtitle: "linux.do/t/topic/2127682/3",
          lastVisitedAt: 30,
        },
        {
          id: "history:thread-root",
          source: "history",
          title: "LINUX DO Thread",
          url: "https://linux.do/t/topic/2127682",
          subtitle: "linux.do/t/topic/2127682",
          lastVisitedAt: 20,
        },
        {
          id: "history:unique",
          source: "history",
          title: "Unique History",
          url: "https://news.example.com/posts/42",
          subtitle: "news.example.com/posts/42",
          lastVisitedAt: 10,
        },
      ],
      [
        {
          id: "bookmark:thread",
          source: "bookmark",
          title: "Saved Thread",
          url: "https://linux.do/t/topic/2127682/2",
          subtitle: "linux.do/t/topic/2127682/2",
        },
        {
          id: "bookmark:guide",
          source: "bookmark",
          title: "Docs Guide",
          url: "https://docs.example.com/guide",
          subtitle: "docs.example.com/guide",
        },
        {
          id: "bookmark:guide-tracked",
          source: "bookmark",
          title: "Docs Guide Duplicate",
          url: "https://docs.example.com/guide?utm_source=mail",
          subtitle: "docs.example.com/guide?utm_source=mail",
        },
      ],
    );

    expect(deduped.historySuggestions.map((item) => item.id)).toEqual(["history:unique"]);
    expect(deduped.bookmarkSuggestions.map((item) => item.id)).toEqual([
      "bookmark:thread",
      "bookmark:guide",
    ]);
    expect(deduped.suggestions.map((item) => item.id)).toEqual([
      "history:unique",
      "bookmark:thread",
      "bookmark:guide",
    ]);
  });

  it("deduplicates noisy same-site suggestions by site key and title fingerprint", () => {
    const deduped = dedupeSuggestionCollections(
      [
        {
          id: "history:z-chat-1",
          source: "history",
          title: "Z.ai - Free AI Chatbot & Agent powered by GLM-5.1 & GLM-5",
          url: "https://chat.z.ai/c/60fb121d-70c5-47f4-985b-39d7b6aa070e",
          subtitle: "chat.z.ai/c/60fb121d-70c5-47f4-985b-39d7b6aa070e",
          lastVisitedAt: 20,
          visitCount: 4,
          typedCount: 1,
        },
        {
          id: "history:z-chat-2",
          source: "history",
          title: "Z.ai - Free AI Chatbot & Agent powered by GLM-5.1 & GLM-5",
          url: "https://chat.z.ai/c/4e55ab49-a83c-4356-b572-a63be4dd4073",
          subtitle: "chat.z.ai/c/4e55ab49-a83c-4356-b572-a63be4dd4073",
          lastVisitedAt: 18,
          visitCount: 3,
          typedCount: 0,
        },
        {
          id: "history:z-login",
          source: "history",
          title: "Z.ai - Inspiring AGI to Benefit Humanity",
          url: "https://z.ai/login/callback",
          subtitle: "z.ai/login/callback",
          lastVisitedAt: 19,
          visitCount: 1,
          typedCount: 0,
        },
        {
          id: "history:zlibrary-home",
          source: "history",
          title: "Z-Library – 世界上最大的电子图书馆。自由访问知识和文化。",
          url: "https://zh.z-library.sk",
          subtitle: "zh.z-library.sk",
          lastVisitedAt: 14,
          visitCount: 4,
          typedCount: 1,
        },
        {
          id: "history:zlibrary-search",
          source: "history",
          title: "Z-Library – 世界上最大的电子图书馆。自由访问知识和文化。",
          url: "https://zh.z-library.sk/s/%E5%8D%A2%E5%85%8B%E6%B4%9B%E5%A4%AB",
          subtitle: "zh.z-library.sk/s/%E5%8D%A2%E5%85%8B%E6%B4%9B%E5%A4%AB",
          lastVisitedAt: 13,
          visitCount: 2,
          typedCount: 0,
        },
      ],
      [],
    );

    expect(deduped.historySuggestions.map((item) => item.id)).toEqual([
      "history:z-chat-1",
      "history:zlibrary-home",
    ]);
  });

  it("keeps same-site suggestions with genuinely different titles", () => {
    const deduped = dedupeSuggestionCollections(
      [
        {
          id: "history:github-repo",
          source: "history",
          title: "openai/openai-agents-python",
          url: "https://github.com/openai/openai-agents-python",
          subtitle: "github.com/openai/openai-agents-python",
          lastVisitedAt: 10,
          visitCount: 2,
          typedCount: 0,
        },
        {
          id: "history:github-docs",
          source: "history",
          title: "GitHub Docs",
          url: "https://github.com/docs",
          subtitle: "github.com/docs",
          lastVisitedAt: 9,
          visitCount: 3,
          typedCount: 0,
        },
      ],
      [],
    );

    expect(deduped.historySuggestions.map((item) => item.id)).toEqual([
      "history:github-repo",
      "history:github-docs",
    ]);
  });
});

describe("searchHistorySuggestions", () => {
  it("returns ranked history suggestions, filters unsupported URLs, and collapses noisy same-site pages", async () => {
    const chrome: ChromeLike = {
      runtime: {},
      history: {
        search: (_query, cb) => {
          cb([
            { title: "Git LINUX DO Thread", url: "https://linux.do/t/topic/2127682/3", lastVisitTime: 12 },
            { title: "Git LINUX DO Thread", url: "https://linux.do/t/topic/2127682/2", lastVisitTime: 11 },
            { title: "Git LINUX DO Thread", url: "https://linux.do/t/topic/2127682", lastVisitTime: 10 },
            { title: "Alpha", url: "https://alpha.example.com/git", lastVisitTime: 5 },
            { title: "GitHub", url: "https://github.com/openai", lastVisitTime: 10 },
            { title: "Guide", url: "https://git-scm.com/docs", lastVisitTime: 3 },
            { title: "Ignore", url: "chrome://history", lastVisitTime: 100 },
            { title: "GitHub Duplicate", url: "https://github.com/openai", lastVisitTime: 1 },
            { title: "Z.ai - Free AI Chatbot & Agent powered by GLM-5.1 & GLM-5", url: "https://chat.z.ai/c/abc-123-xyz", lastVisitTime: 8 },
            { title: "Z.ai - Free AI Chatbot & Agent powered by GLM-5.1 & GLM-5", url: "https://chat.z.ai/c/def-456-xyz", lastVisitTime: 7 },
          ]);
        },
      },
    };

    setGlobalChrome(chrome);

    const results = await searchHistorySuggestions("git", 5);

    expect(results).toHaveLength(5);
    expect(results.map((item) => item.url)).toContain("https://linux.do/t/topic/2127682/3");
    expect(results.map((item) => item.url)).toContain("https://github.com/openai");
    expect(results.map((item) => item.url)).toContain("https://chat.z.ai/c/abc-123-xyz");
    expect(results.map((item) => item.url)).toContain("https://git-scm.com/docs");
    expect(results.map((item) => item.url)).toContain("https://alpha.example.com/git");
  });

  it("returns empty results for blank queries", async () => {
    const chrome: ChromeLike = {
      runtime: {},
      history: {
        search: () => {
          throw new Error("history.search should not be called");
        },
      },
    };

    setGlobalChrome(chrome);

    await expect(searchHistorySuggestions("   ")).resolves.toEqual([]);
  });
});

describe("searchBookmarkSuggestions", () => {
  it("filters folders, deduplicates repeated bookmarks, and collapses noisy same-site duplicates", async () => {
    const chrome: ChromeLike = {
      runtime: {},
      bookmarks: {
        getTree: () => {},
        search: (_query, cb) => {
          cb([
            { id: "folder", title: "Docs Folder" },
            { id: "1", title: "Docs Portal", url: "https://portal.example.com" },
            { id: "1-dup", title: "Docs Portal Duplicate", url: "https://portal.example.com?utm_source=mail" },
            { id: "2", title: "Reference", url: "https://example.com/docs/reference" },
            { id: "z-1", title: "Z-Library – 世界上最大的电子图书馆。自由访问知识和文化。", url: "https://zh.z-library.sk" },
            { id: "z-2", title: "Z-Library – 世界上最大的电子图书馆。自由访问知识和文化。", url: "https://zh.z-library.sk/s/book" },
          ]);
        },
      },
    };

    setGlobalChrome(chrome);

    const results = await searchBookmarkSuggestions("docs", 5);

    expect(results).toHaveLength(3);
    expect(results.map((item) => item.id)).toContain("bookmark:1");
    expect(results.map((item) => item.id)).toContain("bookmark:z-1");
    expect(results.map((item) => item.id)).toContain("bookmark:2");
    expect(results.every((item) => item.source === "bookmark")).toBe(true);
  });
});
