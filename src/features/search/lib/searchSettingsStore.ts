import { storage } from "@/shared/browser/storage";
import type { SearchSettings } from "@/shared/types/search";

import {
  defaultSearchSettings,
  normalizeSearchSettings,
  SEARCH_SETTINGS_KEY,
} from "./searchEngines";

let currentSearchSettings = defaultSearchSettings();
const listeners = new Set<(settings: SearchSettings) => void>();
const previewListeners = new Set<(active: boolean) => void>();
let searchSuggestionsOpacityPreviewActive = false;
let previewHideTimer: ReturnType<typeof setTimeout> | null = null;

function updateCurrentSearchSettings(next: SearchSettings | Partial<SearchSettings> | null | undefined) {
  currentSearchSettings = normalizeSearchSettings(next);
  listeners.forEach((listener) => listener(currentSearchSettings));
  return currentSearchSettings;
}

function emitSearchSuggestionsOpacityPreview(active: boolean) {
  if (searchSuggestionsOpacityPreviewActive === active) return;
  searchSuggestionsOpacityPreviewActive = active;
  previewListeners.forEach((listener) => listener(active));
}

export function getCurrentSearchSettings(): SearchSettings {
  return currentSearchSettings;
}

export function subscribeSearchSettings(listener: (settings: SearchSettings) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function isSearchSuggestionsOpacityPreviewActive(): boolean {
  return searchSuggestionsOpacityPreviewActive;
}

export function subscribeSearchSuggestionsOpacityPreview(
  listener: (active: boolean) => void,
): () => void {
  previewListeners.add(listener);
  return () => previewListeners.delete(listener);
}

export function showSearchSuggestionsOpacityPreview(hideDelayMs = 900): void {
  if (previewHideTimer) {
    clearTimeout(previewHideTimer);
    previewHideTimer = null;
  }

  emitSearchSuggestionsOpacityPreview(true);

  if (hideDelayMs <= 0) return;

  previewHideTimer = setTimeout(() => {
    previewHideTimer = null;
    emitSearchSuggestionsOpacityPreview(false);
  }, hideDelayMs);
}

export function hideSearchSuggestionsOpacityPreview(): void {
  if (previewHideTimer) {
    clearTimeout(previewHideTimer);
    previewHideTimer = null;
  }

  emitSearchSuggestionsOpacityPreview(false);
}

export async function loadSearchSettings(): Promise<SearchSettings> {
  const saved = await storage.get<SearchSettings>(SEARCH_SETTINGS_KEY);
  return updateCurrentSearchSettings(saved);
}

export function applySearchSettings(next: SearchSettings | Partial<SearchSettings>): SearchSettings {
  return updateCurrentSearchSettings(next);
}

export async function persistSearchSettings(
  next: SearchSettings | Partial<SearchSettings>,
): Promise<SearchSettings> {
  const normalized = normalizeSearchSettings(next);
  await storage.set(SEARCH_SETTINGS_KEY, normalized);
  return normalized;
}
