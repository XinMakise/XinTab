import { getChrome, hasChromeHistory, type ChromeHistoryItem } from "@/shared/browser/chrome";
import { extractSiteName } from "@/entities/link";
import type { RecentVisitItem } from "@/shared/types/recent-visit";

export const RECENT_VISITS_LIMIT = 10;
export const RECENT_VISITS_MIN = 4;
export const RECENT_VISITS_MAX = 20;
export const RECENT_VISITS_CARD_SIZE_DEFAULT = 100;
export const RECENT_VISITS_CARD_SIZE_MIN = 80;
export const RECENT_VISITS_CARD_SIZE_MAX = 120;
export const RECENT_VISITS_ROWS_DEFAULT = 2;
export const RECENT_VISITS_ROWS_MIN = 1;
export const RECENT_VISITS_ROWS_MAX = 2;
export const RECENT_VISITS_CONTENT_MAX_WIDTH = 1152;
const RECENT_VISITS_CONTENT_HORIZONTAL_PADDING = 32;
const RECENT_VISITS_GRID_GAP = 12;
const RECENT_VISITS_CARD_MIN_WIDTH_BASE = 176;
const HISTORY_SEARCH_MAX_RESULTS = 1000;
const DISTINCT_RECENT_VISITS_MULTIPLIER = 5;
const DISTINCT_RECENT_VISITS_MIN_WINDOW = 50;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function normalizeRecentVisitsLimit(value: number | undefined): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return RECENT_VISITS_LIMIT;
  }

  return clamp(Math.round(value), RECENT_VISITS_MIN, RECENT_VISITS_MAX);
}

function normalizeRecentVisitsFetchLimit(value: number | undefined): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return RECENT_VISITS_LIMIT;
  }

  return clamp(Math.round(value), 1, HISTORY_SEARCH_MAX_RESULTS);
}

export function normalizeRecentVisitsCardSize(value: number | undefined): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return RECENT_VISITS_CARD_SIZE_DEFAULT;
  }

  return clamp(Math.round(value), RECENT_VISITS_CARD_SIZE_MIN, RECENT_VISITS_CARD_SIZE_MAX);
}

export function normalizeRecentVisitsRows(
  value: number | undefined,
  legacyCount?: number,
): number {
  if (typeof value === "number" && !Number.isNaN(value)) {
    return clamp(Math.round(value), RECENT_VISITS_ROWS_MIN, RECENT_VISITS_ROWS_MAX);
  }

  if (typeof legacyCount === "number" && !Number.isNaN(legacyCount)) {
    return legacyCount <= 6 ? 1 : 2;
  }

  return RECENT_VISITS_ROWS_DEFAULT;
}

export function getRecentVisitsMinColumnWidth(cardSize?: number): number {
  return Math.round(
    RECENT_VISITS_CARD_MIN_WIDTH_BASE * (normalizeRecentVisitsCardSize(cardSize) / 100),
  );
}

export function getRecentVisitsColumnsPerRow(containerWidth: number, cardSize?: number): number {
  const minColumnWidth = getRecentVisitsMinColumnWidth(cardSize);
  if (!Number.isFinite(containerWidth) || containerWidth <= 0) {
    return 1;
  }

  return Math.max(
    1,
    Math.floor(
      (Math.max(containerWidth, minColumnWidth) + RECENT_VISITS_GRID_GAP)
        / (minColumnWidth + RECENT_VISITS_GRID_GAP),
    ),
  );
}

export function getRecentVisitsVisibleCount(
  containerWidth: number,
  rows?: number,
  cardSize?: number,
): number {
  return getRecentVisitsColumnsPerRow(containerWidth, cardSize) * normalizeRecentVisitsRows(rows);
}

export function estimateRecentVisitsContentWidth(viewportWidth?: number): number {
  if (typeof viewportWidth !== "number" || Number.isNaN(viewportWidth)) {
    return RECENT_VISITS_CONTENT_MAX_WIDTH;
  }

  return Math.max(
    getRecentVisitsMinColumnWidth(),
    Math.min(
      RECENT_VISITS_CONTENT_MAX_WIDTH,
      Math.round(viewportWidth) - RECENT_VISITS_CONTENT_HORIZONTAL_PADDING,
    ),
  );
}

function isSupportedHistoryUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeRecentVisitTitle(title: string | undefined, url: string): string {
  const normalizedTitle = title?.trim();
  if (normalizedTitle) return normalizedTitle;
  return extractSiteName(url);
}

function toRecentVisitItem(item: ChromeHistoryItem): RecentVisitItem | null {
  if (!item.url || !isSupportedHistoryUrl(item.url)) return null;

  try {
    const parsed = new URL(item.url);
    const origin = parsed.origin;
    const domain = parsed.hostname;

    return {
      id: domain,
      title: normalizeRecentVisitTitle(item.title, item.url),
      url: item.url,
      origin,
      lastVisitedAt: item.lastVisitTime ?? 0,
    };
  } catch {
    return null;
  }
}

export function normalizeRecentVisitItems(
  items: ChromeHistoryItem[],
  limit = RECENT_VISITS_LIMIT,
): RecentVisitItem[] {
  const ordered = [...items].sort(
    (a, b) => (b.lastVisitTime ?? 0) - (a.lastVisitTime ?? 0),
  );
  const seenDomains = new Set<string>();
  const normalized: RecentVisitItem[] = [];

  for (const item of ordered) {
    const visit = toRecentVisitItem(item);
    if (!visit || seenDomains.has(visit.id)) continue;

    seenDomains.add(visit.id);
    normalized.push(visit);

    if (normalized.length >= limit) break;
  }

  return normalized;
}

function getRecentVisitsSearchWindow(limit: number): number {
  return clamp(
    Math.max(
      limit,
      limit * DISTINCT_RECENT_VISITS_MULTIPLIER,
      DISTINCT_RECENT_VISITS_MIN_WINDOW,
    ),
    1,
    HISTORY_SEARCH_MAX_RESULTS,
  );
}

export async function getRecentVisitItems(
  limit = RECENT_VISITS_LIMIT,
): Promise<RecentVisitItem[]> {
  if (!hasChromeHistory()) return [];

  const chrome = getChrome();
  const normalizedLimit = normalizeRecentVisitsFetchLimit(limit);
  const searchWindow = getRecentVisitsSearchWindow(normalizedLimit);

  return await new Promise<RecentVisitItem[]>((resolve, reject) => {
    chrome!.history!.search(
      {
        text: "",
        startTime: 0,
        maxResults: searchWindow,
      },
      (items) => {
        if (chrome?.runtime?.lastError) {
          reject(new Error(chrome.runtime.lastError.message ?? "读取 Chrome 历史失败"));
          return;
        }

        resolve(normalizeRecentVisitItems(items, normalizedLimit));
      },
    );
  });
}

export function formatRecentVisitTime(lastVisitedAt: number, now = Date.now()): string {
  if (!lastVisitedAt) return "刚刚";

  const diffMs = Math.max(0, now - lastVisitedAt);
  const diffMinutes = Math.floor(diffMs / 60_000);

  if (diffMinutes < 1) return "刚刚";
  if (diffMinutes < 60) return `${diffMinutes} 分钟前`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} 小时前`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} 天前`;

  const visitDate = new Date(lastVisitedAt);
  return `${visitDate.getMonth() + 1} 月 ${visitDate.getDate()} 日`;
}

export function formatRecentVisitUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const pathname =
      parsed.pathname && parsed.pathname !== "/"
        ? parsed.pathname.replace(/\/$/, "")
        : "";
    return `${parsed.host}${pathname}`;
  } catch {
    return url;
  }
}
