#!/usr/bin/env node
/**
 * Wave1 listing data-quality audit (packages + optional DB).
 * Does not delete records. Writes evidence JSON under wave1-hardening/.
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
import { createClient } from "@supabase/supabase-js";
import {
  deriveListingIdentity,
} from "./lib/listing-identity.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = join(ROOT, "pipelines/factory/wave1-hardening");
mkdirSync(OUT, { recursive: true });

function loadEnvLocal() {
  try {
    const text = readFileSync(join(ROOT, ".env.local"), "utf8");
    for (const line of text.split("\n")) {
      if (!line || line.startsWith("#") || !line.includes("=")) continue;
      const i = line.indexOf("=");
      const key = line.slice(0, i);
      let value = line.slice(i + 1);
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      )
        value = value.slice(1, -1);
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    /* ignore */
  }
}
loadEnvLocal();

const listings = [];
const projectMeta = new Map();
for (const d of readdirSync(join(ROOT, "content/projects")).sort()) {
  const mf = join(ROOT, "content/projects", d, "manifest.json");
  if (!existsSync(mf)) continue;
  const manifest = JSON.parse(readFileSync(mf, "utf8"));
  projectMeta.set(d, manifest);
  const lf = join(ROOT, "content/projects", d, "listings.json");
  if (!existsSync(lf)) continue;
  const L = JSON.parse(readFileSync(lf, "utf8"));
  for (const x of L.listings || []) {
    listings.push({ project_dir: d, ...x });
  }
}

function bucketPush(map, key, item) {
  if (!map.has(key)) map.set(key, []);
  map.get(key).push(item);
}

const bySourceId = new Map();
const byUrl = new Map();
const byNormUrl = new Map();
const byFp = new Map();
const bySoft = new Map();
const issues = [];

for (const L of listings) {
  const id = deriveListingIdentity(L);
  const ref = {
    external_ref: L.external_ref,
    project: L.project_dir,
    listing_url: L.listing_url,
  };

  if (id.source_listing_id)
    bucketPush(bySourceId, `${id.source}:${id.source_listing_id}`, ref);
  if (L.listing_url) bucketPush(byUrl, L.listing_url, ref);
  if (id.normalized_source_url)
    bucketPush(byNormUrl, id.normalized_source_url, ref);
  if (id.duplicate_fingerprint)
    bucketPush(byFp, id.duplicate_fingerprint, ref);
  if (id.soft_match_fingerprint)
    bucketPush(bySoft, id.soft_match_fingerprint, ref);

  if (!L.listing_url) {
    issues.push({ code: "missing_source_url", ...ref });
  }
  if (L.price_thb == null || !(Number(L.price_thb) > 0)) {
    issues.push({ code: "missing_or_invalid_price", price: L.price_thb, ...ref });
  }
  if (L.area_sqm == null || !(Number(L.area_sqm) > 0)) {
    issues.push({ code: "invalid_or_zero_area", area_sqm: L.area_sqm, ...ref });
  }
  if (L.bedrooms != null && (L.bedrooms < 0 || L.bedrooms > 20)) {
    issues.push({ code: "invalid_bedrooms", bedrooms: L.bedrooms, ...ref });
  }
  if (L.bathrooms != null && (L.bathrooms < 0 || L.bathrooms > 20)) {
    issues.push({ code: "invalid_bathrooms", bathrooms: L.bathrooms, ...ref });
  }
  if (Number(L.area_sqm) > 0 && Number(L.price_thb) > 0) {
    const pps = Number(L.price_thb) / Number(L.area_sqm);
    const isSale = L.listing_type === "sale";
    if (isSale && (pps < 20000 || pps > 2000000)) {
      issues.push({
        code: "unreasonable_price_per_sqm",
        pps: Math.round(pps),
        listing_type: L.listing_type,
        ...ref,
      });
    }
    if (!isSale && (pps < 50 || pps > 10000)) {
      issues.push({
        code: "unreasonable_rent_per_sqm",
        pps: Math.round(pps),
        listing_type: L.listing_type,
        ...ref,
      });
    }
  }
  for (const field of [
    "source_updated_at",
    "source_captured_at",
    "collected_at",
  ]) {
    const v = L[field];
    if (v && Number.isNaN(Date.parse(v))) {
      issues.push({ code: "malformed_date", field, value: v, ...ref });
    }
  }
  const capt = L.source_captured_at || L.collected_at;
  if (capt) {
    const ageDays = (Date.now() - Date.parse(capt)) / 86400000;
    if (ageDays > 45) {
      issues.push({
        code: "stale_verification_timestamp",
        days: Math.round(ageDays),
        ...ref,
      });
    }
  }
  if (!L.project_slug || L.project_slug !== L.project_dir) {
    issues.push({
      code: "inconsistent_project_slug",
      project_slug: L.project_slug,
      project_dir: L.project_dir,
      ...ref,
    });
  }
  const man = projectMeta.get(L.project_dir);
  if (man?.location?.district_slug && L.district_slug) {
    if (man.location.district_slug !== L.district_slug) {
      issues.push({
        code: "inconsistent_district_assignment",
        listing_district: L.district_slug,
        manifest_district: man.location.district_slug,
        ...ref,
      });
    }
  }
  if (!man) {
    issues.push({ code: "missing_project_relation", ...ref });
  }
}

