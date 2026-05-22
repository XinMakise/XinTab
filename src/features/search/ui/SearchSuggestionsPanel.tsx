import { getSurfaceMaterialTokens } from "@/shared/lib/surfaceMaterial";
import { Bookmark, Clock3 } from "lucide-react";

import { formatRecentVisitTime } from "@/features/recent-visits";
import { cn } from "@/shared/lib/cn";
import type { SearchSuggestionItem } from "@/shared/types/search";
import type { SurfaceMaterial } from "@/shared/types/surfaceMaterial";

type SearchSuggestionsPanelProps = {
  historySuggestions: SearchSuggestionItem[];
  bookmarkSuggestions: SearchSuggestionItem[];
  activeIndex: number;
  loading: boolean;
  emptyMessage?: string;
  forceEmptyPanel?: boolean;
  material: SurfaceMaterial;
  opacity: number;
  onActiveIndexChange: (index: number) => void;
  onSelect: (item: SearchSuggestionItem) => void;
};

type SuggestionGroup = {
  key: "history" | "bookmark";
  label: string;
  items: SearchSuggestionItem[];
};

function SearchSuggestionRow({
  item,
  index,
  active,
  onActiveIndexChange,
  onSelect,
}: {
  item: SearchSuggestionItem;
  index: number;
  active: boolean;
  onActiveIndexChange: (index: number) => void;
  onSelect: (item: SearchSuggestionItem) => void;
}) {
  const Icon = item.source === "history" ? Clock3 : Bookmark;

  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      className={cn(
        "flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left transition-colors",
        active ? "bg-accent text-accent-foreground" : "hover:bg-muted/70",
      )}
      onMouseDown={(event) => event.preventDefault()}
      onMouseMove={() => onActiveIndexChange(index)}
      onClick={() => onSelect(item)}
    >
      <div className="mt-0.5 rounded-md bg-muted p-1.5 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{item.title}</div>
        <div className="truncate text-xs text-muted-foreground">{item.subtitle}</div>
      </div>
      <div className="shrink-0 text-[11px] text-muted-foreground">
        {item.source === "history" && item.lastVisitedAt
          ? formatRecentVisitTime(item.lastVisitedAt)
          : "收藏"}
      </div>
    </button>
  );
}

export function SearchSuggestionsPanel({
  historySuggestions,
  bookmarkSuggestions,
  activeIndex,
  loading,
  emptyMessage,
  forceEmptyPanel = false,
  material,
  opacity,
  onActiveIndexChange,
  onSelect,
}: SearchSuggestionsPanelProps) {
  const groups = ([
    { key: "history", label: "历史记录", items: historySuggestions },
    { key: "bookmark", label: "收藏", items: bookmarkSuggestions },
  ] satisfies SuggestionGroup[]).filter((group) => group.items.length > 0);

  if (!loading && groups.length === 0 && !emptyMessage && !forceEmptyPanel) return null;

  let runningIndex = 0;
  const materialTokens = getSurfaceMaterialTokens(material);

  return (
    <div
      role="listbox"
      aria-label="搜索建议"
      className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-xl border bg-popover shadow-lg"
      style={{
        backgroundColor: `hsl(var(--popover) / ${opacity / 100})`,
        backgroundImage: materialTokens.overlay,
        backdropFilter: materialTokens.filter,
        WebkitBackdropFilter: materialTokens.filter,
      }}
    >
      {groups.map((group) => {
        const startIndex = runningIndex;
        runningIndex += group.items.length;

        return (
          <section key={group.key} className="border-b last:border-b-0">
            <div className="px-3 py-2 text-xs font-medium text-muted-foreground">
              {group.label}
            </div>
            <div className="pb-2">
              {group.items.map((item, itemIndex) => {
                const globalIndex = startIndex + itemIndex;
                return (
                  <SearchSuggestionRow
                    key={item.id}
                    item={item}
                    index={globalIndex}
                    active={globalIndex === activeIndex}
                    onActiveIndexChange={onActiveIndexChange}
                    onSelect={onSelect}
                  />
                );
              })}
            </div>
          </section>
        );
      })}

      {loading && groups.length === 0 ? (
        <div className="px-3 py-3 text-sm text-muted-foreground">搜索中...</div>
      ) : null}

      {!loading && groups.length === 0 && forceEmptyPanel ? (
        <div aria-hidden="true" className="h-40" />
      ) : null}

      {!loading && groups.length === 0 && emptyMessage ? (
        <div className="px-3 py-3 text-sm text-muted-foreground">{emptyMessage}</div>
      ) : null}
    </div>
  );
}
