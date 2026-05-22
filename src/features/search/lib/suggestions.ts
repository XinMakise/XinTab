import {
  extractSiteName,
  getRegistrableDomain,
  normalizeComparableHost,
} from "@/entities/link";
import { getChrome } from "@/shared/browser/chrome";
import type { ChromeBookmarkNode, ChromeHistoryItem } from "@/shared/browser/chrome";
import type { SearchSuggestionItem } from "@/shared/types/search";

export const DEFAULT_HISTORY_SUGGESTION_LIMIT = 5;
export const DEFAULT_BOOKMARK_SUGGESTION_LIMIT = 5;
const TRACKING_SEARCH_PARAM_PATTERN =
  /^(utm_[a-z0-9_]+|fbclid|gclid|yclid|mc_cid|mc_eid|spm|ref|ref_src)$/i;
const PAGINATION_PATH_MARKERS = new Set(["page", "p"]);
const TITLE_NOISE_SEPARATOR_PATTERN = /\s*[-|:]\s*/g;
const DUPLICATE_LIKELY_PATH_PATTERNS = [
  /^\/c\/[0-9a-f-]{8,}$/i,
  /^\/login\/callback\/?$/i,
  /^\/s\/.+/i,
  /^\/search(?:\/|$)/i,
];

type DedupeBucket = {
  canonical: SearchSuggestionItem;
  items: SearchSuggestionItem[];
};

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

function isSupportedSuggestionUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeSuggestionHost(host: string): string {
  return normalizeComparableHost(host);
}

function normalizeSuggestionPathname(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return "";

  const lastSegment = segments.at(-1) ?? "";
  const previousSegment = segments.at(-2)?.toLowerCase() ?? "";
  const hasEarlierLongNumericSegment = segments
    .slice(0, -1)
    .some((segment) => /^\d{3,}$/.test(segment));

  if (
    /^\d+$/.test(lastSegment)
    && (
      PAGINATION_PATH_MARKERS.has(previousSegment)
      || (segments.length >= 3 && hasEarlierLongNumericSegment)
    )
  ) {
    if (PAGINATION_PATH_MARKERS.has(previousSegment)) {
      segments.splice(-2, 2);
    } else {
      segments.pop();
    }
  }

  return segments.length > 0 ? `/${segments.join("/")}` : "";
}

function normalizeSuggestionSearch(searchParams: URLSearchParams): string {
  const entries = [...searchParams.entries()]
    .filter(([key]) => !TRACKING_SEARCH_PARAM_PATTERN.test(key))
    .sort(([leftKey, leftValue], [rightKey, rightValue]) => {
      const keyDiff = leftKey.localeCompare(rightKey);
      if (keyDiff !== 0) return keyDiff;
      return leftValue.localeCompare(rightValue);
    });

  if (entries.length === 0) return "";

  const normalized = new URLSearchParams();
  for (const [key, value] of entries) {
    normalized.append(key, value);
  }

  return `?${normalized.toString()}`;
}

function normalizeTitleSegment(segment: string): string {
  return segment
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[()[\]{}]/g, "");
}

export function getSuggestionDedupKey(url: string): string {
  try {
    const parsed = new URL(url);
    const host = normalizeSuggestionHost(parsed.host);
    const pathname = normalizeSuggestionPathname(parsed.pathname);
    const search = normalizeSuggestionSearch(parsed.searchParams);
    return `${host}${pathname}${search}`;
  } catch {
    return url.trim().toLowerCase();
  }
}

export function getSuggestionSiteKey(url: string): string {
  try {
    const parsed = new URL(url);
    return getRegistrableDomain(parsed.hostname);
  } catch {
    return "";
  }
}

function getSuggestionPathname(url: string): string {
  try {
    return new URL(url).pathname || "/";
  } catch {
    return "/";
  }
}

function isDuplicateLikelyPath(url: string): boolean {
  const pathname = getSuggestionPathname(url);
  return DUPLICATE_LIKELY_PATH_PATTERNS.some((pattern) => pattern.test(pathname));
}

