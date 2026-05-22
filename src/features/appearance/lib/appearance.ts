import { appearancePresets } from "./appearancePresets";
import {
  getSurfaceMaterialTokens,
  normalizeSurfaceMaterial,
} from "@/shared/lib/surfaceMaterial";
import {
  defaultAppearance,
  saveAppearance,
} from "./appearanceStorage";
import type { AppearanceSettings, ColorVars } from "./appearanceTypes";

export type {
  AppearancePreset,
  AppearancePresetGroupId,
  AppearanceSettings,
  ColorVars,
  FontChoice,
  ThemeMode,
} from "./appearanceTypes";
export { APPEARANCE_STORAGE_KEY } from "./appearanceTypes";
export { appearancePresets } from "./appearancePresets";
export { defaultAppearance, loadAppearance, saveAppearance } from "./appearanceStorage";
let currentAppearance: AppearanceSettings = defaultAppearance();
let currentBackgroundImageDataUrl: string | null = null;
const listeners = new Set<(next: AppearanceSettings) => void>();

export function getCurrentAppearance(): AppearanceSettings {
  return currentAppearance;
}

export function subscribeAppearance(fn: (next: AppearanceSettings) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export async function setCurrentAppearance(
  next: AppearanceSettings,
  opts?: { persist?: boolean; backgroundImageDataUrl?: string | null },
): Promise<void> {
  currentAppearance = next;

  // If caller provides undefined, keep current background; if null, clear.
  if (Object.prototype.hasOwnProperty.call(opts ?? {}, "backgroundImageDataUrl")) {
    currentBackgroundImageDataUrl = opts?.backgroundImageDataUrl ?? null;
  }

  applyAppearance(next, { backgroundImageDataUrl: currentBackgroundImageDataUrl });
  listeners.forEach((l) => l(next));
  if (opts?.persist) await saveAppearance(next);
}

function setCssVar(name: string, value: string) {
  document.documentElement.style.setProperty(name, value);
}

function applyVars(vars: ColorVars) {
  const map: Record<keyof Required<ColorVars>, string> = {
    background: "--background",
    foreground: "--foreground",
    card: "--card",
    cardForeground: "--card-foreground",
    popover: "--popover",
    popoverForeground: "--popover-foreground",
    primary: "--primary",
    primaryForeground: "--primary-foreground",
    secondary: "--secondary",
    secondaryForeground: "--secondary-foreground",
    muted: "--muted",
    mutedForeground: "--muted-foreground",
    accent: "--accent",
    accentForeground: "--accent-foreground",
    border: "--border",
    input: "--input",
    ring: "--ring",
  };

  (Object.keys(map) as Array<keyof Required<ColorVars>>).forEach((k) => {
    const v = vars[k];
    if (typeof v === "string" && v.trim()) setCssVar(map[k], v);
  });
}

export function hexToHslTriplet(hex: string): string | null {
  const normalized = hex.trim().replace(/^#/, "");
  if (![3, 6].includes(normalized.length)) return null;
  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((c) => c + c)
          .join("")
      : normalized;

  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  if ([r, g, b].some((n) => Number.isNaN(n))) return null;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }

  const l = (max + min) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));

  const hh = Math.round(h);
  const ss = Math.round(s * 100);
  const ll = Math.round(l * 100);
  return `${hh} ${ss}% ${ll}%`;
}

export function applyAppearance(
  settings: AppearanceSettings,
  opts?: { backgroundImageDataUrl?: string | null },
) {
  // Enable base dark tokens in index.css (default/custom mode relies on this)
  document.documentElement.classList.toggle("dark", settings.themeMode === "dark");

  const preset = appearancePresets.find((p) => p.id === settings.presetGroupId);
  if (settings.mode === "preset" && preset) {
    applyVars(settings.themeMode === "dark" ? preset.dark : preset.light);
  } else {
    const bg = hexToHslTriplet(settings.custom.backgroundHex);
    const fg = hexToHslTriplet(settings.custom.foregroundHex);
    const primary = hexToHslTriplet(settings.custom.primaryHex);
    if (bg) setCssVar("--background", bg);
    if (fg) setCssVar("--foreground", fg);
    if (primary) {
      setCssVar("--primary", primary);
      // primary-foreground: keep existing; user can switch preset if they want stronger contrast.
    }
    // Keep other tokens as-is; avoids broken contrast while still allowing personal tint.
  }

  const cardMaterial = normalizeSurfaceMaterial(settings.cardMaterial, "transparent");
  const topNavMaterial = normalizeSurfaceMaterial(settings.topNavMaterial, "blur");
  const searchBarMaterial = normalizeSurfaceMaterial(settings.searchBarMaterial, "blur");
  const cardMaterialTokens = getSurfaceMaterialTokens(cardMaterial);
  const topNavMaterialTokens = getSurfaceMaterialTokens(topNavMaterial);
  const searchBarMaterialTokens = getSurfaceMaterialTokens(searchBarMaterial);
  const categoryButtonOpacity = Number.isFinite(settings.categoryButtonOpacity)
    ? settings.categoryButtonOpacity
    : 1;

  setCssVar("--radius", `${Math.max(0, settings.radiusRem)}rem`);
  setCssVar(
    "--app-font-scale",
    String(Math.min(1.25, Math.max(0.9, settings.fontScale)))
  );
  setCssVar(
    "--app-card-opacity",
    String(Math.min(1, Math.max(0, settings.cardOpacity)))
  );
  setCssVar(
    "--app-category-button-opacity",
    String(Math.min(1, Math.max(0, categoryButtonOpacity)))
  );
  setCssVar("--app-card-material-filter", cardMaterialTokens.filter);
  setCssVar("--app-card-material-overlay", cardMaterialTokens.overlay);
  setCssVar(
    "--app-left-category-width",
    `${Math.min(220, Math.max(120, settings.leftCategoryWidthPx ?? 192))}px`
  );
  setCssVar(
    "--app-topnav-opacity",
    String(Math.min(1, Math.max(0, settings.topNavOpacity ?? 0.8)))
  );
  setCssVar("--app-topnav-material-filter", topNavMaterialTokens.filter);
  setCssVar("--app-topnav-material-overlay", topNavMaterialTokens.overlay);
  setCssVar(
    "--app-searchbar-opacity",
    String(Math.min(1, Math.max(0, settings.searchBarOpacity ?? 0.8)))
  );
  setCssVar("--app-searchbar-material-filter", searchBarMaterialTokens.filter);
  setCssVar("--app-searchbar-material-overlay", searchBarMaterialTokens.overlay);
  setCssVar(
    "--app-font-family",
    settings.font === "system"
      ? "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif"
      : settings.font === "crimson_pro"
        ? "'Crimson Pro', ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif"
        : "'DM Sans', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif"
  );

  const dataUrl = opts?.backgroundImageDataUrl ?? null;
  const bgUrl = dataUrl ? `url('${dataUrl.replace(/'/g, "\\'")}')` : "none";

  // Keep CSS var for existing styling, but also set <body> directly so the
  // background image works even if CSS layering/selector changes.
  setCssVar("--app-bg-image", bgUrl);
  if (typeof document !== "undefined") {
    document.body.style.backgroundImage = bgUrl;
    document.body.style.backgroundRepeat = "no-repeat";
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundAttachment = "fixed";
  }
}
