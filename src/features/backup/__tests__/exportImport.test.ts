import { beforeEach, describe, expect, it, vi } from "vitest";

import { SEARCH_SETTINGS_KEY, SEARCH_SUGGESTIONS_OPACITY_DEFAULT } from "@/features/search";

const storageSetMock = vi.fn();
const saveAppearanceMock = vi.fn();
const setCurrentAppearanceMock = vi.fn();

vi.mock("@/shared/browser/storage", () => ({
  storage: {
    set: (...args: Parameters<typeof storageSetMock>) => storageSetMock(...args),
    get: vi.fn(),
  },
}));

vi.mock("@/features/appearance", () => ({
  defaultAppearance: () => ({
    mode: "preset",
    themeMode: "light",
    presetGroupId: "default",
    custom: {
      backgroundHex: "#ffffff",
      foregroundHex: "#111111",
      primaryHex: "#222222",
    },
    radiusRem: 0,
    fontScale: 1,
    font: "dm_sans",
    cardOpacity: 1,
    categoryButtonOpacity: 1,
    cardMaterial: "transparent",
    categoryContainerEnabled: true,
    topNavOpacity: 0.8,
    topNavMaterial: "blur",
    searchBarOpacity: 0.8,
    searchBarMaterial: "blur",
    backgroundImageKey: null,
  }),
  loadAppearance: vi.fn(),
  saveAppearance: (...args: Parameters<typeof saveAppearanceMock>) => saveAppearanceMock(...args),
  setCurrentAppearance: (...args: Parameters<typeof setCurrentAppearanceMock>) => setCurrentAppearanceMock(...args),
}));

import { executeImport } from "@/features/backup/lib/exportImport";

describe("executeImport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("overwrites categories, ui, search settings, and appearance in overwrite mode", async () => {
    const currentState = {
      categories: [{ id: "cat-old", name: "旧分类", links: [{ id: "old-link", title: "Old", url: "https://old.com" }] }],
      ui: { categoryLayout: "top" as const, columnsPerRow: 4, maxVisibleRows: 2 },
    };
    const importData = {
      version: 1 as const,
      exportedAt: "2026-03-30T00:00:00.000Z",
      categories: [{ id: "cat-new", name: "新分类", links: [{ id: "new-link", title: "New", url: "https://new.com" }] }],
      ui: { categoryLayout: "all" as const, columnsPerRow: 6, maxVisibleRows: 5 },
      searchSettings: { activeEngineId: "google", customEngines: [], showSearchBar: false },
      appearance: { mode: "preset" as const, themeMode: "dark" as const, presetGroupId: "default" as const },
    };

    const nextState = await executeImport(importData, "overwrite", currentState);

    expect(nextState).toEqual({
      categories: importData.categories,
      ui: importData.ui,
    });
    expect(storageSetMock).toHaveBeenCalledWith(SEARCH_SETTINGS_KEY, {
      activeEngineId: "google",
      customEngines: [],
      showSearchBar: false,
      showSearchSuggestions: true,
      suggestionsOpacity: SEARCH_SUGGESTIONS_OPACITY_DEFAULT,
      suggestionsMaterial: "transparent",
    });
    expect(saveAppearanceMock).toHaveBeenCalledWith(expect.objectContaining({
      mode: "preset",
      themeMode: "dark",
      presetGroupId: "default",
    }));
    expect(setCurrentAppearanceMock).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "preset",
        themeMode: "dark",
        presetGroupId: "default",
      }),
      { persist: false },
    );
  });

  it("merges imported links into existing and same-name categories", async () => {
    const currentState = {
      categories: [
        { id: "cat-1", name: "常用", links: [{ id: "link-1", title: "GitHub", url: "https://github.com" }] },
        { id: "cat-2", name: "学习", links: [{ id: "link-2", title: "MDN", url: "https://developer.mozilla.org" }] },
      ],
      ui: { categoryLayout: "top" as const, columnsPerRow: 5, maxVisibleRows: 3 },
    };
    const importData = {
      version: 1 as const,
      exportedAt: "2026-03-30T00:00:00.000Z",
      categories: [
        { id: "cat-1", name: "常用", links: [{ id: "link-3", title: "Vite", url: "https://vite.dev" }] },
        { id: "cat-3", name: "学习", links: [{ id: "link-4", title: "TypeScript", url: "https://typescriptlang.org" }] },
      ],
    };

    const nextState = await executeImport(importData, "merge", currentState);

    expect(nextState.categories).toEqual([
      {
        id: "cat-1",
        name: "常用",
        links: [
          { id: "link-1", title: "GitHub", url: "https://github.com" },
          { id: "link-3", title: "Vite", url: "https://vite.dev" },
        ],
      },
      {
        id: "cat-2",
        name: "学习",
        links: [
          { id: "link-2", title: "MDN", url: "https://developer.mozilla.org" },
          { id: "link-4", title: "TypeScript", url: "https://typescriptlang.org" },
        ],
      },
    ]);
    expect(nextState.ui).toEqual(currentState.ui);
    expect(storageSetMock).not.toHaveBeenCalled();
    expect(saveAppearanceMock).not.toHaveBeenCalled();
  });

  it("deduplicates same-id links during merge", async () => {
    const currentState = {
      categories: [
        { id: "cat-1", name: "常用", links: [{ id: "link-1", title: "GitHub", url: "https://github.com" }] },
      ],
      ui: { categoryLayout: "top" as const },
    };
    const importData = {
      version: 1 as const,
      exportedAt: "2026-03-30T00:00:00.000Z",
      categories: [
        { id: "cat-1", name: "常用", links: [{ id: "link-1", title: "GitHub", url: "https://github.com" }] },
      ],
    };

    const nextState = await executeImport(importData, "merge", currentState);

    expect(nextState.categories[0]?.links).toHaveLength(1);
    expect(nextState.categories[0]?.links[0]?.id).toBe("link-1");
  });
});
