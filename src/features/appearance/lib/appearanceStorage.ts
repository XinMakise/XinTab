import { storage } from "@/shared/browser/storage";
import { normalizeSurfaceMaterial } from "@/shared/lib/surfaceMaterial";
import {
  APPEARANCE_STORAGE_KEY,
  type AppearanceSettings,
} from "./appearanceTypes";

export function defaultAppearance(): AppearanceSettings {
  return {
    mode: "preset",
    themeMode: "dark",
    presetGroupId: "rose_pine",
    custom: {
      backgroundHex: "#f4f7fb",
      foregroundHex: "#0f172a",
      primaryHex: "#334155",
    },
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
  };
}

export async function loadAppearance(): Promise<AppearanceSettings> {
  const saved = await storage.get<AppearanceSettings>(APPEARANCE_STORAGE_KEY);
  const defaults = defaultAppearance();

  return {
    ...defaults,
    ...(saved ?? {}),
    categoryButtonOpacity:
      typeof saved?.categoryButtonOpacity === "number"
        ? saved.categoryButtonOpacity
        : typeof saved?.cardOpacity === "number"
          ? saved.cardOpacity
          : defaults.categoryButtonOpacity,
    cardMaterial: normalizeSurfaceMaterial(saved?.cardMaterial, defaults.cardMaterial),
    topNavMaterial: normalizeSurfaceMaterial(saved?.topNavMaterial, defaults.topNavMaterial),
    searchBarMaterial: normalizeSurfaceMaterial(
      saved?.searchBarMaterial,
      defaults.searchBarMaterial,
    ),
  };
}

export async function saveAppearance(next: AppearanceSettings): Promise<void> {
  await storage.set(APPEARANCE_STORAGE_KEY, next);
}
