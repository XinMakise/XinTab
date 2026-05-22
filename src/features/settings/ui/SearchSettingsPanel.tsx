import { useEffect, useState } from "react";

import { Card } from "@/shared/ui/primitives/card";
import { Label } from "@/shared/ui/primitives/label";
import { Slider } from "@/shared/ui/primitives/slider";
import { Switch } from "@/shared/ui/primitives/switch";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/primitives/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/primitives/select";
import { SURFACE_MATERIAL_OPTIONS } from "@/shared/lib/surfaceMaterial";
import {
  applySearchSettings,
  getCurrentSearchSettings,
  hideSearchSuggestionsOpacityPreview,
  loadSearchSettings,
  normalizeSearchSuggestionsOpacity,
  persistSearchSettings,
  SEARCH_SUGGESTIONS_OPACITY_DEFAULT,
  SEARCH_SUGGESTIONS_OPACITY_MAX,
  SEARCH_SUGGESTIONS_OPACITY_MIN,
  showSearchSuggestionsOpacityPreview,
  subscribeSearchSettings,
} from "@/features/search";
import {
  estimateRecentVisitsContentWidth,
  getRecentVisitsVisibleCount,
  normalizeRecentVisitsCardSize,
  normalizeRecentVisitsRows,
  RECENT_VISITS_CARD_SIZE_DEFAULT,
  RECENT_VISITS_CARD_SIZE_MAX,
  RECENT_VISITS_CARD_SIZE_MIN,
  RECENT_VISITS_ROWS_DEFAULT,
  RECENT_VISITS_ROWS_MAX,
  RECENT_VISITS_ROWS_MIN,
} from "@/features/recent-visits";
import type { SearchSettings } from "@/shared/types/search";

