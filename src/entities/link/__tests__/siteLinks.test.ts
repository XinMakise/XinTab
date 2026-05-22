import { describe, expect, it } from "vitest";

import {
  getSiteIconTextLayout,
  getSuggestedSiteIconText,
  isCustomSiteTitle,
  normalizeSiteLinkIcon,
  normalizeSiteUrl,
} from "@/entities/link";

describe("siteLinks", () => {
  it("normalizes bare domains into https urls", () => {
    expect(normalizeSiteUrl("github.com")).toBe("https://github.com");
    expect(normalizeSiteUrl(" https://openai.com ")).toBe("https://openai.com");
    expect(normalizeSiteUrl("")).toBe("");
  });

  it("detects whether a title differs from the suggested site title", () => {
    expect(isCustomSiteTitle("github", "https://github.com")).toBe(false);
    expect(isCustomSiteTitle("GitHub Docs", "https://github.com")).toBe(true);
    expect(isCustomSiteTitle("", "https://github.com")).toBe(false);
  });

  it("builds readable fallback text for icon badges", () => {
    expect(getSuggestedSiteIconText("GitHub")).toBe("G");
    expect(getSuggestedSiteIconText("Notion Docs")).toBe("ND");
    expect(getSuggestedSiteIconText("收藏夹")).toBe("收藏");
  });

  it("uses compact typography for wide glyph icon text", () => {
    const chinese = getSiteIconTextLayout("收藏");
    const english = getSiteIconTextLayout("ND");

    expect(chinese.fontScale).toBeLessThan(english.fontScale);
    expect(chinese.letterSpacing).toBe("-0.08em");
    expect(chinese.fontWeight).toBe(700);
  });

  it("normalizes preset and text icon configs", () => {
    expect(
      normalizeSiteLinkIcon({ type: "preset", name: "globe", color: "0f766e" }),
    ).toEqual({
      type: "preset",
      name: "globe",
      color: "#0F766E",
    });

    expect(
      normalizeSiteLinkIcon({ type: "text", text: "gh", color: "#2563eb" }),
    ).toEqual({
      type: "text",
      text: "GH",
      color: "#2563EB",
    });

    expect(normalizeSiteLinkIcon({ type: "text", text: "   " })).toBeUndefined();
  });
});

