import "server-only";

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { Locale } from "@/config/locales";

export type LocalizedText = Record<Locale, string>;

export type DeveloperPackageSource = {
  type: string;
  name: string;
  url: string;
};

export type DeveloperListedCompany = {
  exchange: string | null;
  ticker: string | null;
  profileUrl: string | null;
};

export type DeveloperProjectRef = {
  slug: string;
  name: LocalizedText;
  factoryStatus: string | null;
};

export type DeveloperPackageFacts = {
  companyProfile: LocalizedText | null;
  establishedYear: number | null;
  headquarters: LocalizedText | null;
  sources: DeveloperPackageSource[];
  listedCompany: DeveloperListedCompany | null;
  logoStatus: string | null;
  officialLogoUrl: string | null;
  verifiedAt: string | null;
  projectSlugs: string[];
  completedProjects: DeveloperProjectRef[];
  activeProjects: DeveloperProjectRef[];
  unclassifiedProjects: DeveloperProjectRef[];
};

const emptyLocalized = (): LocalizedText => ({ en: "", zh: "", th: "" });

function asLocalized(raw: unknown): LocalizedText | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const obj = raw as Record<string, unknown>;
  const out = emptyLocalized();
  let has = false;
  for (const locale of ["en", "zh", "th"] as const) {
    const value = obj[locale];
    if (typeof value === "string" && value.trim()) {
      out[locale] = value.trim();
      has = true;
    }
  }
  return has ? out : null;
}

function asProjectRefs(raw: unknown): DeveloperProjectRef[] {
  if (!Array.isArray(raw)) return [];
  const out: DeveloperProjectRef[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const obj = item as Record<string, unknown>;
    if (typeof obj.slug !== "string" || !obj.slug.trim()) continue;
    const name = asLocalized(obj.name) ?? {
      en: obj.slug,
      zh: obj.slug,
      th: obj.slug,
    };
    out.push({
      slug: obj.slug.trim(),
      name,
      factoryStatus:
        typeof obj.factory_status === "string" ? obj.factory_status : null,
    });
  }
  return out;
}

const empty: DeveloperPackageFacts = {
  companyProfile: null,
  establishedYear: null,
  headquarters: null,
  sources: [],
  listedCompany: null,
  logoStatus: null,
  officialLogoUrl: null,
  verifiedAt: null,
  projectSlugs: [],
  completedProjects: [],
  activeProjects: [],
  unclassifiedProjects: [],
};

/**
 * Read-only presentation fields from developer packages.
 * Does not mutate manifests or upgrade classifications.
 */
export function getDeveloperPackageFacts(
  slug: string,
): DeveloperPackageFacts {
  const path = join(
    process.cwd(),
    "content",
    "developers",
    slug,
    "manifest.json",
  );
  if (!existsSync(path)) return empty;

  try {
    const manifest = JSON.parse(readFileSync(path, "utf8")) as Record<
      string,
      unknown
    >;

    const companyProfile =
      asLocalized(manifest.company_profile) ??
      asLocalized(manifest.description);

    const headquarters = asLocalized(manifest.headquarters);

    const establishedYear =
      typeof manifest.established_year === "number" &&
      Number.isFinite(manifest.established_year)
        ? manifest.established_year
        : null;

    const sourcesRaw = Array.isArray(manifest.sources) ? manifest.sources : [];
    const sources: DeveloperPackageSource[] = [];
    for (const item of sourcesRaw) {
      if (!item || typeof item !== "object") continue;
      const obj = item as Record<string, unknown>;
      if (typeof obj.url !== "string" || !obj.url.trim()) continue;
      sources.push({
        type: typeof obj.type === "string" ? obj.type : "source",
        name: typeof obj.name === "string" ? obj.name : obj.url,
        url: obj.url.trim(),
      });
    }

    let listedCompany: DeveloperListedCompany | null = null;
    if (
      manifest.listed_company &&
      typeof manifest.listed_company === "object" &&
      !Array.isArray(manifest.listed_company)
    ) {
      const lc = manifest.listed_company as Record<string, unknown>;
      listedCompany = {
        exchange: typeof lc.exchange === "string" ? lc.exchange : null,
        ticker: typeof lc.ticker === "string" ? lc.ticker : null,
        profileUrl:
          typeof lc.profile_url === "string" ? lc.profile_url : null,
      };
    }

    const logoSource =
      manifest.logo_source &&
      typeof manifest.logo_source === "object" &&
      !Array.isArray(manifest.logo_source)
        ? (manifest.logo_source as Record<string, unknown>)
        : null;

    const master =
      manifest.developer_master &&
      typeof manifest.developer_master === "object" &&
      !Array.isArray(manifest.developer_master)
        ? (manifest.developer_master as Record<string, unknown>)
        : null;

    const projectSlugs = Array.isArray(manifest.project_slugs)
      ? manifest.project_slugs.filter(
          (item): item is string =>
            typeof item === "string" && Boolean(item.trim()),
        )
      : [];

    return {
      companyProfile,
      establishedYear,
      headquarters,
      sources,
      listedCompany,
      logoStatus:
        typeof logoSource?.status === "string" ? logoSource.status : null,
      officialLogoUrl:
        typeof logoSource?.official_logo_url === "string"
          ? logoSource.official_logo_url
          : null,
      verifiedAt:
        typeof master?.verified_at === "string" ? master.verified_at : null,
      projectSlugs,
      completedProjects: asProjectRefs(manifest.completed_projects),
      activeProjects: asProjectRefs(manifest.active_projects),
      unclassifiedProjects: asProjectRefs(manifest.unclassified_projects),
    };
  } catch {
    return empty;
  }
}
