#!/usr/bin/env node
/**
 * Hipflat-only importer.
 * - Reads listings-hipflat.json only
 * - Resolves existing project by slug (no parent rewrites)
 * - Upserts ONLY rows with source=hipflat
 * - Never updates PropertyHub, LivingInsider, or DDproperty properties
 */
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { deriveListingIdentity } from "../lib/listing-identity.mjs";
import { validateListingRecord } from "../lib/validate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const dryRun = process.argv.includes("--dry-run");
const limit = Number(
  (process.argv.find((a) => a.startsWith("--limit=")) || "--limit=99999").split(
    "=",
  )[1],
);
const OUT = join(ROOT, "pipelines/factory/hipflat/_runs");
mkdirSync(OUT, { recursive: true });

function loadEnvLocal() {
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
}
loadEnvLocal();

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

await admin.from("listing_source_priority").upsert(
  {
    source: "hipflat",
    priority: 23,
    notes: "Hipflat Wave 1 adapter",
  },
  { onConflict: "source" },
);

const report = {
  dry_run: dryRun,
  started_at: new Date().toISOString(),
  validated: 0,
  validation_failed: [],
  inserted: 0,
  updated: 0,
  skipped: 0,
  price_history: 0,
  source_rows: 0,
  events: 0,
  errors: [],
  projects: [],
};

const projects = readdirSync(join(ROOT, "content/projects"))
  .filter((d) =>
    existsSync(join(ROOT, "content/projects", d, "listings-hipflat.json")),
  )
  .filter((d) => {
    const n = (
      JSON.parse(
        readFileSync(
          join(ROOT, "content/projects", d, "listings-hipflat.json"),
          "utf8",
        ),
      ).listings || []
    ).length;
    return n > 0;
  })
  .slice(0, limit);

