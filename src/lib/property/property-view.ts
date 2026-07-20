/**
 * Client-safe property presentation types and price formatting.
 * Keep data loaders in `@/lib/data/properties` (server-only).
 */

import type { Locale } from "@/config/locales";
import type {
  ListingType,
  PropertyFeatureRow,
  PropertyMediaRow,
  PropertyType,
} from "@/lib/supabase/types";

export type PropertyView = {
  id: string;
  slug: string;
  status: "draft" | "published";
  listingType: ListingType;
  type: PropertyType;
  locationId: string;
  projectId: string | null;
  agentId: string | null;
  cityId: string | null;
  districtId: string | null;
  developerSlug: string | null;
  projectSlug: string | null;
  projectName: Record<Locale, string>;
  districtSlug: string | null;
  districtName: Record<Locale, string>;
  bedrooms: number | null;
  bathrooms: number | null;
  areaSqm: number | null;
  landAreaSqm: number | null;
  floorLabel: string | null;
  buildingLabel: string | null;
  priceThb: number;
  featured: boolean;
  transitTags: string[];
  source: string | null;
  listingUrl: string | null;
  sourceUpdatedAt: string | null;
  lastVerifiedAt: string | null;
  isVerifiedListing: boolean;
  publishedAt: string | null;
  title: Record<Locale, string>;
  location: Record<Locale, string>;
  summary: Record<Locale, string>;
  description: Record<Locale, string>;
  coverUrl: string | null;
  media: PropertyMediaRow[];
  features: PropertyFeatureRow[];
};

export function formatPrice(
  priceThb: number,
  locale: Locale,
  listingType?: ListingType,
): string {
  const numberLocale =
    locale === "zh" ? "zh-CN" : locale === "th" ? "th-TH" : "en-US";

  const formatted = new Intl.NumberFormat(numberLocale, {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(priceThb);

  if (listingType === "rent") {
    return `${formatted}/mo`;
  }

  return formatted;
}
