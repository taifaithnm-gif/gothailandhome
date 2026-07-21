/**
 * P2-050/052 — Map provider policy + bbox search contracts.
 * Provider: OpenStreetMap tiles (no API key). Pins only when project lat/lng evidenced.
 */

export const MAP_PROVIDER = {
  id: "openstreetmap",
  tileAttribution: "© OpenStreetMap contributors",
  privacyNote: "No commercial tile API key; browser loads OSM tiles only when map flag enabled.",
} as const;

/** Performance budget (P2-051) */
export const MAP_PERF_BUDGET = {
  maxPinsPerRequest: 80,
  maxBboxSpanDegrees: 0.35,
  defaultCenter: { lat: 13.7563, lng: 100.5018 }, // Bangkok — viewport only, not a listing fact
  listFirst: true,
} as const;

export type MapBbox = {
  south: number;
  west: number;
  north: number;
  east: number;
};

export type MapFilterState = {
  bbox?: MapBbox;
  district?: string;
  listingType?: "sale" | "rent" | "all";
  q?: string;
};

const NUM = /^-?\d+(?:\.\d+)?$/;

export function parseBboxParam(raw: string | null | undefined): MapBbox | null {
  if (!raw) return null;
  const parts = raw.split(",").map((p) => p.trim());
  if (parts.length !== 4 || !parts.every((p) => NUM.test(p))) return null;
  const [south, west, north, east] = parts.map(Number) as [
    number,
    number,
    number,
    number,
  ];
  if (!(south < north && west < east)) return null;
  if (
    north - south > MAP_PERF_BUDGET.maxBboxSpanDegrees ||
    east - west > MAP_PERF_BUDGET.maxBboxSpanDegrees
  ) {
    return null;
  }
  if (
    south < -90 ||
    north > 90 ||
    west < -180 ||
    east > 180
  ) {
    return null;
  }
  return { south, west, north, east };
}

export function serializeBbox(bbox: MapBbox): string {
  return `${bbox.south},${bbox.west},${bbox.north},${bbox.east}`;
}

export function parseMapSearchParams(
  input: Record<string, string | string[] | undefined>,
): MapFilterState {
  const one = (key: string) => {
    const v = input[key];
    return Array.isArray(v) ? v[0] : v;
  };
  const listingType = one("listing_type");
  return {
    bbox: parseBboxParam(one("bbox")) ?? undefined,
    district: one("district")?.trim().toLowerCase() || undefined,
    listingType:
      listingType === "sale" || listingType === "rent" || listingType === "all"
        ? listingType
        : "all",
    q: one("q")?.trim().slice(0, 120) || undefined,
  };
}

export function mapFiltersToQuery(state: MapFilterState): Record<string, string> {
  const q: Record<string, string> = {};
  if (state.bbox) q.bbox = serializeBbox(state.bbox);
  if (state.district) q.district = state.district;
  if (state.listingType && state.listingType !== "all") {
    q.listing_type = state.listingType;
  }
  if (state.q) q.q = state.q;
  return q;
}

export function stripBboxForCanonical(state: MapFilterState): MapFilterState {
  return {
    district: state.district,
    listingType: state.listingType,
    q: state.q,
  };
}

export function osmEmbedUrl(lat: number, lng: number): string {
  const delta = 0.02;
  const bbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${lat}%2C${lng}`;
}
