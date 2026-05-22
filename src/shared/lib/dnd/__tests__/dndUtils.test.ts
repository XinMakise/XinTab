import { describe, expect, it } from "vitest";

import {
  dndContainerId,
  dndLinkId,
  parseDndContainerId,
  parseDndLinkId,
  parseQeBookmarkLinkId,
  parseQeManualCategoryId,
  parseQeNavLinkId,
  parseRecentVisitLinkId,
  qeBookmarkLinkId,
  qeManualCategoryId,
  qeNavLinkId,
  recentVisitLinkId,
} from "@/shared/lib/dnd/dndUtils";

describe("dndUtils", () => {
  it("builds and parses standard drag identifiers", () => {
    expect(dndContainerId("cat-a")).toBe("cat:cat-a");
    expect(dndLinkId("link-a")).toBe("link:link-a");
    expect(parseDndContainerId("cat:cat-a")).toBe("cat-a");
    expect(parseDndLinkId("link:link-a")).toBe("link-a");
  });

  it("builds and parses quick edit identifiers", () => {
    expect(qeManualCategoryId("manual-a")).toBe("qe-manual-cat:manual-a");
    expect(qeBookmarkLinkId("bookmark-a")).toBe("qe-bm-link:bookmark-a");
    expect(qeNavLinkId("manual-a", "link-a")).toBe("qe-nav-link:manual-a:link-a");

    expect(parseQeManualCategoryId("qe-manual-cat:manual-a")).toBe("manual-a");
    expect(parseQeBookmarkLinkId("qe-bm-link:bookmark-a")).toBe("bookmark-a");
    expect(parseQeNavLinkId("qe-nav-link:manual-a:link-a")).toEqual({
      categoryId: "manual-a",
      linkId: "link-a",
    });

    expect(recentVisitLinkId("https://github.com")).toBe("recent-link:https://github.com");
    expect(parseRecentVisitLinkId("recent-link:https://github.com")).toBe("https://github.com");
  });

  it("returns null for invalid identifiers", () => {
    expect(parseDndContainerId("link:test")).toBeNull();
    expect(parseDndLinkId("cat:test")).toBeNull();
    expect(parseQeManualCategoryId("manual-a")).toBeNull();
    expect(parseQeBookmarkLinkId("bookmark-a")).toBeNull();
    expect(parseQeNavLinkId("qe-nav-link:missing-separator")).toBeNull();
    expect(parseRecentVisitLinkId("recent:https://github.com")).toBeNull();
  });
});
