import { storage } from "@/shared/browser/storage";
import { normalizeSurfaceMaterial } from "@/shared/lib/surfaceMaterial";
import {
  APPEARANCE_STORAGE_KEY,
  type AppearanceSettings,
} from "./appearanceTypes";

export function defaultAppearance(): AppearanceSettings {
  return {
    mode: "preset",
    themeMode: "light",
    presetGroupId: "default",
    custom: {
      backgroundHex: "#f4f7fb",
      foregroundHex: "#0f172a",
      primaryHex: "#334155",
    },
    radiusRem: 0,
    fontScale: 1,
    font: "dm_sans",
    cardOpacity: 1,
    categoryButtonOpacity: 1,
    cardMaterial: "transparent",
    categoryContainerEnabled: true,
    leftCategoryWidthPx: 192,
    topNavOpacity: 0.8,
    topNavMaterial: "blur",
    searchBarOpacity: 0.8,
    searchBarMaterial: "blur",
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
