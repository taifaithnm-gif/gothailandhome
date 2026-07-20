"use server";

import { getPublishedPropertiesBySlugs } from "@/lib/data/properties";
import { COMPARE_MAX_ITEMS } from "@/lib/compare";
import type { PropertyView } from "@/lib/property/property-view";

export type ResolveCompareResult = {
  properties: PropertyView[];
  missingSlugs: string[];
};

/**
 * Resolve local comparison slugs against published inventory.
 * Unpublished / missing slugs are returned separately for prune/unavailable UI.
 */
export async function resolveCompareProperties(
  slugs: string[],
): Promise<ResolveCompareResult> {
  const requested = Array.from(
    new Set(
      slugs
        .map((slug) => String(slug).trim().toLowerCase())
        .filter(Boolean),
    ),
  ).slice(0, COMPARE_MAX_ITEMS);

  const properties = await getPublishedPropertiesBySlugs(requested);
  const found = new Set(properties.map((property) => property.slug));
  const missingSlugs = requested.filter((slug) => !found.has(slug));

  return { properties, missingSlugs };
}