if (!projects.length) {
  report.finished_at = new Date().toISOString();
  report.note =
    "No listings-hipflat.json packages with listings — nothing to import (harvest empty/blocked).";
  writeFileSync(join(OUT, "import-hf-only.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  process.exit(0);
}

for (const slug of projects) {
  const pkg = JSON.parse(
    readFileSync(
      join(ROOT, "content/projects", slug, "listings-hipflat.json"),
      "utf8",
    ),
  );
  const { data: project, error: pErr } = await admin
    .from("property_projects")
    .select("id,location_id,city_id,district_id")
    .eq("slug", slug)
    .maybeSingle();
  if (pErr || !project) {
    report.errors.push({
      slug,
      error: pErr?.message || "project_not_found_in_db",
    });
    continue;
  }

  let projectInserted = 0;
  let projectUpdated = 0;

  for (const listing of pkg.listings || []) {
    if (listing.source && listing.source !== "hipflat") {
      report.skipped += 1;
      continue;
    }
    const v = validateListingRecord(listing);
    if (!v.ok) {
      report.validation_failed.push({
        slug,
        external_ref: listing.external_ref,
        errors: v.errors.slice(0, 6),
      });
      continue;
    }
    report.validated += 1;

    const identity = deriveListingIdentity({
      ...listing,
      source: "hipflat",
      project_slug: listing.project_slug || slug,
    });
    const now = new Date().toISOString();
    const verificationStatus = listing.verification_status || "verified";
    const capturedAt =
      listing.source_captured_at || listing.collected_at || now.slice(0, 10);
    const slugBase =
      `${slug}-${listing.listing_type}-${listing.external_ref}`
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 80);

    const payload = {
      slug: slugBase,
      status: "published",
      listing_type: listing.listing_type,
      property_type: listing.property_type || "condo",
      project_id: project.id,
      location_id: project.location_id,
      city_id: project.city_id,
      district_id: project.district_id,
      transit_tags: listing.transit_tags || [],
      is_verified_listing: verificationStatus === "verified",
      verification_status: verificationStatus,
      price_thb: listing.price_thb,
      bedrooms: listing.bedrooms ?? null,
      bathrooms: listing.bathrooms ?? null,
      area_sqm: listing.area_sqm ?? null,
      title_en: listing.title.en,
      title_zh: listing.title.zh,
      title_th: listing.title.th,
      summary_en: listing.summary.en,
      summary_zh: listing.summary.zh,
      summary_th: listing.summary.th,
      description_en: listing.description.en,
      description_zh: listing.description.zh,
      description_th: listing.description.th,
      featured: Boolean(listing.featured),
      source: "hipflat",
      listing_url: listing.listing_url,
      source_updated_at: listing.source_updated_at,
      source_captured_at: capturedAt,
      external_ref: identity.external_ref || listing.external_ref,
      source_listing_id: identity.source_listing_id,
      normalized_source_url: identity.normalized_source_url,
      source_url_hash: identity.source_url_hash,
      duplicate_fingerprint: identity.duplicate_fingerprint,
      soft_match_fingerprint: identity.soft_match_fingerprint,
      last_seen_at: now,
      last_verified_at: verificationStatus === "verified" ? capturedAt : null,
      listing_lifecycle_status: "active",
      floor_label: listing.floor_label ?? null,
      building_label: listing.building_label ?? null,
      published_at: now,
    };

    const { data: existing } = await admin
      .from("properties")
      .select("id,price_thb,published_at,source")
      .eq("source", "hipflat")
      .eq("external_ref", listing.external_ref)
      .maybeSingle();

    if (existing?.source && existing.source !== "hipflat") {
      report.errors.push({
        slug,
        external_ref: listing.external_ref,
        error: "refused_non_hipflat_row",
      });
      continue;
    }
    if (existing?.published_at) payload.published_at = existing.published_at;

    if (dryRun) {
      if (existing) projectUpdated += 1;
      else projectInserted += 1;
      continue;
    }

    let propertyId = existing?.id;
    if (existing?.id) {
      const { error } = await admin
        .from("properties")
        .update(payload)
        .eq("id", existing.id)
        .eq("source", "hipflat");
      if (error) {
        report.errors.push({
          slug,
          external_ref: listing.external_ref,
          error: error.message,
        });
        continue;
      }
      report.updated += 1;
      projectUpdated += 1;
    } else {
      const { data: inserted, error } = await admin
        .from("properties")
        .insert(payload)
        .select("id")
        .single();
      if (error) {
        report.errors.push({
          slug,
          external_ref: listing.external_ref,
          error: error.message,
        });
        continue;
      }
      propertyId = inserted.id;
      report.inserted += 1;
      projectInserted += 1;
    }

    const prev =
      existing?.price_thb != null ? Number(existing.price_thb) : null;
    const next = Number(listing.price_thb);
    if (propertyId && (prev == null || prev !== next)) {
      await admin.from("listing_price_history").insert({
        property_id: propertyId,
        price_thb: next,
        listing_type: listing.listing_type,
        verification_status: verificationStatus,
        source: "hipflat",
        listing_url: listing.listing_url,
        observed_at: now,
        note: prev == null ? "hipflat_import" : "price_change",
      });
      report.price_history += 1;
    }

    if (propertyId && identity.source_listing_id) {
      const sourceRow = {
        property_id: propertyId,
        source: "hipflat",
        source_listing_id: identity.source_listing_id,
        listing_url: listing.listing_url,
        normalized_source_url: identity.normalized_source_url,
        source_url_hash: identity.source_url_hash,
        listing_type: listing.listing_type,
        price_thb: next,
        verification_status: verificationStatus,
        identity_fingerprint: identity.duplicate_fingerprint,
        soft_match_fingerprint: identity.soft_match_fingerprint,
        last_seen_at: now,
        last_verified_at: capturedAt,
        is_primary: true,
        payload: { external_ref: listing.external_ref, project_slug: slug },
      };
      const { data: es } = await admin
        .from("property_listing_sources")
        .select("id")
        .eq("source", "hipflat")
        .eq("source_listing_id", identity.source_listing_id)
        .maybeSingle();
      if (es?.id) {
        await admin
          .from("property_listing_sources")
          .update(sourceRow)
          .eq("id", es.id);
      } else {
        await admin.from("property_listing_sources").insert(sourceRow);
      }
      report.source_rows += 1;
    }

    await admin.from("listing_verification_events").insert({
      property_id: propertyId,
      source: "hipflat",
      source_listing_id: identity.source_listing_id,
      event_type: "hipflat_import",
      to_status: verificationStatus,
      evidence: { external_ref: listing.external_ref, project_slug: slug },
      batch_key: `hipflat-wave1-${now.slice(0, 10)}`,
    });
    report.events += 1;
  }

  report.projects.push({
    slug,
    listings: (pkg.listings || []).length,
    inserted: projectInserted,
    updated: projectUpdated,
  });
}

report.finished_at = new Date().toISOString();
writeFileSync(join(OUT, "import-hf-only.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
process.exit(report.errors.length || report.validation_failed.length ? 1 : 0);
