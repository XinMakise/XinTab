import { describe, expect, it } from "vitest";

import { getResponsiveGridTemplateColumns } from "@/shared/lib/standard-page/useResponsiveGridStyle";

describe("getResponsiveGridTemplateColumns", () => {
  it("keeps the configured columns when the container is wide enough", () => {
    expect(getResponsiveGridTemplateColumns(747, 5)).toBe(
      "repeat(auto-fill, minmax(min(100%, 80px), 139px))",
    );
  });

  it("stops shrinking cards below the minimum width and lets the grid wrap", () => {
    expect(getResponsiveGridTemplateColumns(345, 5)).toBe(
      "repeat(auto-fill, minmax(min(100%, 80px), 80px))",
    );
  });

  it("falls back to equal-width columns before the container is measured", () => {
    expect(getResponsiveGridTemplateColumns(0, 5)).toBe(
      "repeat(5, minmax(0, 1fr))",
    );
  });
});
