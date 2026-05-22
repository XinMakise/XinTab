import { normalizeSiteUrl } from "./siteLinks";
import { getHostVariants, normalizeComparableHost } from "./siteHost";

const AUTO_SITE_ICON_CACHE_KEY = "xintab:auto-site-icon-cache:v1";
const MAX_AUTO_SITE_ICON_CACHE_SIZE = 200;
const HOST_SPECIFIC_ICON_CANDIDATES: Record<string, string[]> = {
  "www.qianwen.com": [
    "https://img.alicdn.com/imgextra/i4/O1CN01uar8u91DHWktnF2fl_!!6000000000191-2-tps-110-110.png",
  ],
  "qianwen.com": [
    "https://img.alicdn.com/imgextra/i4/O1CN01uar8u91DHWktnF2fl_!!6000000000191-2-tps-110-110.png",
  ],
};

const autoSiteIconCache = new Map<string, string>();
let autoSiteIconCacheHydrated = false;

function parseSiteUrl(rawUrl: string): URL | null {
  const normalizedUrl = normalizeSiteUrl(rawUrl);
  if (!normalizedUrl) return null;

  try {
    return new URL(normalizedUrl);
  } catch {
    return null;
  }
}

function buildOriginIconCandidates(origin: string): string[] {
  const paths = [
    "/favicon.ico",
    "/favicon.svg",
    "/apple-touch-icon.png",
    "/apple-touch-icon-180x180.png",
    "/android-chrome-512x512.png",
    "/android-chrome-192x192.png",
    "/icon.svg",
    "/icon.png",
    "/favicon-32x32.png",
  ];

  return paths.map((path) => new URL(path, origin).toString());
}

function buildHostSpecificIconCandidates(hostVariants: string[]): string[] {
  return hostVariants.flatMap((host) => HOST_SPECIFIC_ICON_CANDIDATES[host] ?? []);
}

function hydrateAutoSiteIconCache() {
  if (autoSiteIconCacheHydrated || typeof window === "undefined") return;
  autoSiteIconCacheHydrated = true;

  try {
    const raw = window.localStorage.getItem(AUTO_SITE_ICON_CACHE_KEY);
    if (!raw) return;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return;

    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof key === "string" && typeof value === "string") {
        autoSiteIconCache.set(key, value);
      }
    }
  } catch {
    autoSiteIconCache.clear();
  }
}

function persistAutoSiteIconCache() {
  if (typeof window === "undefined") return;

  try {
    const entries = Array.from(autoSiteIconCache.entries()).slice(-MAX_AUTO_SITE_ICON_CACHE_SIZE);
    window.localStorage.setItem(
      AUTO_SITE_ICON_CACHE_KEY,
      JSON.stringify(Object.fromEntries(entries)),
    );
  } catch {
    // Ignore storage failures; runtime cache still works for this session.
  }
}

export function getAutoSiteIconCacheKey(url: string): string {
  const parsed = parseSiteUrl(url);
  if (!parsed) return url.trim().toLowerCase();
  return normalizeComparableHost(parsed.hostname);
}

export function buildAutoSiteIconCandidates(url: string): string[] {
  const parsed = parseSiteUrl(url);
  if (!parsed) return [];

  const protocol = parsed.protocol === "http:" ? "http:" : "https:";
  const hostVariants = getHostVariants(parsed.hostname);
  const candidateOrigins = hostVariants.map((host) =>
    host === parsed.hostname ? parsed.origin : `${protocol}//${host}`,
  );
  const candidates = [
    ...buildHostSpecificIconCandidates(hostVariants),
    ...buildOriginIconCandidates(parsed.origin),
    ...hostVariants.map((host) => `https://logo.clearbit.com/${encodeURIComponent(host)}`),
    ...hostVariants.map((host) => `https://favicon.im/${encodeURIComponent(host)}?larger=true`),
    `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(parsed.origin)}&sz=128`,
    ...hostVariants.flatMap((host) => [
      `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=128`,
      `https://icons.duckduckgo.com/ip3/${encodeURIComponent(host)}.ico`,
    ]),
    ...candidateOrigins.slice(1).flatMap((origin) => buildOriginIconCandidates(origin)),
  ];

  return candidates.filter((candidate, index) => candidates.indexOf(candidate) === index);
}

export function getCachedAutoSiteIconSrc(cacheKey: string): string | undefined {
  hydrateAutoSiteIconCache();
  return autoSiteIconCache.get(cacheKey);
}

export function clearCachedAutoSiteIconSrc(cacheKey?: string) {
  hydrateAutoSiteIconCache();

  if (cacheKey) {
    autoSiteIconCache.delete(cacheKey);
  } else {
    autoSiteIconCache.clear();
  }

  persistAutoSiteIconCache();
}

export function setCachedAutoSiteIconSrc(cacheKey: string, src: string) {
  hydrateAutoSiteIconCache();

  const cached = autoSiteIconCache.get(cacheKey);
  if (cached === src) {
    return;
  }

  if (cached) {
    autoSiteIconCache.delete(cacheKey);
  }

  autoSiteIconCache.set(cacheKey, src);

  while (autoSiteIconCache.size > MAX_AUTO_SITE_ICON_CACHE_SIZE) {
    const firstKey = autoSiteIconCache.keys().next().value;
    if (!firstKey) break;
    autoSiteIconCache.delete(firstKey);
  }

  persistAutoSiteIconCache();
}
