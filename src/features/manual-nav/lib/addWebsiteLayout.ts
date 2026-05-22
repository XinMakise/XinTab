export function shouldUseCompactAddWebsiteCard(
  availableWidth: number,
  labelWidth: number,
) {
  return availableWidth > 0 && labelWidth > 0 && labelWidth > availableWidth;
}
