/**
 * Shared listing search state — URL parse/serialize for `/properties` and `/search`.
 * Keep filter semantics honest: only map params the data layer understands.
 */

export const LISTING_SORTS = [
  "newest_verified",
  "newest",
  "price_asc",
  "price_desc",
  "area_desc",
  "featured",
] as const;

export type ListingSearchSort = (typeof LISTING_SORTS)[number];

export const LISTING_TYPES = ["sale", "rent", "all"] as const;
export const PROPERTY_TYPES = [
  "condo",
  "house",
  "villa",
  "land",
  "commercial",
] as const;
export const TRANSIT_TYPES = ["bts", "mrt"] as const;

const DEFAULT_LISTING_SORT: ListingSearchSort = "newest_verified";
const MAX_QUERY_LENGTH = 200;
const MAX_SLUG_LENGTH = 120;
const DECIMAL_PATTERN = /^(?:0|[1-9]\d*)(?:\.\d+)?$/;
const INTEGER_PATTERN = /^(?:0|[1-9]\d*)$/;

export type ListingSearchParams = {
  q?: string;
  location?: string;
  sort?: ListingSearchSort;
  listing_type?: "sale" | "rent" | "all";
  type?: string;
  city?: string;
  district?: string;
  project?: string;
  developer?: string;
  transit?: string;
  bedrooms?: string;
  min_price?: string;
  max_price?: string;
  min_area?: string;
  max_area?: string;
  page?: string;
};

export type ListingSearchState = {
  q?: string;
  location?: string;
  sort: ListingSearchSort;
  listingType: "sale" | "rent" | "all";
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
  page: number;
};

function one(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function normalizedText(
  raw: string | undefined,
  maxLength = MAX_QUERY_LENGTH,
): string | undefined {
  const value = raw?.trim().replace(/\s+/g, " ");
  if (!value || value.length > maxLength) return undefined;
  return value;
}

function normalizedSlug(raw: string | undefined): string | undefined {
  const value = raw?.trim().toLowerCase();
  if (
    !value ||
    value.length > MAX_SLUG_LENGTH ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
  ) {
    return undefined;
  }
  return value;
}

function nonNegativeInt(raw: string | undefined): number | undefined {
  const value = raw?.trim();
  if (!value || !INTEGER_PATTERN.test(value)) return undefined;
  const n = Number(value);
  if (!Number.isSafeInteger(n)) return undefined;
  return n;
}

function nonNegativeNumber(raw: string | undefined): number | undefined {
  const value = raw?.trim();
  if (!value || !DECIMAL_PATTERN.test(value)) return undefined;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return undefined;
  return n;
}

function orderedRange(
  min: number | undefined,
  max: number | undefined,
): [number | undefined, number | undefined] {
  if (min != null && max != null && min > max) {
    return [undefined, undefined];
  }
  return [min, max];
}

/** Normalize transit tokens to lowercase glossary codes (`bts` / `mrt`). */
export function normalizeTransit(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const v = raw.trim().toLowerCase();
  if ((TRANSIT_TYPES as readonly string[]).includes(v)) return v;
  return undefined;
}

export function parseListingSort(raw: string | undefined): ListingSearchSort {
  if (raw && (LISTING_SORTS as readonly string[]).includes(raw)) {
    return raw as ListingSearchSort;
  }
  return DEFAULT_LISTING_SORT;
}

export function parseListingSearchParams(
  input: Record<string, string | string[] | undefined>,
): ListingSearchState {
  const listingRaw = one(input.listing_type) || "all";
  const listingType =
    listingRaw === "sale" || listingRaw === "rent" ? listingRaw : "all";

  const typeRaw = one(input.type)?.trim().toLowerCase();
  const type =
    typeRaw && (PROPERTY_TYPES as readonly string[]).includes(typeRaw)
      ? typeRaw
      : undefined;

  const parsedPage = nonNegativeInt(one(input.page));
  const page = parsedPage && parsedPage > 0 ? parsedPage : 1;
  const [minPrice, maxPrice] = orderedRange(
    nonNegativeNumber(one(input.min_price)),
    nonNegativeNumber(one(input.max_price)),
  );
  const [minArea, maxArea] = orderedRange(
    nonNegativeNumber(one(input.min_area)),
    nonNegativeNumber(one(input.max_area)),
  );

  return {
    q: normalizedText(one(input.q)),
    location: normalizedText(one(input.location)),
    sort: parseListingSort(one(input.sort)),
    listingType,
    type,
    city: normalizedSlug(one(input.city)),
    district: normalizedSlug(one(input.district)),
    project: normalizedSlug(one(input.project)),
    developer: normalizedSlug(one(input.developer)),
    transit: normalizeTransit(one(input.transit)),
    bedrooms: nonNegativeInt(one(input.bedrooms)),
    minPrice,
    maxPrice,
    minArea,
    maxArea,
    page,
  };
}

/** Params suitable for pagination / filter form defaults (strings). */
export function toListingFilterValues(
  state: ListingSearchState,
): ListingSearchParams {
  return {
    q: state.q,
    location: state.location,
    sort: state.sort,
    listing_type: state.listingType === "all" ? undefined : state.listingType,
    type: state.type,
    city: state.city,
    district: state.district,
    project: state.project,
    developer: state.developer,
    transit: state.transit,
    bedrooms:
      state.bedrooms != null ? String(state.bedrooms) : undefined,
    min_price: state.minPrice != null ? String(state.minPrice) : undefined,
    max_price: state.maxPrice != null ? String(state.maxPrice) : undefined,
    min_area: state.minArea != null ? String(state.minArea) : undefined,
    max_area: state.maxArea != null ? String(state.maxArea) : undefined,
  };
}

/** Omit empty values; exclude page (pagination helper adds it). */
export function listingSearchToQueryRecord(
  state: ListingSearchState,
): Record<string, string | undefined> {
  const values = toListingFilterValues(state);
  const out: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(values)) {
    if (key === "sort" && value === DEFAULT_LISTING_SORT) continue;
    if (value) out[key] = value;
  }
  return out;
}

export function buildListingSearchHref(
  basePath: string,
  state: ListingSearchState,
  page?: number,
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(listingSearchToQueryRecord(state))) {
    if (value) search.set(key, value);
  }
  const p = page ?? state.page;
  if (p > 1) search.set("page", String(p));
  const qs = search.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

/** Build a filter-submit href and always reset pagination to page one. */
export function buildListingFilterHref(
  basePath: string,
  state: ListingSearchState,
): string {
  return buildListingSearchHref(basePath, state, 1);
}

export function countActiveListingFilters(state: ListingSearchState): number {
  let n = 0;
  if (state.q) n += 1;
  if (state.location) n += 1;
  if (state.listingType !== "all") n += 1;
  if (state.type) n += 1;
  if (state.city) n += 1;
  if (state.district) n += 1;
  if (state.project) n += 1;
  if (state.developer) n += 1;
  if (state.transit) n += 1;
  if (state.bedrooms != null) n += 1;
  if (state.minPrice != null) n += 1;
  if (state.maxPrice != null) n += 1;
  if (state.minArea != null) n += 1;
  if (state.maxArea != null) n += 1;
  if (state.sort && state.sort !== "newest_verified") n += 1;
  return n;
}
