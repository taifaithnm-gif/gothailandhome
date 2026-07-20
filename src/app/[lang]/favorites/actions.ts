"use server";

import { getPublishedPropertiesBySlugs } from "@/lib/data/properties";
import { FAVORITES_MAX_ITEMS } from "@/lib/favorites";
import type { PropertyView } from "@/lib/property/property-view";

export type ResolveFavoritesResult = {
  properties: PropertyView[];
  missingSlugs: string[];
};

/**
 * Resolve local favorite slugs against published inventory.
 * Unpublished / missing slugs are returned separately for prune/unavailable UI.
 */
export async function resolveFavoriteProperties(
  slugs: string[],
): Promise<ResolveFavoritesResult> {
  const requested = Array.from(
    new Set(
      slugs
        .map((slug) => String(slug).trim().toLowerCase())
        .filter(Boolean),
    ),
  ).slice(0, FAVORITES_MAX_ITEMS);

  const properties = await getPublishedPropertiesBySlugs(requested);
  const found = new Set(properties.map((property) => property.slug));
  const missingSlugs = requested.filter((slug) => !found.has(slug));

  return { properties, missingSlugs };
}
