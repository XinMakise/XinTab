export {
  DEFAULT_SITE_ICON_COLOR,
  DEFAULT_SITE_ICON_PRESET,
  getSiteIconForeground,
  getSiteIconKey,
  getSiteIconPreset,
  getSiteIconTextLayout,
  getSuggestedSiteIconText,
  getSuggestedSiteTitle,
  isCustomSiteTitle,
  normalizeSiteLinkIcon,
  normalizeSiteUrl,
  SITE_ICON_COLORS,
  SITE_ICON_PRESETS,
} from "./lib/siteLinks";
export {
  buildAutoSiteIconCandidates,
  clearCachedAutoSiteIconSrc,
  getAutoSiteIconCacheKey,
  getCachedAutoSiteIconSrc,
  setCachedAutoSiteIconSrc,
} from "./lib/siteIcon";
export { extractSiteName } from "./lib/siteName";
export { getRegistrableDomain, getHostVariants, normalizeComparableHost } from "./lib/siteHost";
