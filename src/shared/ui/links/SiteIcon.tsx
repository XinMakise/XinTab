import React, { useEffect, useMemo, useRef, useState } from "react";

import {
  buildAutoSiteIconCandidates,
  clearCachedAutoSiteIconSrc,
  getAutoSiteIconCacheKey,
  getCachedAutoSiteIconSrc,
  setCachedAutoSiteIconSrc,
} from "@/entities/link";
import {
  getSiteIconForeground,
  getSiteIconKey,
  getSiteIconPreset,
  getSiteIconTextLayout,
  getSuggestedSiteIconText,
  normalizeSiteLinkIcon,
} from "@/entities/link";
import { cn } from "@/shared/lib/cn";
import type { SiteLinkIcon } from "@/shared/types/link";

const DEFAULT_ICON_SIZE = 36;

function safeHostname(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function initialFromHost(host: string) {
  const cleaned = host.replace(/^www\./, "");
  return (cleaned[0] || "?").toUpperCase();
}

function parsePixelValue(value?: React.CSSProperties["width"]): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value;
  }

  if (typeof value === "string") {
    const matched = value.trim().match(/^(\d+(?:\.\d+)?)px$/i);
    if (matched) {
      const parsed = Number.parseFloat(matched[1] ?? "");
      if (Number.isFinite(parsed) && parsed > 0) return parsed;
    }
  }

  return null;
}

function resolveIconSize(style?: React.CSSProperties): number {
  const width = parsePixelValue(style?.width);
  const height = parsePixelValue(style?.height);

  if (width && height) return Math.min(width, height);
  if (width) return width;
  if (height) return height;
  return DEFAULT_ICON_SIZE;
}

function buildCandidates(url: string, cacheKey: string): string[] {
  const cached = getCachedAutoSiteIconSrc(cacheKey);
  const candidates = buildAutoSiteIconCandidates(url);
  if (!cached) return candidates;
  return [cached, ...candidates.filter((c) => c !== cached)];
}

export const SiteIcon = React.memo(function SiteIcon({
  url,
  title,
  icon,
  className,
  style,
}: {
  url: string;
  title?: string;
  icon?: SiteLinkIcon;
  className?: string;
  style?: React.CSSProperties;
}) {
  const host = useMemo(() => safeHostname(url), [url]);
  const iconSize = useMemo(() => resolveIconSize(style), [style]);
  const normalizedIcon = useMemo(() => normalizeSiteLinkIcon(icon), [icon]);
  const iconKey = useMemo(() => getSiteIconKey(normalizedIcon), [normalizedIcon]);
  const cacheKey = useMemo(() => getAutoSiteIconCacheKey(url), [url]);

  const [candidates, setCandidates] = useState(() => buildCandidates(url, cacheKey));
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [failed, setFailed] = useState(false);
  const currentSrcRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    setCandidates(buildCandidates(url, cacheKey));
    setCandidateIndex(0);
    setFailed(false);
  }, [iconKey, url, cacheKey]);

  const src = candidates[candidateIndex];
  currentSrcRef.current = src;

  if (normalizedIcon) {
    const backgroundColor = normalizedIcon.color ?? "#0F766E";
    const foregroundColor = getSiteIconForeground(backgroundColor);
    const preset = normalizedIcon.type === "preset" ? getSiteIconPreset(normalizedIcon.name) : undefined;
    const PresetIcon = preset?.icon;
    const textContent =
      normalizedIcon.type === "text"
        ? normalizedIcon.text
        : title
          ? getSuggestedSiteIconText(title, url)
          : initialFromHost(host);
    const layout = getSiteIconTextLayout(textContent);

    return (
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center overflow-hidden rounded-md border text-sm font-medium shadow-sm",
          className,
        )}
        style={{
          ...style,
          backgroundColor,
          color: foregroundColor,
          borderColor: `${backgroundColor}55`,
        }}
        aria-label={title || host}
        title={title || host}
      >
        {PresetIcon ? (
          <PresetIcon
            style={{
              width: `${Math.max(12, Math.round(iconSize * 0.44))}px`,
              height: `${Math.max(12, Math.round(iconSize * 0.44))}px`,
            }}
            strokeWidth={2.2}
          />
        ) : (
          <span
            className="max-w-[84%] overflow-hidden text-center leading-none whitespace-nowrap"
            style={{
              fontSize: `${Math.max(10, Math.round(iconSize * layout.fontScale))}px`,
              fontWeight: layout.fontWeight,
              letterSpacing: layout.letterSpacing,
            }}
          >
            {textContent}
          </span>
        )}
      </div>
    );
  }

  if (failed || !src) {
    const initial = title ? getSuggestedSiteIconText(title, url) : initialFromHost(host);
    const layout = getSiteIconTextLayout(initial);
    return (
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center overflow-hidden rounded-md border bg-muted text-sm font-medium",
          className,
        )}
        style={style}
        aria-label={title || host}
        title={title || host}
      >
        <span
          className="max-w-[84%] overflow-hidden text-center leading-none whitespace-nowrap"
          style={{
            fontSize: `${Math.max(10, Math.round(iconSize * layout.fontScale))}px`,
            fontWeight: layout.fontWeight,
            letterSpacing: layout.letterSpacing,
          }}
        >
          {initial}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={title ? `${title} 图标` : `${host} 图标`}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      className={cn("h-9 w-9 rounded-md border bg-card", className)}
      style={style}
      onLoad={() => {
        if (src) setCachedAutoSiteIconSrc(cacheKey, src);
      }}
      onError={() => {
        if (src === getCachedAutoSiteIconSrc(cacheKey)) {
          clearCachedAutoSiteIconSrc(cacheKey);
        }
        if (candidateIndex >= candidates.length - 1) {
          setFailed(true);
          return;
        }
        setCandidateIndex((prev) => prev + 1);
      }}
    />
  );
});
