import type { SurfaceMaterial } from "@/shared/types/surfaceMaterial";

export type ColorVars = Partial<{
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  border: string;
  input: string;
  ring: string;
}>;

export type FontChoice = "dm_sans" | "crimson_pro" | "system";

export type ThemeMode = "light" | "dark";

export type AppearancePresetGroupId =
  | "default"
  | "morandi_sage"
  | "morandi_sand"
  | "morandi_mist_blue"
  | "morandi_lotus"
  | "morandi_terracotta"
  | "graphite"
  | "nord"
  | "tokyo_night"
  | "catppuccin"
  | "gruvbox"
  | "solarized"
  | "dracula"
  | "rose_pine";

export type AppearanceSettings = {
  mode: "preset" | "custom";
  themeMode: ThemeMode;
  presetGroupId: AppearancePresetGroupId;
  custom: {
    backgroundHex: string;
    foregroundHex: string;
    primaryHex: string;
  };
  radiusRem: number;
  fontScale: number;
  font: FontChoice;
  cardOpacity: number;
  categoryButtonOpacity: number;
  cardMaterial: SurfaceMaterial;
  categoryContainerEnabled: boolean;
  leftCategoryWidthPx: number;
  topNavOpacity: number;
  topNavMaterial: SurfaceMaterial;
  searchBarOpacity: number;
  searchBarMaterial: SurfaceMaterial;
  backgroundImageKey?: string | null;
};

export type AppearancePreset = {
  id: AppearancePresetGroupId;
  name: string;
  light: ColorVars;
  dark: ColorVars;
};

export const APPEARANCE_STORAGE_KEY = "appearance";
