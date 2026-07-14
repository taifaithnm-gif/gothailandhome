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

export type { ListingType, PropertyType };

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
  bedrooms: number | null;
  bathrooms: number | null;
  areaSqm: number | null;
  landAreaSqm: number | null;
  priceThb: number;
  featured: boolean;
  transitTags: string[];
  source: string | null;
  listingUrl: string | null;
  sourceUpdatedAt: string | null;
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

type PropertyWithRelations = PropertyRow & {
  locations: LocationRow | null;
  property_media: PropertyMediaRow[] | null;
  property_features: PropertyFeatureRow[] | null;
  property_projects:
    | (Pick<
        import("@/lib/supabase/types").PropertyProjectRow,
        "slug" | "developer_id"
      > & {
        developers: { slug: string } | null;
      })
    | null;
};

const propertySelect = `
  *,
  locations (*),
  property_media (*),
  property_features (*),
  property_projects (
    slug,
    developer_id,
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

export function mapProperty(row: PropertyWithRelations): PropertyView {
  const media = [...(row.property_media ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order,
  );
  const cover =
    media.find((item) => item.is_cover)?.public_url ??
    media[0]?.public_url ??
    null;

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
    developerSlug: row.property_projects?.developers?.slug ?? null,
    projectSlug: row.property_projects?.slug ?? null,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    areaSqm: row.area_sqm == null ? null : Number(row.area_sqm),
    landAreaSqm: row.land_area_sqm == null ? null : Number(row.land_area_sqm),
    priceThb: Number(row.price_thb),
    featured: row.featured,
    transitTags: row.transit_tags ?? [],
    source: row.source,
    listingUrl: row.listing_url,
    sourceUpdatedAt: row.source_updated_at,
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
      en: row.description_en,
      zh: row.description_zh,
      th: row.description_th,
    },
    coverUrl: cover,
    media,
    features: row.property_features ?? [],
  };
}

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

export type ListingSort = "newest" | "price_asc" | "price_desc" | "featured";

export type ListingFilters = {
  query?: string;
  location?: string;
  type?: string;
  featuredOnly?: boolean;
  verifiedOnly?: boolean;
  listingType?: ListingType | "all";
  citySlug?: string;
  districtSlug?: string;
  developerSlug?: string;
  transit?: string;
  bedrooms?: number;
  minPrice?: number;
  maxPrice?: number;
  sort?: ListingSort;
};

export async function listPublishedProperties(
  options?: ListingFilters,
): Promise<PropertyView[]> {
  if (!hasSupabaseEnv()) return [];

  const supabase = await createClient();
  let request = supabase
    .from("properties")
    .select(propertySelect)
    .eq("status", "published");

  if (options?.featuredOnly) {
    request = request.eq("featured", true);
  }

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

  if (options?.transit) {
    request = request.contains("transit_tags", [options.transit]);
  }

  const sort = options?.sort ?? "newest";
  if (sort === "price_asc") {
    request = request.order("price_thb", { ascending: true });
  } else if (sort === "price_desc") {
    request = request.order("price_thb", { ascending: false });
  } else if (sort === "featured") {
    request = request
      .order("featured", { ascending: false })
      .order("published_at", { ascending: false });
  } else {
    request = request.order("published_at", { ascending: false });
  }

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

  if (options?.developerSlug) {
    properties = properties.filter(
      (property) => property.developerSlug === options.developerSlug,
    );
  }

  if (options?.citySlug || options?.districtSlug) {
    const { data: cities } = options.citySlug
      ? await supabase
          .from("cities")
          .select("id")
          .eq("slug", options.citySlug)
          .maybeSingle()
      : { data: null };
    const { data: districts } = options.districtSlug
      ? await supabase
          .from("districts")
          .select("id")
          .eq("slug", options.districtSlug)
          .maybeSingle()
      : { data: null };

    if (options.citySlug) {
      const cityId = cities?.id;
      properties = cityId
        ? properties.filter((property) => property.cityId === cityId)
        : [];
    }
    if (options.districtSlug) {
      const districtId = districts?.id;
      properties = districtId
        ? properties.filter((property) => property.districtId === districtId)
        : [];
    }
  }

  return properties;
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
