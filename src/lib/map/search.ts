import "server-only";

import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import {
  MAP_PERF_BUDGET,
  type MapBbox,
  type MapFilterState,
} from "@/lib/map/bbox";

export type MapPin = {
  propertyId: string;
  slug: string;
  titleEn: string;
  listingType: string;
  priceThb: number;
  lat: number;
  lng: number;
  districtSlug: string | null;
  coordinateSource: "project";
};

export type MapSearchResult = {
  pins: MapPin[];
  unmappedCount: number;
  truncated: boolean;
};

type MapQueryRow = {
  id: string;
  slug: string;
  title_en: string;
  listing_type: string;
  price_thb: number;
  status: string;
  districts: { slug: string } | { slug: string }[] | null;
  property_projects:
    | { latitude: number | null; longitude: number | null }
    | { latitude: number | null; longitude: number | null }[]
    | null;
};

/**
 * Bounded geo search. Only returns pins with evidenced project coordinates.
 * Listings without coordinates are counted as unmapped (honest degradation).
 */
export async function searchMapListings(
  filters: MapFilterState,
): Promise<MapSearchResult> {
  if (!hasSupabaseEnv()) {
    return { pins: [], unmappedCount: 0, truncated: false };
  }

  const supabase = await createClient();
  let query = supabase
    .from("properties")
    .select(
      `
      id,
      slug,
      title_en,
      listing_type,
      price_thb,
      status,
      districts ( slug ),
      property_projects ( latitude, longitude )
    `,
    )
    .eq("status", "published")
    .limit(MAP_PERF_BUDGET.maxPinsPerRequest + 40);

  if (filters.listingType && filters.listingType !== "all") {
    query = query.eq("listing_type", filters.listingType);
  }
  if (filters.district) {
    query = query.eq("districts.slug", filters.district);
  }
  if (filters.q) {
    query = query.ilike("title_en", `%${filters.q}%`);
  }

  const { data, error } = await query;
  if (error || !data) {
    return { pins: [], unmappedCount: 0, truncated: false };
  }

  const rows = data as unknown as MapQueryRow[];
  const pinList: MapPin[] = [];
  let unmappedCount = 0;

  for (const row of rows) {
    const project = row.property_projects;
    const proj = Array.isArray(project) ? project[0] : project;
    const lat = proj?.latitude;
    const lng = proj?.longitude;
    const district = row.districts;
    const districtSlug = Array.isArray(district)
      ? district[0]?.slug ?? null
      : district?.slug ?? null;

    if (
      typeof lat !== "number" ||
      typeof lng !== "number" ||
      !Number.isFinite(lat) ||
      !Number.isFinite(lng)
    ) {
      unmappedCount += 1;
      continue;
    }

    if (filters.bbox && !pointInBbox(lat, lng, filters.bbox)) {
      continue;
    }

    pinList.push({
      propertyId: row.id,
      slug: row.slug,
      titleEn: row.title_en,
      listingType: row.listing_type,
      priceThb: row.price_thb,
      lat,
      lng,
      districtSlug,
      coordinateSource: "project",
    });

    if (pinList.length >= MAP_PERF_BUDGET.maxPinsPerRequest) break;
  }

  return {
    pins: pinList,
    unmappedCount,
    truncated: pinList.length >= MAP_PERF_BUDGET.maxPinsPerRequest,
  };
}

function pointInBbox(lat: number, lng: number, bbox: MapBbox): boolean {
  return (
    lat >= bbox.south &&
    lat <= bbox.north &&
    lng >= bbox.west &&
    lng <= bbox.east
  );
}