function SurfaceMaterialSelectField({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: SearchSettings["suggestionsMaterial"];
  onValueChange: (value: SearchSettings["suggestionsMaterial"]) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={(next) => onValueChange(next as SearchSettings["suggestionsMaterial"])}>
        <SelectTrigger>
          <SelectValue placeholder="选择材质" />
        </SelectTrigger>
        <SelectContent>
          {SURFACE_MATERIAL_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function SearchSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3 rounded-md border bg-muted/20 p-3">
      <div className="space-y-1">
        <div className="text-sm font-medium">{title}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  );
}

export function SearchSettingsPanel({
  showRecentVisits,
  onShowRecentVisitsChange,
  recentVisitsRows,
  onRecentVisitsRowsChange,
  recentVisitsCardSize,
  onRecentVisitsCardSizeChange,
}: {
  showRecentVisits?: boolean;
  onShowRecentVisitsChange?: (checked: boolean) => void;
  recentVisitsRows?: number;
  onRecentVisitsRowsChange?: (rows: number) => void;
  recentVisitsCardSize?: number;
  onRecentVisitsCardSizeChange?: (size: number) => void;
}) {
  const [searchSettings, setSearchSettings] = useState<SearchSettings>(() => getCurrentSearchSettings());
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window === "undefined" ? 1280 : window.innerWidth,
  );

  const normalizedRows = normalizeRecentVisitsRows(recentVisitsRows);
  const normalizedCardSize = normalizeRecentVisitsCardSize(recentVisitsCardSize);
  const estimatedVisibleCount = getRecentVisitsVisibleCount(
    estimateRecentVisitsContentWidth(viewportWidth),
    normalizedRows,
    normalizedCardSize,
  );

  useEffect(() => {
    void loadSearchSettings().then((saved) => {
      setSearchSettings(saved);
    });
  }, []);

  useEffect(() => {
    return subscribeSearchSettings((next) => {
      setSearchSettings(next);
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const saveSearchSettings = async (next: SearchSettings) => {
    const normalized = applySearchSettings(next);
    setSearchSettings(normalized);
    await persistSearchSettings(normalized);
  };

  return (
    <AccordionItem value="search" className="border-none">
      <Card className="p-0">
        <AccordionTrigger className="px-4">搜索与最近访问</AccordionTrigger>
        <AccordionContent className="px-4">
          <div className="space-y-4">
            <SearchSection
              title="搜索"
              description="控制主页搜索栏和建议面板的显示方式。"
            >
              <div className="flex items-center justify-between py-1">
                <div className="space-y-0.5">
                  <Label>显示搜索栏</Label>
                  <p className="text-xs text-muted-foreground">在主页顶部显示搜索栏</p>
                </div>
                <Switch
                  checked={searchSettings.showSearchBar}
                  onCheckedChange={(checked) =>
                    saveSearchSettings({ ...searchSettings, showSearchBar: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between py-1">
                <div className="space-y-0.5">
                  <Label>开启搜索建议</Label>
                  <p className="text-xs text-muted-foreground">显示历史记录和 Chrome 收藏建议</p>
                </div>
                <Switch
                  checked={searchSettings.showSearchSuggestions}
                  onCheckedChange={(checked) => {
                    if (!checked) hideSearchSuggestionsOpacityPreview();
                    void saveSearchSettings({ ...searchSettings, showSearchSuggestions: checked });
                  }}
                />
              </div>

              {searchSettings.showSearchSuggestions ? (
                <div className="space-y-3 rounded-md border bg-background/60 p-3">
                  <SurfaceMaterialSelectField
                    label="建议面板材质"
                    value={searchSettings.suggestionsMaterial}
                    onValueChange={(suggestionsMaterial) => {
                      showSearchSuggestionsOpacityPreview(1200);
                      void saveSearchSettings({
                        ...searchSettings,
                        suggestionsMaterial,
                      });
                    }}
                  />

                  <div className="flex items-center justify-between gap-2">
                    <Label>建议面板透明度</Label>
                    <div className="text-xs text-muted-foreground">
                      {searchSettings.suggestionsOpacity}%
                    </div>
                  </div>
                  <Slider
                    value={[searchSettings.suggestionsOpacity]}
                    min={SEARCH_SUGGESTIONS_OPACITY_MIN}
                    max={SEARCH_SUGGESTIONS_OPACITY_MAX}
                    step={5}
                    onValueChange={(value) => {
                      showSearchSuggestionsOpacityPreview();
                      void saveSearchSettings({
                        ...searchSettings,
                        suggestionsOpacity: normalizeSearchSuggestionsOpacity(
                          value[0] ?? SEARCH_SUGGESTIONS_OPACITY_DEFAULT,
                        ),
                      });
                    }}
                    onValueCommit={() => showSearchSuggestionsOpacityPreview(1200)}
                  />
                </div>
              ) : null}
            </SearchSection>

            {typeof showRecentVisits === "boolean" && onShowRecentVisitsChange ? (
              <SearchSection
                title="最近访问"
                description="控制最近访问模块的显示、行数和卡片密度。"
              >
                <div className="flex items-center justify-between gap-3 py-1">
                  <div className="space-y-0.5">
                    <Label>显示最近访问</Label>
                    <p className="text-xs text-muted-foreground">仅在 Chrome 扩展且有历史权限时显示</p>
                  </div>
                  <Switch
                    checked={showRecentVisits}
                    onCheckedChange={onShowRecentVisitsChange}
                  />
                </div>

                {showRecentVisits ? (
                  <div className="space-y-4 rounded-md border bg-background/60 p-3">
                    {onRecentVisitsRowsChange ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <Label>行数</Label>
                          <div className="text-xs text-muted-foreground">
                            {normalizedRows} 行
                          </div>
                        </div>
                        <Slider
                          value={[normalizedRows]}
                          min={RECENT_VISITS_ROWS_MIN}
                          max={RECENT_VISITS_ROWS_MAX}
                          step={1}
                          onValueChange={(value) => {
                            onRecentVisitsRowsChange(
                              normalizeRecentVisitsRows(value[0] ?? RECENT_VISITS_ROWS_DEFAULT),
                            );
                          }}
                        />
                      </div>
                    ) : null}

                    {onRecentVisitsCardSizeChange ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <Label>卡片大小</Label>
                          <div className="text-xs text-muted-foreground">
                            {normalizedCardSize}%
                          </div>
                        </div>
                        <Slider
                          value={[normalizedCardSize]}
                          min={RECENT_VISITS_CARD_SIZE_MIN}
                          max={RECENT_VISITS_CARD_SIZE_MAX}
                          step={5}
                          onValueChange={(value) => {
                            onRecentVisitsCardSizeChange(
                              value[0] ?? RECENT_VISITS_CARD_SIZE_DEFAULT,
                            );
                          }}
                        />
                        <p className="text-xs text-muted-foreground">
                          当前显示 {estimatedVisibleCount} 张
                        </p>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </SearchSection>
            ) : null}
          </div>
        </AccordionContent>
      </Card>
    </AccordionItem>
  );
}


