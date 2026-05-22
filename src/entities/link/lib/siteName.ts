/**
 * 从 URL 中提取展示用站点名称。
 */
export function extractSiteName(url: string): string {
  try {
    const urlWithProtocol =
      url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;

    const urlObj = new URL(urlWithProtocol);
    const hostname = urlObj.hostname.replace(/^www\./, "");
    const pathname = urlObj.pathname;

    if (pathname && pathname !== "/" && pathname.length > 1) {
      const pathParts = pathname.split("/").filter(Boolean);
      if (pathParts.length > 0) {
        return `${hostname}/${pathParts[0]}`;
      }
    }

    const domainParts = hostname.split(".");
    if (domainParts.length >= 2) {
      return domainParts[0];
    }

    return hostname;
  } catch {
    return url;
  }
}
