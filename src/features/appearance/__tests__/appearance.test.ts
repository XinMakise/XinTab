import { describe, expect, it } from "vitest";

import { applyAppearance, defaultAppearance } from "@/features/appearance";

describe("appearance", () => {
  it("uses the bundled default appearance settings", () => {
    expect(defaultAppearance()).toMatchObject({
      mode: "preset",
      themeMode: "dark",
      presetGroupId: "rose_pine",
      radiusRem: 1.25,
      fontScale: 1,
      font: "crimson_pro",
      cardOpacity: 0.5,
      categoryButtonOpacity: 1,
      cardMaterial: "transparent",
      categoryContainerEnabled: true,
      leftCategoryWidthPx: 120,
      topNavOpacity: 0.1,
      topNavMaterial: "transparent",
      searchBarOpacity: 0.3,
      searchBarMaterial: "transparent",
      backgroundImageKey: null,
    });
  });

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
