import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronDown, Plus, Search, Trash2 } from "lucide-react";

import { Button } from "@/shared/ui/primitives/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/primitives/dropdown-menu";
import { Input } from "@/shared/ui/primitives/input";
import {
  buildSearchUrl,
  getAllEngines,
  PRESET_SEARCH_ENGINES,
} from "@/features/search/lib/searchEngines";
import {
  applySearchSettings,
  getCurrentSearchSettings,
  isSearchSuggestionsOpacityPreviewActive,
  loadSearchSettings,
  persistSearchSettings,
  subscribeSearchSuggestionsOpacityPreview,
  subscribeSearchSettings,
} from "@/features/search/lib/searchSettingsStore";
import { useSearchSuggestions } from "@/features/search/model/useSearchSuggestions";
import type { SearchEngine, SearchSettings, SearchSuggestionItem } from "@/shared/types/search";

import { AddSearchEngineDialog } from "./AddSearchEngineDialog";
import { SearchSuggestionsPanel } from "./SearchSuggestionsPanel";

interface SearchBarProps {
  onSettingsChange?: (settings: SearchSettings) => void;
}

export function SearchBar({ onSettingsChange }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [settings, setSettings] = useState<SearchSettings>(() => getCurrentSearchSettings());
  const [loading, setLoading] = useState(true);
  const [inputFocused, setInputFocused] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [showSuggestionsOpacityPreview, setShowSuggestionsOpacityPreview] = useState(() =>
    isSearchSuggestionsOpacityPreviewActive(),
  );
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadSearchSettings().then((saved) => {
      if (cancelled) return;
      setSettings(saved);
      setLoading(false);
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    return subscribeSearchSettings((next) => {
      setSettings(next);
    });
  }, []);

  useEffect(() => {
    return subscribeSearchSuggestionsOpacityPreview((active) => {
      setShowSuggestionsOpacityPreview(active);
    });
  }, []);

  useEffect(() => {
    return () => {
      if (persistTimerRef.current) clearTimeout(persistTimerRef.current);
    };
  }, []);

  const persistSettings = useCallback((next: SearchSettings) => {
    if (persistTimerRef.current) clearTimeout(persistTimerRef.current);
    persistTimerRef.current = setTimeout(() => {
      persistSearchSettings(next).catch(() => {});
    }, 300);
  }, []);

  const saveSettings = useCallback((next: SearchSettings) => {
    const normalized = applySearchSettings(next);
    persistSettings(normalized);
    onSettingsChange?.(normalized);
  }, [persistSettings, onSettingsChange]);

  const allEngines = getAllEngines(settings);
  const activeEngine =
    allEngines.find((e) => e.id === settings.activeEngineId) || PRESET_SEARCH_ENGINES[0];
  const {
    historySuggestions,
    bookmarkSuggestions,
    suggestions,
    loading: suggestionsLoading,
    historyAvailable,
    bookmarkAvailable,
  } = useSearchSuggestions(query);
  const hasSuggestionSources = historyAvailable || bookmarkAvailable;
  const showSuggestions =
    settings.showSearchSuggestions &&
    inputFocused &&
    query.trim().length > 0;
  const showEmptySuggestionsPreview =
    settings.showSearchSuggestions &&
    showSuggestionsOpacityPreview &&
    !showSuggestions;
  const showSuggestionsPanel = showSuggestions || showEmptySuggestionsPreview;
  const emptySuggestionMessage = !hasSuggestionSources
    ? "当前页面不是扩展新标签页，Chrome 历史和收藏建议不可用"
    : "未找到匹配的历史记录或收藏";

  useEffect(() => {
    setActiveSuggestionIndex(-1);
  }, [query]);

  useEffect(() => {
    if (activeSuggestionIndex < suggestions.length) return;
    setActiveSuggestionIndex(-1);
  }, [activeSuggestionIndex, suggestions.length]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (rootRef.current?.contains(event.target as Node)) return;
      setInputFocused(false);
      setActiveSuggestionIndex(-1);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const handleSearch = useCallback(() => {
    const trimmed = query.trim();
    if (!trimmed) return;
    const url = buildSearchUrl(activeEngine, trimmed);
    window.open(url, "_blank");
  }, [query, activeEngine]);

  const handleOpenSuggestion = useCallback((item: SearchSuggestionItem) => {
    window.open(item.url, "_blank");
    setInputFocused(false);
    setActiveSuggestionIndex(-1);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" && suggestions.length > 0) {
      e.preventDefault();
      setActiveSuggestionIndex((prev) => (prev + 1 + suggestions.length) % suggestions.length);
      return;
    }

    if (e.key === "ArrowUp" && suggestions.length > 0) {
      e.preventDefault();
      setActiveSuggestionIndex((prev) =>
        prev <= 0 ? suggestions.length - 1 : prev - 1,
      );
      return;
    }

    if (e.key === "Escape") {
      setInputFocused(false);
      setActiveSuggestionIndex(-1);
      return;
    }

    if (e.key === "Enter") {
      if (showSuggestions && activeSuggestionIndex >= 0) {
        e.preventDefault();
        handleOpenSuggestion(suggestions[activeSuggestionIndex]);
        return;
      }

      handleSearch();
    } else if (e.key === "Tab") {
      e.preventDefault();
      const currentIndex = allEngines.findIndex((eng) => eng.id === activeEngine.id);
      const nextIndex = (currentIndex + 1) % allEngines.length;
      saveSettings({ ...settings, activeEngineId: allEngines[nextIndex].id });
    }
  }, [
    activeEngine.id,
    activeSuggestionIndex,
    allEngines,
    handleOpenSuggestion,
    handleSearch,
    saveSettings,
    settings,
    showSuggestions,
    suggestions,
  ]);

  const handleAddEngine = useCallback((engine: SearchEngine) => {
    saveSettings({
      ...settings,
      customEngines: [...settings.customEngines, engine],
    });
  }, [settings, saveSettings]);

  const handleRemoveEngine = useCallback((engineId: string) => {
    const newCustomEngines = settings.customEngines.filter((e) => e.id !== engineId);
    const newActiveId =
      settings.activeEngineId === engineId ? "bing" : settings.activeEngineId;
    saveSettings({
      ...settings,
      customEngines: newCustomEngines,
      activeEngineId: newActiveId,
    });
  }, [settings, saveSettings]);

  if (loading || !settings.showSearchBar) return null;

  return (
    <div ref={rootRef} className="mx-auto mb-6 w-full max-w-2xl">
      <div className="relative">
        <div className="flex items-center gap-2 rounded-xl border bg-searchbar p-2 shadow-sm">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="shrink-0 gap-1 px-2">
                {activeEngine.icon && (
                  <img
                    src={activeEngine.icon}
                    alt=""
                    className="h-4 w-4"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                )}
                <span className="hidden text-sm sm:inline">{activeEngine.name}</span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {allEngines.map((engine) => (
                <DropdownMenuItem
                  key={engine.id}
                  className="flex items-center justify-between"
                  onClick={() => saveSettings({ ...settings, activeEngineId: engine.id })}
                >
                  <div className="flex items-center gap-2">
                    {engine.icon && (
                      <img
                        src={engine.icon}
                        alt=""
                        className="h-4 w-4"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    )}
                    <span>{engine.name}</span>
                  </div>
                  {!engine.isPreset && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveEngine(engine.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <AddSearchEngineDialog
                onAdd={handleAddEngine}
                trigger={(
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Plus className="mr-2 h-4 w-4" />
                    添加搜索引擎
                  </DropdownMenuItem>
                )}
              />
            </DropdownMenuContent>
          </DropdownMenu>

          <Input
            type="text"
            placeholder={`在 ${activeEngine.name} 中搜索...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setInputFocused(true)}
            className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
          />

          <Button
            size="sm"
            variant="ghost"
            onClick={handleSearch}
            disabled={!query.trim()}
            className="shrink-0"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {showSuggestionsPanel ? (
          <SearchSuggestionsPanel
            historySuggestions={showSuggestions ? historySuggestions : []}
            bookmarkSuggestions={showSuggestions ? bookmarkSuggestions : []}
            activeIndex={activeSuggestionIndex}
            loading={showSuggestions ? suggestionsLoading : false}
            emptyMessage={showSuggestions ? emptySuggestionMessage : undefined}
            forceEmptyPanel={showEmptySuggestionsPreview}
            material={settings.suggestionsMaterial}
            opacity={settings.suggestionsOpacity}
            onActiveIndexChange={setActiveSuggestionIndex}
            onSelect={handleOpenSuggestion}
          />
        ) : null}
      </div>
    </div>
  );
}


