import "server-only";

import type { Locale } from "@/config/locales";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type {
  ListingType,
  LocationRow,
  PropertyFeatureRow,
  PropertyMediaRow,
  PropertyRow,
  PropertyType,
} from "@/lib/supabase/types";
import {
  formatPrice,
  type PropertyView,
} from "@/lib/property/property-view";
import {
  SITEMAP_PROPERTY_MAX_PAGES,
  SITEMAP_PROPERTY_PAGE_SIZE,
  hasMoreSitemapPropertyPages,
} from "@/lib/seo/sitemap-inventory";

export type { ListingType, PropertyType };
export type { PropertyView };
export { formatPrice };

type PropertyProjectRelation = Pick<
  import("@/lib/supabase/types").PropertyProjectRow,
  "slug" | "developer_id" | "name_en" | "name_zh" | "name_th"
> & {
  developers: { slug: string } | null;
};

type DistrictRelation = Pick<
  import("@/lib/supabase/types").DistrictRow,
  "slug" | "name_en" | "name_zh" | "name_th"
>;

type PropertyWithRelations = PropertyRow & {
  locations: LocationRow | null;
  property_media: PropertyMediaRow[] | null;
  property_features: PropertyFeatureRow[] | null;
  property_projects: PropertyProjectRelation | null;
  districts: DistrictRelation | null;
};

const propertySelect = `
  *,
  locations (*),
  property_media (*),
  property_features (*),
  districts ( slug, name_en, name_zh, name_th ),
  property_projects (
    slug,
    developer_id,
    name_en,
    name_zh,
    name_th,
    developers ( slug )
  )
`;

function localizedLocation(
  location: LocationRow | null,
): Record<Locale, string> {
  if (!location) {
    return { en: "", zh: "", th: "" };
  }

  return {
    en: location.name_en,
    zh: location.name_zh,
    th: location.name_th,
  };
}

function emptyI18n(): Record<Locale, string> {
  return { en: "", zh: "", th: "" };
}

