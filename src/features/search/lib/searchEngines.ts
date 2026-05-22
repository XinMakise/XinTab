import { normalizeSurfaceMaterial } from "@/shared/lib/surfaceMaterial";
import type { SearchEngine, SearchSettings } from "@/shared/types/search";

export const SEARCH_SETTINGS_KEY = "search_settings_v1";
export const SEARCH_SUGGESTIONS_OPACITY_DEFAULT = 92;
export const SEARCH_SUGGESTIONS_OPACITY_MIN = 40;
export const SEARCH_SUGGESTIONS_OPACITY_MAX = 100;

export const PRESET_SEARCH_ENGINES: SearchEngine[] = [
  {
    id: "bing",
    name: "Bing",
    urlTemplate: "https://www.bing.com/search?q={query}",
    icon: "https://www.bing.com/favicon.ico",
    isPreset: true,
  },
  {
    id: "baidu",
    name: "百度",
    urlTemplate: "https://www.baidu.com/s?wd={query}",
    icon: "https://www.baidu.com/favicon.ico",
    isPreset: true,
  },
  {
    id: "google",
    name: "Google",
    urlTemplate: "https://www.google.com/search?q={query}",
    icon: "https://www.google.com/favicon.ico",
    isPreset: true,
  },
  {
    id: "duckduckgo",
    name: "DuckDuckGo",
    urlTemplate: "https://duckduckgo.com/?q={query}",
    icon: "https://duckduckgo.com/favicon.ico",
    isPreset: true,
  },
];

export function defaultSearchSettings(): SearchSettings {
  return {
    activeEngineId: "bing",
    customEngines: [],
    showSearchBar: true,
    showSearchSuggestions: true,
    suggestionsOpacity: SEARCH_SUGGESTIONS_OPACITY_DEFAULT,
    suggestionsMaterial: "transparent",
  };
}

export function normalizeSearchSuggestionsOpacity(value: number | undefined): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return SEARCH_SUGGESTIONS_OPACITY_DEFAULT;
  }

  return Math.min(
    SEARCH_SUGGESTIONS_OPACITY_MAX,
    Math.max(SEARCH_SUGGESTIONS_OPACITY_MIN, Math.round(value)),
  );
}

export function normalizeSearchSettings(
  settings?: Partial<SearchSettings> | null,
): SearchSettings {
  const defaults = defaultSearchSettings();

  return {
    ...defaults,
    ...settings,
    customEngines: settings?.customEngines ?? defaults.customEngines,
    suggestionsOpacity: normalizeSearchSuggestionsOpacity(settings?.suggestionsOpacity),
    suggestionsMaterial: normalizeSurfaceMaterial(
      settings?.suggestionsMaterial,
      defaults.suggestionsMaterial,
    ),
    showSearchSuggestions: settings?.showSearchSuggestions ?? defaults.showSearchSuggestions,
  };
}

export function getAllEngines(settings: SearchSettings): SearchEngine[] {
  return [...PRESET_SEARCH_ENGINES, ...settings.customEngines];
}

export function buildSearchUrl(engine: SearchEngine, query: string): string {
  return engine.urlTemplate.replace("{query}", encodeURIComponent(query));
}

