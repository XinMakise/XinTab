import { beforeEach, describe, expect, it } from "vitest";

import {
  buildAutoSiteIconCandidates,
  clearCachedAutoSiteIconSrc,
  getAutoSiteIconCacheKey,
  getCachedAutoSiteIconSrc,
  setCachedAutoSiteIconSrc,
} from "@/entities/link";

beforeEach(() => {
  localStorage.clear();
  clearCachedAutoSiteIconSrc();
});

describe("siteIcon", () => {
  it("builds multiple auto icon candidates for a site url", () => {
    const candidates = buildAutoSiteIconCandidates("github.com");

    expect(candidates).toContain("https://github.com/favicon.ico");
    expect(candidates).toContain("https://www.google.com/s2/favicons?domain=github.com&sz=128");
    expect(candidates).toContain("https://icons.duckduckgo.com/ip3/github.com.ico");
    expect(candidates).toContain("https://favicon.im/github.com?larger=true");
    expect(candidates).toContain("https://logo.clearbit.com/github.com");
  });

  it("includes apex-domain fallback candidates for subdomains", () => {
    const candidates = buildAutoSiteIconCandidates("https://docs.github.com/en");

    expect(candidates).toContain("https://docs.github.com/favicon.ico");
    expect(candidates).toContain("https://github.com/favicon.ico");
    expect(candidates).toContain("https://www.google.com/s2/favicons?domain=docs.github.com&sz=128");
    expect(candidates).toContain("https://www.google.com/s2/favicons?domain=github.com&sz=128");
  });

  it("adds host-specific icon candidates for qianwen", () => {
    const candidates = buildAutoSiteIconCandidates("https://www.qianwen.com/chat");

    expect(candidates).toContain(
      "https://img.alicdn.com/imgextra/i4/O1CN01uar8u91DHWktnF2fl_!!6000000000191-2-tps-110-110.png",
    );
  });

  it("uses normalized hostname as the cache key", () => {
    expect(getAutoSiteIconCacheKey("https://www.github.com/openai")).toBe("github.com");
    expect(getAutoSiteIconCacheKey("not a url")).toBe("not a url");
  });

  it("persists successful icon sources in the local cache", () => {
    expect(getCachedAutoSiteIconSrc("github.com")).toBeUndefined();

    setCachedAutoSiteIconSrc("github.com", "https://www.google.com/s2/favicons?domain=github.com&sz=64");

    expect(getCachedAutoSiteIconSrc("github.com")).toBe(
      "https://www.google.com/s2/favicons?domain=github.com&sz=64",
    );
  });

  it("allows refreshing cached source when a better source is found", () => {
    setCachedAutoSiteIconSrc("github.com", "https://icons.duckduckgo.com/ip3/github.com.ico");
    setCachedAutoSiteIconSrc("github.com", "https://github.com/favicon.ico");

    expect(getCachedAutoSiteIconSrc("github.com")).toBe(
      "https://github.com/favicon.ico",
    );
  });
});

