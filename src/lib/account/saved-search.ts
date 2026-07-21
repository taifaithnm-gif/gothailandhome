/**
 * Saved search filter serialization (P2-014).
 * Round-trip with listing search state fields used by /properties.
 */

export type SavedSearchFilters = {
  q?: string;
  location?: string;
  sort?: string;
  listingType?: "sale" | "rent" | "all";
  type?: string;
  city?: string;
  district?: string;
  project?: string;
  developer?: string;
  transit?: string;
  bedrooms?: number;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  page?: number;
};

export type SavedSearchAlertFrequency = "off" | "instant" | "daily" | "weekly";

const MAX_Q = 200;
const MAX_SLUG = 120;

function cleanText(value: unknown, max = MAX_Q): string | undefined {
  if (typeof value !== "string") return undefined;
  const v = value.trim();
  if (!v || v.length > max) return undefined;
  return v;
}

function cleanNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return value;
  }
  if (typeof value === "string" && /^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(value)) {
    return Number(value);
  }
  return undefined;
}

export function parseSavedSearchFilters(raw: unknown): SavedSearchFilters {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const obj = raw as Record<string, unknown>;
  const listingType = obj.listingType ?? obj.listing_type;
  const filters: SavedSearchFilters = {
    q: cleanText(obj.q),
    location: cleanText(obj.location, MAX_SLUG),
    sort: cleanText(obj.sort, 40),
    type: cleanText(obj.type, 40),
    city: cleanText(obj.city, MAX_SLUG),
    district: cleanText(obj.district, MAX_SLUG),
    project: cleanText(obj.project, MAX_SLUG),
    developer: cleanText(obj.developer, MAX_SLUG),
    transit: cleanText(obj.transit, 40),
    bedrooms: cleanNumber(obj.bedrooms),
    minPrice: cleanNumber(obj.minPrice ?? obj.min_price),
    maxPrice: cleanNumber(obj.maxPrice ?? obj.max_price),
    minArea: cleanNumber(obj.minArea ?? obj.min_area),
    maxArea: cleanNumber(obj.maxArea ?? obj.max_area),
    page: cleanNumber(obj.page),
  };
  if (listingType === "sale" || listingType === "rent" || listingType === "all") {
    filters.listingType = listingType;
  }
  return filters;
}

export function serializeSavedSearchFilters(
  filters: SavedSearchFilters,
): Record<string, unknown> {
  return parseSavedSearchFilters(filters) as Record<string, unknown>;
}

export function savedSearchFiltersToQuery(
  filters: SavedSearchFilters,
): Record<string, string> {
  const parsed = parseSavedSearchFilters(filters);
  const query: Record<string, string> = {};
  if (parsed.q) query.q = parsed.q;
  if (parsed.location) query.location = parsed.location;
  if (parsed.sort) query.sort = parsed.sort;
  if (parsed.listingType && parsed.listingType !== "all") {
    query.listing_type = parsed.listingType;
  }
  if (parsed.type) query.type = parsed.type;
  if (parsed.city) query.city = parsed.city;
  if (parsed.district) query.district = parsed.district;
  if (parsed.project) query.project = parsed.project;
  if (parsed.developer) query.developer = parsed.developer;
  if (parsed.transit) query.transit = parsed.transit;
  if (parsed.bedrooms != null) query.bedrooms = String(parsed.bedrooms);
  if (parsed.minPrice != null) query.min_price = String(parsed.minPrice);
  if (parsed.maxPrice != null) query.max_price = String(parsed.maxPrice);
  if (parsed.minArea != null) query.min_area = String(parsed.minArea);
  if (parsed.maxArea != null) query.max_area = String(parsed.maxArea);
  if (parsed.page != null && parsed.page > 1) query.page = String(parsed.page);
  return query;
}

export function buildPropertiesHref(
  lang: string,
  filters: SavedSearchFilters,
): string {
  const query = savedSearchFiltersToQuery(filters);
  const qs = new URLSearchParams(query).toString();
  return qs ? `/${lang}/properties?${qs}` : `/${lang}/properties`;
}
