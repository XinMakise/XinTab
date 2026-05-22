import type { SurfaceMaterial } from "@/shared/types/surfaceMaterial";

export type SearchEngine = {
  id: string;
  name: string;
  urlTemplate: string;
  icon?: string;
  isPreset?: boolean;
};

export type SearchSuggestionSource = "history" | "bookmark";

export type SearchSuggestionItem = {
  id: string;
  source: SearchSuggestionSource;
  title: string;
  url: string;
  subtitle: string;
  siteKey?: string;
  titleFingerprint?: string;
  lastVisitedAt?: number;
  visitCount?: number;
  typedCount?: number;
  dateAdded?: number;
  dateLastUsed?: number;
};

export type SearchSettings = {
  activeEngineId: string;
  customEngines: SearchEngine[];
  showSearchBar: boolean;
  showSearchSuggestions: boolean;
  suggestionsOpacity: number;
  suggestionsMaterial: SurfaceMaterial;
};