function dups(map) {
  return [...map.entries()]
    .filter(([, arr]) => arr.length > 1)
    .map(([key, items]) => ({ key, count: items.length, items }));
}

const softDupCandidates = dups(bySoft).filter((d) => {
  // Same soft fingerprint but different source listing ids = candidate only
  const ids = new Set(
    d.items.map((i) => i.external_ref),
  );
  return ids.size > 1;
});

const audit = {
  generated_at: new Date().toISOString(),
  package_totals: {
    projects_with_listings: new Set(listings.map((l) => l.project_dir)).size,
    listings: listings.length,
    verified: listings.filter((l) => l.verification_status === "verified")
      .length,
  },
  duplicates: {
    source_listing_id: dups(bySourceId),
    listing_url: dups(byUrl),
    normalized_source_url: dups(byNormUrl),
    identity_fingerprint: dups(byFp),
    soft_match_candidates: softDupCandidates.slice(0, 100),
  },
  duplicate_counts: {
    source_listing_id: dups(bySourceId).length,
    listing_url: dups(byUrl).length,
    normalized_source_url: dups(byNormUrl).length,
    identity_fingerprint: dups(byFp).length,
    soft_match_candidates: softDupCandidates.length,
  },
  issues_by_code: {},
  issues: issues.slice(0, 500),
  issue_total: issues.length,
};

for (const i of issues) {
  audit.issues_by_code[i.code] = (audit.issues_by_code[i.code] || 0) + 1;
}

// DB reconciliation
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
let db = null;
if (supabaseUrl && service) {
  const admin = createClient(supabaseUrl, service, {
    auth: { persistSession: false },
  });
  let rows = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await admin
      .from("properties")
      .select(
        "id,external_ref,listing_url,source,price_thb,verification_status,is_verified_listing,duplicate_fingerprint,source_listing_id,normalized_source_url,project_id,updated_at",
      )
      .or("source.eq.propertyhub,source.eq.PropertyHub")
      .range(from, from + 999);
    if (error) {
      db = { error: error.message };
      break;
    }
    rows = rows.concat(data || []);
    if (!data || data.length < 1000) break;
  }
  if (!db?.error) {
    const pkgRefs = new Set(listings.map((l) => l.external_ref));
    const dbRefs = new Set(rows.map((r) => r.external_ref).filter(Boolean));
    db = {
      propertyhub_rows: rows.length,
      matched_external_ref: [...pkgRefs].filter((r) => dbRefs.has(r)).length,
      package_only: [...pkgRefs].filter((r) => !dbRefs.has(r)),
      db_only: [...dbRefs].filter((r) => !pkgRefs.has(r)),
      verification_status_dist: {},
      missing_identity_fp: rows.filter((r) => !r.duplicate_fingerprint).length,
      missing_source_listing_id: rows.filter((r) => !r.source_listing_id)
        .length,
      price_match: 0,
      price_mismatch: [],
    };
    for (const r of rows) {
      const k = r.verification_status || "null";
      db.verification_status_dist[k] =
        (db.verification_status_dist[k] || 0) + 1;
    }
    for (const L of listings) {
      const r = rows.find((x) => x.external_ref === L.external_ref);
      if (!r) continue;
      if (Number(r.price_thb) === Number(L.price_thb)) db.price_match += 1;
      else
        db.price_mismatch.push({
          external_ref: L.external_ref,
          pkg: L.price_thb,
          db: r.price_thb,
        });
    }
  }
}
audit.db = db;

writeFileSync(join(OUT, "wave1-listing-audit.json"), JSON.stringify(audit, null, 2));
writeFileSync(
  join(OUT, "wave1-duplicates.json"),
  JSON.stringify(audit.duplicates, null, 2),
);
console.log(
  JSON.stringify(
    {
      out: OUT,
      listings: audit.package_totals.listings,
      issue_total: audit.issue_total,
      issues_by_code: audit.issues_by_code,
      duplicate_counts: audit.duplicate_counts,
      db_matched: audit.db?.matched_external_ref,
      db_only: audit.db?.db_only?.length,
      price_mismatch: audit.db?.price_mismatch?.length,
    },
    null,
    2,
  ),
);