function buildTitleFingerprint(title: string, siteKey: string): string {
  const normalizedTitle = title.trim().toLowerCase().replace(/\s+/g, " ");
  if (!normalizedTitle) return "";

  const normalizedSiteKey = normalizeTitleSegment(siteKey);
  const parts = normalizedTitle
    .split(TITLE_NOISE_SEPARATOR_PATTERN)
    .map(normalizeTitleSegment)
    .filter(Boolean)
    .filter((part) => part !== normalizedSiteKey && part !== normalizedSiteKey.replace(/\./g, " "));

  return (parts.length > 0 ? parts : [normalizedTitle]).join(" | ");
}

export function formatSuggestionUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const pathname =
      parsed.pathname && parsed.pathname !== "/"
        ? parsed.pathname.replace(/\/$/, "")
        : "";
    return `${parsed.host}${pathname}`;
  } catch {
    return url.replace(/^https?:\/\/(www\.)?/, "");
  }
}

function scoreField(query: string, value: string, prefixBase: number, includeBase: number): number {
  if (!value) return 0;
  if (value === query) return prefixBase + 40;
  if (value.startsWith(query)) return prefixBase + 20;

  const index = value.indexOf(query);
  if (index >= 0) {
    return includeBase - Math.min(index, 20);
  }

  return 0;
}

export function getSuggestionScore(
  query: string,
  item: Pick<SearchSuggestionItem, "title" | "url" | "subtitle">,
): number {
  const normalizedQuery = normalizeQuery(query);
  if (!normalizedQuery) return 0;

  const normalizedTitle = item.title.trim().toLowerCase();
  const normalizedUrl = formatSuggestionUrl(item.url).toLowerCase();
  const normalizedSubtitle = item.subtitle.trim().toLowerCase();

  return Math.max(
    scoreField(normalizedQuery, normalizedTitle, 300, 220),
    scoreField(normalizedQuery, normalizedUrl, 200, 140),
    scoreField(normalizedQuery, normalizedSubtitle, 120, 90),
  );
}

function compareSuggestions(
  query: string,
  left: SearchSuggestionItem,
  right: SearchSuggestionItem,
): number {
  const scoreDiff = getSuggestionScore(query, right) - getSuggestionScore(query, left);
  if (scoreDiff !== 0) return scoreDiff;

  const typedCountDiff = (right.typedCount ?? 0) - (left.typedCount ?? 0);
  if (typedCountDiff !== 0) return typedCountDiff;

  const visitCountDiff = (right.visitCount ?? 0) - (left.visitCount ?? 0);
  if (visitCountDiff !== 0) return visitCountDiff;

  const lastUsedDiff = (right.dateLastUsed ?? 0) - (left.dateLastUsed ?? 0);
  if (lastUsedDiff !== 0) return lastUsedDiff;

  const visitTimeDiff = (right.lastVisitedAt ?? 0) - (left.lastVisitedAt ?? 0);
  if (visitTimeDiff !== 0) return visitTimeDiff;

  const titleDiff = left.title.localeCompare(right.title, "zh-Hans-CN");
  if (titleDiff !== 0) return titleDiff;

  return left.url.localeCompare(right.url);
}

function withDerivedSuggestionFields(item: SearchSuggestionItem): SearchSuggestionItem {
  const siteKey = item.siteKey || getSuggestionSiteKey(item.url);
  return {
    ...item,
    siteKey,
    titleFingerprint: item.titleFingerprint || buildTitleFingerprint(item.title, siteKey),
  };
}