export function mapProperty(row: PropertyWithRelations): PropertyView {
  const media = [...(row.property_media ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order,
  );
  const cover =
    media.find((item) => item.is_cover)?.public_url ??
    media[0]?.public_url ??
    null;

  const project = row.property_projects;
  const district = row.districts;

  return {
    id: row.id,
    slug: row.slug,
    status: row.status,
    listingType: row.listing_type,
    type: row.property_type,
    locationId: row.location_id,
    projectId: row.project_id,
    agentId: row.agent_id,
    cityId: row.city_id,
    districtId: row.district_id,
    developerSlug: project?.developers?.slug ?? null,
    projectSlug: project?.slug ?? null,
    projectName: project
      ? { en: project.name_en, zh: project.name_zh, th: project.name_th }
      : emptyI18n(),
    districtSlug: district?.slug ?? null,
    districtName: district
      ? {
          en: district.name_en,
          zh: district.name_zh,
          th: district.name_th,
        }
      : emptyI18n(),
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    areaSqm: row.area_sqm == null ? null : Number(row.area_sqm),
    landAreaSqm: row.land_area_sqm == null ? null : Number(row.land_area_sqm),
    floorLabel: row.floor_label ?? null,
    buildingLabel: row.building_label ?? null,
    priceThb: Number(row.price_thb),
    featured: row.featured,
    transitTags: row.transit_tags ?? [],
    source: row.source,
    listingUrl: row.listing_url,
    sourceUpdatedAt: row.source_updated_at,
    lastVerifiedAt: row.last_verified_at ?? null,
    isVerifiedListing: Boolean(row.is_verified_listing),
    publishedAt: row.published_at,
    title: {
      en: row.title_en,
      zh: row.title_zh,
      th: row.title_th,
    },
    location: localizedLocation(row.locations),
    summary: {
      en: row.summary_en,
      zh: row.summary_zh,
      th: row.summary_th,
    },
    description: {
      en: row.description_en ?? "",
      zh: row.description_zh ?? "",
      th: row.description_th ?? "",
    },
    coverUrl: cover,
    media,
    features: row.property_features ?? [],
  };
}

export type ListingSort =
  | "newest_verified"
  | "newest"
  | "price_asc"
  | "price_desc"
  | "area_desc"
  | "featured";

export type ListingFilters = {
  query?: string;
  location?: string;
  type?: string;
  featuredOnly?: boolean;
  verifiedOnly?: boolean;
  listingType?: ListingType | "all";
  citySlug?: string;
  districtSlug?: string;
  projectSlug?: string;
  developerSlug?: string;
  transit?: string;
  bedrooms?: number;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  sort?: ListingSort;
};

/** Alpha-safe default page size for `/properties` and `/search`. */
export const DEFAULT_LISTING_PAGE_SIZE = 24;

export type ListingPageOptions = ListingFilters & {
  page?: number;
  pageSize?: number;
};

export type PagedProperties = {
  items: PropertyView[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  /** Set when the database query failed (items empty). */
  error?: string | null;
};

/** Lightweight select for result grids — omits features payloads. */
const propertyListSelect = `
  id, slug, status, listing_type, property_type, location_id, project_id, agent_id,
  city_id, district_id, bedrooms, bathrooms, area_sqm, land_area_sqm, price_thb,
  featured, transit_tags, source, listing_url, source_updated_at, last_verified_at,
  is_verified_listing, published_at, updated_at, title_en, title_zh, title_th,
  summary_en, summary_zh, summary_th,
  locations (name_en, name_zh, name_th),
  districts ( slug, name_en, name_zh, name_th ),
  property_media (public_url, is_cover, sort_order),
  property_projects (
    slug,
    developer_id,
    name_en,
    name_zh,
    name_th,
    developers ( slug )
  )
`;

function escapeIlike(value: string): string {
  return value.replace(/[%_,]/g, " ").replace(/\s+/g, " ").trim();
}

function applyListingSort(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  request: any,
  sort: ListingSort,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  if (sort === "price_asc") {
    return request.order("price_thb", { ascending: true });
  }
  if (sort === "price_desc") {
    return request.order("price_thb", { ascending: false });
  }
  if (sort === "area_desc") {
    return request.order("area_sqm", {
      ascending: false,
      nullsFirst: false,
    });
  }
  if (sort === "featured") {
    return request
      .order("featured", { ascending: false })
      .order("published_at", { ascending: false });
  }
  if (sort === "newest") {
    return request.order("published_at", { ascending: false });
  }
  // newest_verified — prefer last_verified_at, then source_updated_at, then published
  return request
    .order("last_verified_at", { ascending: false, nullsFirst: false })
    .order("source_updated_at", { ascending: false, nullsFirst: false })
    .order("published_at", { ascending: false });
}

async function resolveListingScopeIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  options?: ListingFilters,
): Promise<{
  cityId?: string;
  districtId?: string;
  projectIds?: string[];
  empty: boolean;
}> {
  let cityId: string | undefined;
  let districtId: string | undefined;
  let projectIds: string[] | undefined;

  if (options?.citySlug) {
    const { data } = await supabase
      .from("cities")
      .select("id")
      .eq("slug", options.citySlug)
      .maybeSingle();
    if (!data?.id) return { empty: true };
    cityId = data.id;
  }

  if (options?.districtSlug) {
    const { data } = await supabase
      .from("districts")
      .select("id")
      .eq("slug", options.districtSlug)
      .maybeSingle();
    if (!data?.id) return { empty: true };
    districtId = data.id;
  }

  if (options?.projectSlug) {
    const { data: project } = await supabase
      .from("property_projects")
      .select("id, developer_id")
      .eq("slug", options.projectSlug)
      .eq("status", "published")
      .maybeSingle();
    if (!project?.id) return { empty: true };

    if (options?.developerSlug) {
      const { data: developer } = await supabase
        .from("developers")
        .select("id")
        .eq("slug", options.developerSlug)
        .maybeSingle();
      if (!developer?.id || project.developer_id !== developer.id) {
        return { empty: true };
      }
    }

    projectIds = [project.id];
  } else if (options?.developerSlug) {
    const { data: developer } = await supabase
      .from("developers")
      .select("id")
      .eq("slug", options.developerSlug)
      .maybeSingle();
    if (!developer?.id) return { empty: true };
    const { data: projects } = await supabase
      .from("property_projects")
      .select("id")
      .eq("developer_id", developer.id);
    projectIds = (projects ?? []).map((row) => row.id);
    if (!projectIds.length) return { empty: true };
  }

  return { cityId, districtId, projectIds, empty: false };
}

/**
 * Paged listing query for public result pages.
 * Sorts and filters deterministically; does not load the full catalog into HTML.
 */
export async function listPublishedPropertiesPaged(
  options?: ListingPageOptions,
): Promise<PagedProperties> {
  const pageSize = Math.min(
    Math.max(options?.pageSize ?? DEFAULT_LISTING_PAGE_SIZE, 1),
    48,
  );
  const page = Math.max(options?.page ?? 1, 1);
  const empty: PagedProperties = {
    items: [],
    total: 0,
    page,
    pageSize,
    totalPages: 0,
    error: null,
  };

  if (!hasSupabaseEnv()) return empty;

  const supabase = await createClient();
  const scope = await resolveListingScopeIds(supabase, options);
  if (scope.empty) return empty;

  let request = supabase
    .from("properties")
    .select(propertyListSelect, { count: "exact" })
    .eq("status", "published");

  if (options?.featuredOnly) request = request.eq("featured", true);
  if (options?.verifiedOnly) {
    request = request.eq("is_verified_listing", true);
  }
  if (options?.listingType && options.listingType !== "all") {
    request = request.eq("listing_type", options.listingType);
  }
  if (options?.type && options.type !== "all") {
    request = request.eq("property_type", options.type as PropertyType);
  }
  if (options?.bedrooms != null && Number.isFinite(options.bedrooms)) {
    request = request.eq("bedrooms", options.bedrooms);
  }
  if (options?.minPrice != null && Number.isFinite(options.minPrice)) {
    request = request.gte("price_thb", options.minPrice);
  }
  if (options?.maxPrice != null && Number.isFinite(options.maxPrice)) {
    request = request.lte("price_thb", options.maxPrice);
  }
  if (options?.minArea != null && Number.isFinite(options.minArea)) {
    request = request.gte("area_sqm", options.minArea);
  }
  if (options?.maxArea != null && Number.isFinite(options.maxArea)) {
    request = request.lte("area_sqm", options.maxArea);
  }
  if (options?.transit) {
    request = request.contains("transit_tags", [options.transit]);
  }
  if (scope.cityId) request = request.eq("city_id", scope.cityId);
  if (scope.districtId) request = request.eq("district_id", scope.districtId);
  if (scope.projectIds) request = request.in("project_id", scope.projectIds);

  const query = escapeIlike(options?.query ?? "");
  if (query) {
    const pattern = `%${query}%`;
    request = request.or(
      [
        `title_en.ilike.${pattern}`,
        `title_zh.ilike.${pattern}`,
        `title_th.ilike.${pattern}`,
        `summary_en.ilike.${pattern}`,
        `summary_zh.ilike.${pattern}`,
        `summary_th.ilike.${pattern}`,
        `slug.ilike.${pattern}`,
      ].join(","),
    );
  }

  const location = escapeIlike(options?.location ?? "");
  if (location) {
    const pattern = `%${location}%`;
    const { data: locations } = await supabase
      .from("locations")
      .select("id")
      .or(
        [
          `name_en.ilike.${pattern}`,
          `name_zh.ilike.${pattern}`,
          `name_th.ilike.${pattern}`,
        ].join(","),
      );
    const locationIds = (locations ?? []).map((row) => row.id);
    if (!locationIds.length) return empty;
    request = request.in("location_id", locationIds);
  }

  const sort = options?.sort ?? "newest_verified";
  request = applyListingSort(request, sort);

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, error, count } = await request.range(from, to);

  if (error) {
    console.error("listPublishedPropertiesPaged", error.message);
    return { ...empty, error: error.message };
  }

  const items = (data as PropertyWithRelations[]).map(mapProperty);
  const total = count ?? items.length;
  return {
    items,
    total,
    page,
    pageSize,
    totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
    error: null,
  };
}

