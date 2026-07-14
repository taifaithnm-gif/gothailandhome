#!/usr/bin/env node
/**
 * Audit project + developer package field completeness for Wave1 (33 + related).
 * Does not invent missing values.
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = join(ROOT, "pipelines/factory/wave1-hardening");
mkdirSync(OUT, { recursive: true });

const PROJECT_FIELDS = [
  ["name.en", (m) => m.project?.name?.en],
  ["name.th", (m) => m.project?.name?.th],
  ["developer", (m) => m.developer?.slug || m.developer?.name?.en],
  ["district", (m) => m.location?.district_slug],
  ["address.en", (m) => m.project?.address?.en],
  ["gps", (m) => m.project?.latitude != null && m.project?.longitude != null],
  ["construction_status", (m) => m.project?.construction_status],
  ["completion_year", (m) => m.project?.completion_year],
  ["total_units", (m) => m.project?.total_units],
  ["building_count", (m) => m.project?.building_count],
  ["total_floors", (m) => m.project?.total_floors],
  ["facilities", (m) => (m.project?.facilities || []).length > 0],
  ["bts_or_mrt", (m) => (m.project?.transit_tags || []).length > 0],
  ["official_website", (m) => m.project?.official_website],
  ["official_source", (m) => (m.sources || []).length > 0],
  ["google_maps_url", (m) => m.project?.google_maps_url],
  ["media", (m) => m.project?.hero_image_path || m.project?.og_image_path],
  ["verification_ts", (m) => m.collected_at],
];

const DEV_FIELDS = [
  ["name.en", (m) => m.name?.en],
  ["website", (m) => m.website],
  ["logo_url", (m) => m.logo_url],
  ["profile", (m) => m.description?.en || m.profile?.en],
  ["facebook_url", (m) => m.facebook_url],
  ["social", (m) => m.facebook_url || m.social?.facebook || m.line_url],
  ["represented_projects", (m) => {
    const list = m.project_slugs || m.projects || m.represented_projects || [];
    return Array.isArray(list) && list.length > 0 ? list.length : false;
  }],
  ["verification_status", (m) => m.verification_status],
  ["last_verified", (m) => m.last_verified_at || m.collected_at || m.updated_at],
  ["verification_evidence", (m) => (m.sources || []).length > 0],
];

function present(v) {
  if (typeof v === "boolean") return v;
  if (v == null) return false;
  if (typeof v === "number") return Number.isFinite(v);
  if (typeof v === "string") return v.trim().length > 0;
  return Boolean(v);
}

const projectsWithListings = [];
for (const d of readdirSync(join(ROOT, "content/projects")).sort()) {
  const lf = join(ROOT, "content/projects", d, "listings.json");
  if (!existsSync(lf)) continue;
  const n = (JSON.parse(readFileSync(lf, "utf8")).listings || []).length;
  if (!n) continue;
  projectsWithListings.push(d);
}

const projectRows = [];
const developerSlugs = new Set();
for (const slug of projectsWithListings) {
  const m = JSON.parse(
    readFileSync(join(ROOT, "content/projects", slug, "manifest.json"), "utf8"),
  );
  const gaps = [];
  const fields = {};
  for (const [key, getter] of PROJECT_FIELDS) {
    const ok = present(getter(m));
    fields[key] = ok;
    if (!ok) gaps.push(key);
  }
  developerSlugs.add(m.developer?.slug);
  projectRows.push({
    slug,
    developer: m.developer?.slug,
    district: m.location?.district_slug,
    present_count: Object.values(fields).filter(Boolean).length,
    total: PROJECT_FIELDS.length,
    gaps,
    fields,
  });
}

const developerRows = [];
for (const slug of [...developerSlugs].filter(Boolean).sort()) {
  const mf = join(ROOT, "content/developers", slug, "manifest.json");
  if (!existsSync(mf)) {
    developerRows.push({
      slug,
      missing_package: true,
      gaps: DEV_FIELDS.map(([k]) => k),
      represented_in_wave1: projectsWithListings.filter((p) => {
        const m = JSON.parse(
          readFileSync(
            join(ROOT, "content/projects", p, "manifest.json"),
            "utf8",
          ),
        );
        return m.developer?.slug === slug;
      }),
    });
    continue;
  }
  const m = JSON.parse(readFileSync(mf, "utf8"));
  const gaps = [];
  const fields = {};
  for (const [key, getter] of DEV_FIELDS) {
    const ok = present(getter(m));
    fields[key] = ok;
    if (!ok) gaps.push(key);
  }
  developerRows.push({
    slug,
    missing_package: false,
    present_count: Object.values(fields).filter(Boolean).length,
    total: DEV_FIELDS.length,
    gaps,
    fields,
    website: m.website || null,
    verification_status: m.verification_status || null,
    represented_in_wave1: projectRows
      .filter((p) => p.developer === slug)
      .map((p) => p.slug),
  });
}

const report = {
  generated_at: new Date().toISOString(),
  projects_audited: projectRows.length,
  developers_audited: developerRows.length,
  project_gap_frequency: {},
  developer_gap_frequency: {},
  projects: projectRows,
  developers: developerRows,
};

for (const p of projectRows) {
  for (const g of p.gaps) {
    report.project_gap_frequency[g] =
      (report.project_gap_frequency[g] || 0) + 1;
  }
}
for (const d of developerRows) {
  for (const g of d.gaps || []) {
    report.developer_gap_frequency[g] =
      (report.developer_gap_frequency[g] || 0) + 1;
  }
}

writeFileSync(
  join(OUT, "project-developer-completeness.json"),
  JSON.stringify(report, null, 2),
);
console.log(
  JSON.stringify(
    {
      projects: report.projects_audited,
      developers: report.developers_audited,
      project_gap_frequency: report.project_gap_frequency,
      developer_gap_frequency: report.developer_gap_frequency,
      out: join(OUT, "project-developer-completeness.json"),
    },
    null,
    2,
  ),
);