function chooseCanonicalSuggestion(
  current: SearchSuggestionItem,
  candidate: SearchSuggestionItem,
): SearchSuggestionItem {
  if (current.source !== candidate.source) {
    return current.source === "bookmark" ? current : candidate;
  }

  if (current.source === "bookmark") {
    const currentBookmarkScore = (current.dateLastUsed ?? 0) * 10 + (current.dateAdded ?? 0);
    const candidateBookmarkScore = (candidate.dateLastUsed ?? 0) * 10 + (candidate.dateAdded ?? 0);
    if (candidateBookmarkScore !== currentBookmarkScore) {
      return candidateBookmarkScore > currentBookmarkScore ? candidate : current;
    }
  }

  if (current.source === "history") {
    const currentHistoryScore =
      (current.typedCount ?? 0) * 100
      + (current.visitCount ?? 0) * 10
      + (current.lastVisitedAt ?? 0);
    const candidateHistoryScore =
      (candidate.typedCount ?? 0) * 100
      + (candidate.visitCount ?? 0) * 10
      + (candidate.lastVisitedAt ?? 0);
    if (candidateHistoryScore !== currentHistoryScore) {
      return candidateHistoryScore > currentHistoryScore ? candidate : current;
    }
  }

  const currentPathLength = getSuggestionPathname(current.url).length;
  const candidatePathLength = getSuggestionPathname(candidate.url).length;
  if (candidatePathLength !== currentPathLength) {
    return candidatePathLength < currentPathLength ? candidate : current;
  }

  return candidate.title.length < current.title.length ? candidate : current;
}

function canClusterSuggestions(current: SearchSuggestionItem, candidate: SearchSuggestionItem): boolean {
  if (getSuggestionDedupKey(current.url) === getSuggestionDedupKey(candidate.url)) {
    return true;
  }

  if (!current.siteKey || current.siteKey !== candidate.siteKey) {
    return false;
  }

  if (
    current.titleFingerprint
    && candidate.titleFingerprint
    && current.titleFingerprint === candidate.titleFingerprint
  ) {
    return true;
  }

  if (isDuplicateLikelyPath(current.url) || isDuplicateLikelyPath(candidate.url)) {
    return true;
  }

  return false;
}

export function dedupeSuggestionItems(items: SearchSuggestionItem[]): SearchSuggestionItem[] {
  const buckets: DedupeBucket[] = [];

  for (const rawItem of items) {
    const item = withDerivedSuggestionFields(rawItem);
    const matchedBucket = buckets.find((bucket) => canClusterSuggestions(bucket.canonical, item));

    if (!matchedBucket) {
      buckets.push({ canonical: item, items: [item] });
      continue;
    }

    matchedBucket.items.push(item);
    matchedBucket.canonical = chooseCanonicalSuggestion(matchedBucket.canonical, item);
  }

  return buckets.map((bucket) => bucket.canonical);
}

export function dedupeSuggestionCollections(
  historySuggestions: SearchSuggestionItem[],
  bookmarkSuggestions: SearchSuggestionItem[],
  limits: {
    historyLimit?: number;
    bookmarkLimit?: number;
  } = {},
): {
  historySuggestions: SearchSuggestionItem[];
  bookmarkSuggestions: SearchSuggestionItem[];
  suggestions: SearchSuggestionItem[];
} {
  const dedupedBookmarks = dedupeSuggestionItems(bookmarkSuggestions);
  const bookmarkKeys = new Set(dedupedBookmarks.map((item) => getSuggestionDedupKey(item.url)));
  const bookmarkSiteTitleKeys = new Set(
    dedupedBookmarks
      .map((item) => withDerivedSuggestionFields(item))
      .map((item) => `${item.siteKey}::${item.titleFingerprint}`),
  );

  const dedupedHistory = dedupeSuggestionItems(historySuggestions).filter((item) => {
    const normalized = withDerivedSuggestionFields(item);
    if (bookmarkKeys.has(getSuggestionDedupKey(normalized.url))) return false;
    if (bookmarkSiteTitleKeys.has(`${normalized.siteKey}::${normalized.titleFingerprint}`)) return false;
    if (isDuplicateLikelyPath(normalized.url) && dedupedBookmarks.some((bookmark) => bookmark.siteKey === normalized.siteKey)) {
      return false;
    }
    return true;
  });

  const limitedHistory =
    typeof limits.historyLimit === "number"
      ? dedupedHistory.slice(0, limits.historyLimit)
      : dedupedHistory;
  const limitedBookmarks =
    typeof limits.bookmarkLimit === "number"
      ? dedupedBookmarks.slice(0, limits.bookmarkLimit)
      : dedupedBookmarks;

  return {
    historySuggestions: limitedHistory,
    bookmarkSuggestions: limitedBookmarks,
    suggestions: [...limitedHistory, ...limitedBookmarks],
  };
}