export async function listPublishedProperties(
  options?: ListingFilters,
): Promise<PropertyView[]> {
  if (!hasSupabaseEnv()) return [];

  const supabase = await createClient();
  const scope = await resolveListingScopeIds(supabase, options);
  if (scope.empty) return [];

  let request = supabase
    .from("properties")
    .select(propertySelect)
    .eq("status", "published");

  if (options?.featuredOnly) request = request.eq("featured", true);
  if (options?.verifiedOnly) {
    request = request.eq("is_verified_listing", true);
  }
  if (options?.listingType && options.listingType !== "all") {
    request = request.eq("listing_type", options.listingType);
  }
  if (options?.type && options.type !== "all") {
    request = request.eq("property_type", options.type as PropertyType);
  }
  if (options?.bedrooms != null && Number.isFinite(options.bedrooms)) {
    request = request.eq("bedrooms", options.bedrooms);
  }
  if (options?.minPrice != null && Number.isFinite(options.minPrice)) {
    request = request.gte("price_thb", options.minPrice);
  }
  if (options?.maxPrice != null && Number.isFinite(options.maxPrice)) {
    request = request.lte("price_thb", options.maxPrice);
  }
  if (options?.minArea != null && Number.isFinite(options.minArea)) {
    request = request.gte("area_sqm", options.minArea);
  }
  if (options?.maxArea != null && Number.isFinite(options.maxArea)) {
    request = request.lte("area_sqm", options.maxArea);
  }
  if (options?.transit) {
    request = request.contains("transit_tags", [options.transit]);
  }
  if (scope.cityId) request = request.eq("city_id", scope.cityId);
  if (scope.districtId) request = request.eq("district_id", scope.districtId);
  if (scope.projectIds) request = request.in("project_id", scope.projectIds);

  const sort = options?.sort ?? "newest_verified";
  request = applyListingSort(request, sort);

  const { data, error } = await request;
  if (error) {
    console.error("listPublishedProperties", error.message);
    return [];
  }

  let properties = (data as PropertyWithRelations[]).map(mapProperty);

  const query = options?.query?.trim().toLowerCase() ?? "";
  const location = options?.location?.trim().toLowerCase() ?? "";

  if (query) {
    properties = properties.filter((property) => {
      const haystack = [
        property.slug,
        property.type,
        ...Object.values(property.title),
        ...Object.values(property.location),
        ...Object.values(property.summary),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }

  if (location) {
    properties = properties.filter((property) =>
      Object.values(property.location).some((value) =>
        value.toLowerCase().includes(location),
      ),
    );
  }

  return properties;
}

/**
 * Bounded, deterministic slug inventory for sitemap generation.
 * Pages under the PostgREST default row cap so every verified published
 * property is included (not just the first ~1000).
 */
export async function listPublishedPropertySlugsForSitemap(): Promise<
  string[]
> {
  if (!hasSupabaseEnv()) return [];

  const supabase = await createClient();
  const slugs: string[] = [];

  for (let pageIndex = 0; pageIndex < SITEMAP_PROPERTY_MAX_PAGES; pageIndex += 1) {
    const from = pageIndex * SITEMAP_PROPERTY_PAGE_SIZE;
    const to = from + SITEMAP_PROPERTY_PAGE_SIZE - 1;
    const { data, error } = await supabase
      .from("properties")
      .select("slug")
      .eq("status", "published")
      .eq("is_verified_listing", true)
      .order("slug", { ascending: true })
      .range(from, to);

    if (error) {
      console.error("listPublishedPropertySlugsForSitemap", error.message);
      break;
    }

    const rows = data ?? [];
    for (const row of rows) {
      if (typeof row.slug === "string" && row.slug.length > 0) {
        slugs.push(row.slug);
      }
    }

    if (!hasMoreSitemapPropertyPages(rows.length, pageIndex)) {
      break;
    }
  }

  return slugs;
}

export async function getPublishedPropertyBySlug(
  slug: string,
): Promise<PropertyView | null> {
  if (!hasSupabaseEnv()) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select(propertySelect)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error("getPublishedPropertyBySlug", error.message);
    return null;
  }

  if (!data) return null;
  return mapProperty(data as PropertyWithRelations);
}

/**
 * Resolve published favorites by public slug. Order follows the input list.
 * Missing / unpublished slugs are omitted (caller may prune local storage).
 */
export async function getPublishedPropertiesBySlugs(
  slugs: string[],
): Promise<PropertyView[]> {
  if (!hasSupabaseEnv() || !slugs.length) return [];

  const unique = Array.from(
    new Set(
      slugs
        .map((slug) => String(slug).trim().toLowerCase())
        .filter(Boolean),
    ),
  ).slice(0, 50);

  if (!unique.length) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select(propertySelect)
    .eq("status", "published")
    .in("slug", unique);

  if (error) {
    console.error("getPublishedPropertiesBySlugs", error.message);
    return [];
  }

  const bySlug = new Map(
    (data ?? []).map((row) => {
      const property = mapProperty(row as PropertyWithRelations);
      return [property.slug, property] as const;
    }),
  );

  return unique
    .map((slug) => bySlug.get(slug))
    .filter((item): item is PropertyView => Boolean(item));
}

export async function listAllPropertiesForAdmin(): Promise<PropertyView[]> {
  if (!hasSupabaseEnv()) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select(propertySelect)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("listAllPropertiesForAdmin", error.message);
    return [];
  }

  return (data as PropertyWithRelations[]).map(mapProperty);
}

export async function getPropertyByIdForAdmin(
  id: string,
): Promise<PropertyView | null> {
  if (!hasSupabaseEnv()) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select(propertySelect)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("getPropertyByIdForAdmin", error.message);
    return null;
  }

  if (!data) return null;
  return mapProperty(data as PropertyWithRelations);
}

export async function listLocations() {
  if (!hasSupabaseEnv()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("locations")
    .select("*")
    .order("name_en");
  if (error) {
    console.error("listLocations", error.message);
    return [];
  }
  return data ?? [];
}

export async function listAgents() {
  if (!hasSupabaseEnv()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .eq("is_active", true)
    .order("name_en");
  if (error) {
    console.error("listAgents", error.message);
    return [];
  }
  return data ?? [];
}

export async function getAgentById(agentId: string) {
  if (!hasSupabaseEnv() || !agentId) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .eq("id", agentId)
    .maybeSingle();
  if (error) {
    console.error("getAgentById", error.message);
    return null;
  }
  return data;
}

export async function listProjects() {
  if (!hasSupabaseEnv()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("property_projects")
    .select("*")
    .order("name_en");
  if (error) {
    console.error("listProjects", error.message);
    return [];
  }
  return data ?? [];
}
