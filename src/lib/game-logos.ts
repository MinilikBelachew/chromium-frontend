/** Local original game logos (not third-party assets). */
export function gameLogoUrl(slug: string): string {
  return `/games/${encodeURIComponent(slug)}.svg`;
}
