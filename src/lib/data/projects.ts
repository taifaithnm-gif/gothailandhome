import "server-only";

import {
  normalizeFacilities,
  normalizeFaqs,
  normalizePois,
  normalizeUnitTypes,
  type LocalizedText,
  type ProjectFacilityZone,
  type ProjectFaq,
  type ProjectPoi,
  type ProjectUnitType,
} from "@/lib/projects/normalize-project-content";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type {
  DeveloperRow,
  LocationRow,
  PropertyProjectRow,
  PropertyRow,
} from "@/lib/supabase/types";

export type {
  LocalizedText,
  ProjectFacilityZone,
  ProjectFaq,
  ProjectPoi,
  ProjectUnitType,
};

export type ProjectView = {
  id: string;
  slug: string;
  name: LocalizedText;
  description: LocalizedText;
  address: LocalizedText;
  postalCode: string | null;
  latitude: number | null;
  longitude: number | null;
  googleMapsUrl: string | null;
  officialWebsite: string | null;
  facebookUrl: string | null;
  completionYear: number | null;
  totalFloors: number | null;
  totalUnits: number | null;
  buildingCount: number | null;
  landAreaRai: string | null;
  parkingSpaces: number | null;
  ceilingHeightM: number | null;
  commonFeeThbPerSqm: number | null;
  specifications: Record<string, unknown>;
  unitTypes: ProjectUnitType[];
  facilities: ProjectFacilityZone[];
  transportation: ProjectPoi[];
  nearbySchools: ProjectPoi[];
  nearbyHospitals: ProjectPoi[];
  nearbyMalls: ProjectPoi[];
  faq: ProjectFaq[];
  seoTitle: LocalizedText;
  seoDescription: LocalizedText;
  ogImagePath: string | null;
  heroImagePath: string | null;
  developer: {
    slug: string;
    name: LocalizedText;
    legalName: LocalizedText;
    website: string | null;
    facebookUrl: string | null;
    description: LocalizedText;
    logoUrl: string | null;
  } | null;
  location: LocalizedText;
  cityId: string | null;
  districtId: string | null;
  districtSlug: string | null;
  districtName: LocalizedText;
  transitTags: string[];
};

type DistrictRelation = {
  slug: string;
  name_en: string;
  name_zh: string;
  name_th: string;
};

type ProjectWithRelations = PropertyProjectRow & {
  developers: DeveloperRow | null;
  locations: LocationRow | null;
  districts: DistrictRelation | null;
};

const projectSelect =
  "*, developers (*), locations (*), districts ( slug, name_en, name_zh, name_th )";

function asLocalized(
  en?: string | null,
  zh?: string | null,
  th?: string | null,
): LocalizedText {
  return { en: en ?? "", zh: zh ?? "", th: th ?? "" };
}

function mapProject(row: ProjectWithRelations): ProjectView {
  const developer = row.developers;
  const district = row.districts;
  return {
    id: row.id,
    slug: row.slug,
    name: asLocalized(row.name_en, row.name_zh, row.name_th),
    description: asLocalized(
      row.description_en,
      row.description_zh,
      row.description_th,
    ),
    address: asLocalized(row.address_en, row.address_zh, row.address_th),
    postalCode: row.postal_code,
    latitude: row.latitude == null ? null : Number(row.latitude),
    longitude: row.longitude == null ? null : Number(row.longitude),
    googleMapsUrl: row.google_maps_url,
    officialWebsite: row.official_website,
    facebookUrl: row.facebook_url,
    completionYear: row.completion_year,
    totalFloors: row.total_floors,
    totalUnits: row.total_units,
    buildingCount: row.building_count,
    landAreaRai: row.land_area_rai,
    parkingSpaces: row.parking_spaces,
    ceilingHeightM:
      row.ceiling_height_m == null ? null : Number(row.ceiling_height_m),
    commonFeeThbPerSqm:
      row.common_fee_thb_per_sqm == null
        ? null
        : Number(row.common_fee_thb_per_sqm),
    specifications: (row.specifications ?? {}) as Record<string, unknown>,
    unitTypes: normalizeUnitTypes(row.unit_types),
    facilities: normalizeFacilities(row.facilities),
    transportation: normalizePois(row.transportation),
    nearbySchools: normalizePois(row.nearby_schools),
    nearbyHospitals: normalizePois(row.nearby_hospitals),
    nearbyMalls: normalizePois(row.nearby_malls),
    faq: normalizeFaqs(row.faq),
    seoTitle: asLocalized(row.seo_title_en, row.seo_title_zh, row.seo_title_th),
    seoDescription: asLocalized(
      row.seo_description_en,
      row.seo_description_zh,
      row.seo_description_th,
    ),
    ogImagePath: row.og_image_path,
    heroImagePath: row.hero_image_path,
    developer: developer
      ? {
          slug: developer.slug,
          name: asLocalized(
            developer.name_en,
            developer.name_zh,
            developer.name_th,
          ),
          legalName: asLocalized(
            developer.legal_name_en,
            developer.legal_name_zh,
            developer.legal_name_th,
          ),
          website: developer.website,
          facebookUrl: developer.facebook_url,
          description: asLocalized(
            developer.description_en,
            developer.description_zh,
            developer.description_th,
          ),
          logoUrl: developer.logo_url,
        }
      : null,
    location: row.locations
      ? asLocalized(
          row.locations.name_en,
          row.locations.name_zh,
          row.locations.name_th,
        )
      : asLocalized(),
    cityId: row.city_id,
    districtId: row.district_id,
    districtSlug: district?.slug ?? null,
    districtName: district
      ? asLocalized(district.name_en, district.name_zh, district.name_th)
      : asLocalized(),
    transitTags: row.transit_tags ?? [],
  };
}

export async function getPublishedProjectBySlug(
  slug: string,
): Promise<ProjectView | null> {
  if (!hasSupabaseEnv()) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("property_projects")
    .select(projectSelect)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data) return null;
  return mapProject(data as ProjectWithRelations);
}

export async function listPublishedProjects(options?: {
  cityId?: string;
  districtId?: string;
  developerSlug?: string;
}): Promise<ProjectView[]> {
  if (!hasSupabaseEnv()) return [];

  const supabase = await createClient();
  let request = supabase
    .from("property_projects")
    .select(projectSelect)
    .eq("status", "published")
    .order("name_en", { ascending: true });

  if (options?.cityId) {
    request = request.eq("city_id", options.cityId);
  }
  if (options?.districtId) {
    request = request.eq("district_id", options.districtId);
  }
  if (options?.developerSlug) {
    const { data: developer } = await supabase
      .from("developers")
      .select("id")
      .eq("slug", options.developerSlug)
      .maybeSingle();
    if (!developer?.id) return [];
    request = request.eq("developer_id", developer.id);
  }

  const { data, error } = await request;

  if (error || !data) return [];
  return (data as ProjectWithRelations[]).map(mapProject);
}

export async function listPublishedPropertiesForProject(
  projectId: string,
): Promise<PropertyRow[]> {
  if (!hasSupabaseEnv()) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("project_id", projectId)
    .eq("status", "published")
    .order("listing_type", { ascending: true })
    .order("price_thb", { ascending: true });

  if (error || !data) return [];
  return data as PropertyRow[];
}
