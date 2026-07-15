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

function positiveInt(raw: string | undefined): number | undefined {
  if (raw == null || raw === "") return undefined;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return undefined;
  return Math.floor(n);
}

function positiveNumber(raw: string | undefined): number | undefined {
  if (raw == null || raw === "") return undefined;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return undefined;
  return n;
}

/** Normalize transit tokens to lowercase glossary codes (`bts` / `mrt`). */
export function normalizeTransit(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const v = raw.trim().toLowerCase();
  if (v === "bts" || v === "mrt") return v;
  return undefined;
}

export function parseListingSort(raw: string | undefined): ListingSearchSort {
  if (raw && (LISTING_SORTS as readonly string[]).includes(raw)) {
    return raw as ListingSearchSort;
  }
  return "newest_verified";
}

export function parseListingSearchParams(
  input: Record<string, string | string[] | undefined>,
): ListingSearchState {
  const listingRaw = one(input.listing_type) || "all";
  const listingType =
    listingRaw === "sale" || listingRaw === "rent" ? listingRaw : "all";

  const typeRaw = one(input.type);
  const type =
    typeRaw && typeRaw !== "all" ? typeRaw : undefined;

  const pageRaw = Number(one(input.page) || "1");
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;

  return {
    q: one(input.q)?.trim() || undefined,
    location: one(input.location)?.trim() || undefined,
    sort: parseListingSort(one(input.sort)),
    listingType,
    type,
    city: one(input.city)?.trim() || undefined,
    district: one(input.district)?.trim() || undefined,
    project: one(input.project)?.trim() || undefined,
    developer: one(input.developer)?.trim() || undefined,
    transit: normalizeTransit(one(input.transit)),
    bedrooms: positiveInt(one(input.bedrooms)),
    minPrice: positiveNumber(one(input.min_price)),
    maxPrice: positiveNumber(one(input.max_price)),
    minArea: positiveNumber(one(input.min_area)),
    maxArea: positiveNumber(one(input.max_area)),
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
