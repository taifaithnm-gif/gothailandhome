/**
 * Pure sitemap inventory helpers — no DB, no Next runtime.
 * Used by `sitemap.ts` and deterministic SEO completeness tests.
 */

/** PostgREST-safe page size for verified property slug inventory. */
export const SITEMAP_PROPERTY_PAGE_SIZE = 500;

/**
 * Hard ceiling so a runaway loop cannot exhaust memory.
 * 500 × 40 = 20_000 property rows max per generation.
 */
export const SITEMAP_PROPERTY_MAX_PAGES = 40;

export type SitemapUrlEntry = {
  url: string;
  lastModified: Date;
  changeFrequency: "weekly";
  priority: number;
};

/**
 * Whether another bounded page should be fetched after receiving `rowCount` rows
 * on zero-based `pageIndex`.
 */
export function hasMoreSitemapPropertyPages(
  rowCount: number,
  pageIndex: number,
  pageSize: number = SITEMAP_PROPERTY_PAGE_SIZE,
  maxPages: number = SITEMAP_PROPERTY_MAX_PAGES,
): boolean {
  if (pageIndex + 1 >= maxPages) return false;
  return rowCount >= pageSize;
}

/**
 * Expand property slugs into localized sitemap entries for every locale.
 * Completeness invariant: `entries.length === slugs.length * locales.length`.
 */
export function buildLocalizedPropertySitemapEntries(input: {
  siteUrl: string;
  locales: readonly string[];
  slugs: readonly string[];
  lastModified: Date;
}): SitemapUrlEntry[] {
  const { siteUrl, locales, slugs, lastModified } = input;
  return locales.flatMap((locale) =>
    slugs.map((slug) => ({
      url: `${siteUrl}/${locale}/properties/${slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  );
}
