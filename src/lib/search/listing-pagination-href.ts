export const LISTING_RESULTS_HASH = "#listing-results";

/** Build a pagination href; page 1 omits `page`, and filters are preserved. */
export function buildListingPaginationHref(
  locale: string,
  basePath: string,
  params: Record<string, string | undefined>,
  page: number,
  resultsHash = LISTING_RESULTS_HASH,
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  if (page > 1) search.set("page", String(page));
  const qs = search.toString();
  const normalized = basePath.startsWith("/") ? basePath : `/${basePath}`;
  const path = `/${locale}${normalized}${qs ? `?${qs}` : ""}`;
  return `${path}${resultsHash}`;
}
