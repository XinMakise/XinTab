import { describe, expect, it } from "vitest";

import { applyAppearance, defaultAppearance } from "@/features/appearance";

describe("appearance", () => {
  it("clamps and applies the category width css variable", () => {
    applyAppearance({
      ...defaultAppearance(),
      leftCategoryWidthPx: 240,
    });

    expect(
      document.documentElement.style.getPropertyValue("--app-left-category-width"),
    ).toBe("220px");
  });

  it("applies the category button opacity css variable", () => {
    applyAppearance({
      ...defaultAppearance(),
      categoryButtonOpacity: 0.42,
    });

    expect(
      document.documentElement.style.getPropertyValue("--app-category-button-opacity"),
    ).toBe("0.42");
  });

  it("defaults invalid category button opacity values and clamps the bounds", () => {
    applyAppearance({
      ...defaultAppearance(),
      categoryButtonOpacity: Number.NaN,
    });

    expect(
      document.documentElement.style.getPropertyValue("--app-category-button-opacity"),
    ).toBe("1");

    applyAppearance({
      ...defaultAppearance(),
      categoryButtonOpacity: -1,
    });

    expect(
      document.documentElement.style.getPropertyValue("--app-category-button-opacity"),
    ).toBe("0");
  });
});
