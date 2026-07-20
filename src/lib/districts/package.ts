import "server-only";

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { Locale } from "@/config/locales";
import {
  coerceLocalizedText,
  type LocalizedText,
} from "@/lib/projects/normalize-project-content";

export type DistrictAmenity = {
  name: LocalizedText;
  mode?: string | null;
  sourceUrl?: string | null;
};

export type DistrictSource = {
  type: string;
  name: string;
  url: string;
};

export type DistrictPackage = {
  citySlug: string;
  slug: string;
  name: LocalizedText | null;
  summary: LocalizedText | null;
  postalCode: string | null;
  districtCode: number | null;
  khwaengCount: number | null;
  latitude: number | null;
  longitude: number | null;
  transportation: DistrictAmenity[];
  schools: DistrictAmenity[];
  hospitals: DistrictAmenity[];
  shopping: DistrictAmenity[];
  investmentSummary: LocalizedText | null;
  nearbyProjectSlugs: string[];
  sources: DistrictSource[];
};

const empty: DistrictPackage = {
  citySlug: "",
  slug: "",
  name: null,
  summary: null,
  postalCode: null,
  districtCode: null,
  khwaengCount: null,
  latitude: null,
  longitude: null,
  transportation: [],
  schools: [],
  hospitals: [],
  shopping: [],
  investmentSummary: null,
  nearbyProjectSlugs: [],
  sources: [],
};

function asNumber(raw: unknown): number | null {
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string" && raw.trim() && Number.isFinite(Number(raw))) {
    return Number(raw);
  }
  return null;
}

function asString(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  return trimmed || null;
}

function normalizeAmenity(raw: unknown): DistrictAmenity | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const obj = raw as Record<string, unknown>;
  const name = coerceLocalizedText(obj.name);
  if (!name) return null;
  return {
    name,
    mode: asString(obj.mode),
    sourceUrl: asString(obj.source_url) ?? asString(obj.url),
  };
}

function normalizeAmenities(raw: unknown): DistrictAmenity[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => normalizeAmenity(item))
    .filter((item): item is DistrictAmenity => item != null);
}

function normalizeSources(raw: unknown): DistrictSource[] {
  if (!Array.isArray(raw)) return [];
  const out: DistrictSource[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const obj = item as Record<string, unknown>;
    const name = asString(obj.name);
    const url = asString(obj.url);
    if (!name || !url) continue;
    out.push({
      type: asString(obj.type) ?? "source",
      name,
      url,
    });
  }
  return out;
}

function packagePath(citySlug: string, districtSlug: string): string {
  return join(
    process.cwd(),
    "content",
    "areas",
    citySlug,
    "districts",
    `${districtSlug}.json`,
  );
}

/**
 * Read-only district SEO package. Empty arrays stay empty — never invent POIs.
 */
export function getDistrictPackage(
  districtSlug: string,
  citySlug = "bangkok",
): DistrictPackage {
  const candidates = [
    packagePath(citySlug, districtSlug),
    packagePath("bangkok", districtSlug),
  ];
  const path = candidates.find((candidate) => existsSync(candidate));
  if (!path) return { ...empty, slug: districtSlug, citySlug };

  try {
    const raw = JSON.parse(readFileSync(path, "utf8")) as Record<
      string,
      unknown
    >;
    const metadata =
      raw.metadata && typeof raw.metadata === "object"
        ? (raw.metadata as Record<string, unknown>)
        : {};

    const nearby = Array.isArray(raw.nearby_projects)
      ? raw.nearby_projects
          .map((slug) => asString(slug))
          .filter((slug): slug is string => Boolean(slug))
      : [];

    return {
      citySlug: asString(raw.city_slug) ?? citySlug,
      slug: asString(raw.slug) ?? districtSlug,
      name: coerceLocalizedText(raw.name),
      summary: coerceLocalizedText(raw.summary),
      postalCode: asString(metadata.postal_code),
      districtCode: asNumber(metadata.district_code),
      khwaengCount: asNumber(metadata.khwaeng_count),
      latitude: asNumber(metadata.latitude),
      longitude: asNumber(metadata.longitude),
      transportation: normalizeAmenities(raw.transportation),
      schools: normalizeAmenities(raw.schools),
      hospitals: normalizeAmenities(raw.hospitals),
      shopping: normalizeAmenities(raw.shopping),
      investmentSummary: coerceLocalizedText(raw.investment_summary),
      nearbyProjectSlugs: nearby,
      sources: normalizeSources(raw.sources),
    };
  } catch {
    return { ...empty, slug: districtSlug, citySlug };
  }
}

export function localizedOrNull(
  text: LocalizedText | null | undefined,
  locale: Locale,
): string | null {
  if (!text) return null;
  const value = text[locale] || text.en || text.zh || text.th;
  const trimmed = value?.trim();
  return trimmed || null;
}

export function hasDistrictCoordinates(pkg: DistrictPackage): boolean {
  return pkg.latitude != null && pkg.longitude != null;
}

export function districtMapsUrl(pkg: DistrictPackage): string | null {
  if (!hasDistrictCoordinates(pkg)) return null;
  return `https://www.google.com/maps/search/?api=1&query=${pkg.latitude},${pkg.longitude}`;
}

/** Bounded discovery previews on district detail HTML. */
export const DISTRICT_PROJECT_PREVIEW_SIZE = 6;
export const DISTRICT_LISTING_PREVIEW_SIZE = 12;
