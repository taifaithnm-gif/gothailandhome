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
  bedrooms: number | null;
  bathrooms: number | null;
  areaSqm: number | null;
  landAreaSqm: number | null;
  priceThb: number;
  featured: boolean;
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
};

const propertySelect = `
  *,
  locations (*),
  property_media (*),
  property_features (*)
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
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    areaSqm: row.area_sqm == null ? null : Number(row.area_sqm),
    landAreaSqm: row.land_area_sqm == null ? null : Number(row.land_area_sqm),
    priceThb: Number(row.price_thb),
    featured: row.featured,
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

export async function listPublishedProperties(options?: {
  query?: string;
  location?: string;
  type?: string;
  featuredOnly?: boolean;
}): Promise<PropertyView[]> {
  if (!hasSupabaseEnv()) return [];

  const supabase = await createClient();
  let request = supabase
    .from("properties")
    .select(propertySelect)
    .eq("status", "published")
    .order("featured", { ascending: false })
    .order("published_at", { ascending: false });

  if (options?.featuredOnly) {
    request = request.eq("featured", true);
  }

  if (options?.type && options.type !== "all") {
    request = request.eq("property_type", options.type as PropertyType);
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
