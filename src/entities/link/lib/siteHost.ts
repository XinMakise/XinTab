const MULTI_LEVEL_PUBLIC_SUFFIXES = [
  "co.uk",
  "org.uk",
  "gov.uk",
  "ac.uk",
  "com.cn",
  "net.cn",
  "org.cn",
  "com.hk",
  "com.tw",
  "co.jp",
  "com.au",
  "com.br",
  "co.kr",
  "co.nz",
] as const;

function isIpHost(host: string): boolean {
  return /^\d{1,3}(?:\.\d{1,3}){3}$/.test(host) || host.includes(":");
}

function getMinimumHostLabels(host: string): number {
  const matchedSuffix = MULTI_LEVEL_PUBLIC_SUFFIXES.find(
    (suffix) => host === suffix || host.endsWith(`.${suffix}`),
  );
  if (!matchedSuffix) return 2;
  return matchedSuffix.split(".").length + 1;
}

export function normalizeHost(host: string): string {
  return host.trim().toLowerCase();
}

export function normalizeComparableHost(host: string): string {
  return normalizeHost(host).replace(/^www\./, "");
}

export function getHostVariants(host: string): string[] {
  const normalizedHost = normalizeHost(host);
  if (!normalizedHost) return [];
  if (normalizedHost === "localhost" || isIpHost(normalizedHost)) return [normalizedHost];

  const labels = normalizedHost.split(".").filter(Boolean);
  const minimumLabels = getMinimumHostLabels(normalizedHost);
  const variants: string[] = [];

  for (let start = 0; labels.length - start >= minimumLabels; start += 1) {
    variants.push(labels.slice(start).join("."));
  }

  return variants;
}

export function getRegistrableDomain(host: string): string {
  const normalizedHost = normalizeComparableHost(host);
  const variants = getHostVariants(normalizedHost);
  return variants.at(-1) ?? normalizedHost;
}