function normalizeHistorySuggestion(item: ChromeHistoryItem): SearchSuggestionItem | null {
  if (!item.url || !isSupportedSuggestionUrl(item.url)) return null;

  const title = item.title?.trim() || extractSiteName(item.url);
  const siteKey = getSuggestionSiteKey(item.url);

  return {
    id: `history:${item.url}`,
    source: "history",
    title,
    url: item.url,
    subtitle: formatSuggestionUrl(item.url),
    siteKey,
    titleFingerprint: buildTitleFingerprint(title, siteKey),
    lastVisitedAt: item.lastVisitTime ?? 0,
    visitCount: item.visitCount ?? 0,
    typedCount: item.typedCount ?? 0,
  };
}

function normalizeBookmarkSuggestion(item: ChromeBookmarkNode): SearchSuggestionItem | null {
  if (!item.url || !isSupportedSuggestionUrl(item.url)) return null;

  const title = item.title?.trim() || extractSiteName(item.url);
  const siteKey = getSuggestionSiteKey(item.url);

  return {
    id: `bookmark:${item.id}`,
    source: "bookmark",
    title,
    url: item.url,
    subtitle: formatSuggestionUrl(item.url),
    siteKey,
    titleFingerprint: buildTitleFingerprint(title, siteKey),
    dateAdded: item.dateAdded ?? 0,
    dateLastUsed: item.dateLastUsed ?? 0,
  };
}

export async function searchHistorySuggestions(
  query: string,
  limit = DEFAULT_HISTORY_SUGGESTION_LIMIT,
): Promise<SearchSuggestionItem[]> {
  const normalizedQuery = normalizeQuery(query);
  if (!normalizedQuery) return [];

  const chrome = getChrome();
  const historyApi = chrome?.history;
  if (!historyApi?.search) return [];
  const searchHistory = historyApi.search;
  const runtime = chrome?.runtime;

  return await new Promise<SearchSuggestionItem[]>((resolve, reject) => {
    searchHistory(
      {
        text: normalizedQuery,
        startTime: 0,
        maxResults: Math.max(limit * 3, limit),
      },
      (items) => {
        if (runtime?.lastError) {
          reject(new Error(runtime.lastError.message ?? "读取历史建议失败"));
          return;
        }

        const normalized = items
          .map(normalizeHistorySuggestion)
          .filter((item): item is SearchSuggestionItem => !!item)
          .sort((left, right) => compareSuggestions(normalizedQuery, left, right));
        const deduped = dedupeSuggestionItems(normalized)
          .slice(0, limit);

        resolve(deduped);
      },
    );
  });
}

export async function searchBookmarkSuggestions(
  query: string,
  limit = DEFAULT_BOOKMARK_SUGGESTION_LIMIT,
): Promise<SearchSuggestionItem[]> {
  const normalizedQuery = normalizeQuery(query);
  if (!normalizedQuery) return [];

  const chrome = getChrome();
  const bookmarksApi = chrome?.bookmarks;
  if (!bookmarksApi?.search) return [];
  const searchBookmarks = bookmarksApi.search;
  const runtime = chrome?.runtime;

  return await new Promise<SearchSuggestionItem[]>((resolve, reject) => {
    searchBookmarks(normalizedQuery, (results) => {
      if (runtime?.lastError) {
        reject(new Error(runtime.lastError.message ?? "读取收藏建议失败"));
        return;
      }

      const normalized = results
        .map(normalizeBookmarkSuggestion)
        .filter((item): item is SearchSuggestionItem => !!item)
        .sort((left, right) => compareSuggestions(normalizedQuery, left, right));
      const deduped = dedupeSuggestionItems(normalized)
        .slice(0, limit);

      resolve(deduped);
    });
  });
}
