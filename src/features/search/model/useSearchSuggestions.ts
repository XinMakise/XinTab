import { useEffect, useMemo, useRef, useState } from "react";

import {
  DEFAULT_BOOKMARK_SUGGESTION_LIMIT,
  DEFAULT_HISTORY_SUGGESTION_LIMIT,
  dedupeSuggestionCollections,
  searchBookmarkSuggestions,
  searchHistorySuggestions,
} from "@/features/search/lib/suggestions";
import { getChrome } from "@/shared/browser/chrome";
import type { SearchSuggestionItem } from "@/shared/types/search";

const SEARCH_SUGGESTIONS_DEBOUNCE_MS = 150;
const SEARCH_SUGGESTION_CANDIDATE_MULTIPLIER = 3;

type UseSearchSuggestionsOptions = {
  historyLimit?: number;
  bookmarkLimit?: number;
};

type UseSearchSuggestionsResult = {
  historySuggestions: SearchSuggestionItem[];
  bookmarkSuggestions: SearchSuggestionItem[];
  suggestions: SearchSuggestionItem[];
  loading: boolean;
  historyAvailable: boolean;
  bookmarkAvailable: boolean;
};

export function useSearchSuggestions(
  query: string,
  options: UseSearchSuggestionsOptions = {},
): UseSearchSuggestionsResult {
  const chrome = getChrome();
  const historyAvailable = !!chrome?.history?.search;
  const bookmarkAvailable = !!chrome?.bookmarks?.search;
  const trimmedQuery = query.trim();
  const [debouncedQuery, setDebouncedQuery] = useState(trimmedQuery);
  const [historySuggestions, setHistorySuggestions] = useState<SearchSuggestionItem[]>([]);
  const [bookmarkSuggestions, setBookmarkSuggestions] = useState<SearchSuggestionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const requestSeqRef = useRef(0);

  useEffect(() => {
    if (!trimmedQuery) {
      setDebouncedQuery("");
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(trimmedQuery);
    }, SEARCH_SUGGESTIONS_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [trimmedQuery]);

  useEffect(() => {
    if (!debouncedQuery) {
      setHistorySuggestions([]);
      setBookmarkSuggestions([]);
      setLoading(false);
      return;
    }

    const requestSeq = ++requestSeqRef.current;
    const historyLimit = options.historyLimit ?? DEFAULT_HISTORY_SUGGESTION_LIMIT;
    const bookmarkLimit = options.bookmarkLimit ?? DEFAULT_BOOKMARK_SUGGESTION_LIMIT;
    setLoading(true);

    Promise.all([
      searchHistorySuggestions(
        debouncedQuery,
        historyLimit * SEARCH_SUGGESTION_CANDIDATE_MULTIPLIER,
      ),
      searchBookmarkSuggestions(
        debouncedQuery,
        bookmarkLimit * SEARCH_SUGGESTION_CANDIDATE_MULTIPLIER,
      ),
    ])
      .then(([historyItems, bookmarkItems]) => {
        if (requestSeq !== requestSeqRef.current) return;

        const deduped = dedupeSuggestionCollections(historyItems, bookmarkItems, {
          historyLimit,
          bookmarkLimit,
        });

        setHistorySuggestions(deduped.historySuggestions);
        setBookmarkSuggestions(deduped.bookmarkSuggestions);
      })
      .catch((error) => {
        console.warn("Failed to load search suggestions", error);
        if (requestSeq !== requestSeqRef.current) return;

        setHistorySuggestions([]);
        setBookmarkSuggestions([]);
      })
      .finally(() => {
        if (requestSeq !== requestSeqRef.current) return;
        setLoading(false);
      });
  }, [debouncedQuery, options.bookmarkLimit, options.historyLimit]);

  const suggestions = useMemo(
    () => [...historySuggestions, ...bookmarkSuggestions],
    [bookmarkSuggestions, historySuggestions],
  );

  return {
    historySuggestions,
    bookmarkSuggestions,
    suggestions,
    loading,
    historyAvailable,
    bookmarkAvailable,
  };
}
