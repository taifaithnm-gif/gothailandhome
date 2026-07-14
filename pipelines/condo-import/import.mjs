#!/usr/bin/env node
/**
 * Upserts a condo project package (manifest.json + listings.json) into Supabase.
 * Usage: node pipelines/condo-import/import.mjs content/projects/<slug> [--dry-run]
 *
 * Multi-source safe: upserts property_listing_sources row per source identity;
 * appends listing_price_history when price changes; does not auto-merge soft matches.
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { deriveListingIdentity } from "../factory/lib/listing-identity.mjs";

function loadEnvLocal() {
  try {
    const text = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of text.split("\n")) {
      if (!line || line.startsWith("#") || !line.includes("=")) continue;
      const i = line.indexOf("=");
      const key = line.slice(0, i);
      let value = line.slice(i + 1);
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // ignore
  }
}

loadEnvLocal();

const packageDir = resolve(process.cwd(), process.argv[2] || "");
const dryRun = process.argv.includes("--dry-run");

if (!packageDir || !existsSync(packageDir)) {
  console.error(
    "Usage: node pipelines/condo-import/import.mjs content/projects/<slug> [--dry-run]",
  );
  process.exit(1);
}

const manifestPath = resolve(packageDir, "manifest.json");
const listingsPath = resolve(packageDir, "listings.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const listingsPkg = JSON.parse(readFileSync(listingsPath, "utf8"));

function requireFields(obj, fields, label) {
  for (const field of fields) {
    if (obj[field] == null || obj[field] === "") {
      throw new Error(`${label} missing required field: ${field}`);
    }
  }
}

requireFields(
  manifest,
  ["slug", "developer", "location", "project"],
  "manifest",
);
requireFields(manifest.developer, ["slug", "name"], "developer");
requireFields(manifest.project, ["name", "address"], "project");

for (const listing of listingsPkg.listings || []) {
  requireFields(
    listing,
    [
      "external_ref",
      "listing_type",
      "price_thb",
      "source",
      "listing_url",
      "source_updated_at",
      "title",
      "summary",
      "description",
    ],
    `listing ${listing.external_ref || "?"}`,
  );
}

console.log(`Package: ${manifest.slug}`);
console.log(`Listings: ${(listingsPkg.listings || []).length}`);
if (dryRun) {
  console.log("Dry run OK — no database writes.");
  process.exit(0);
}

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing Supabase URL / service role key");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function resolveCityId(slug) {
  if (!slug) return null;
  const { data, error } = await supabase
    .from("cities")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

async function resolveDistrictId(slug) {
  if (!slug) return null;
  const { data, error } = await supabase
    .from("districts")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

const loc = manifest.location;
const cityId = await resolveCityId(loc.city_slug);
const districtId = await resolveDistrictId(loc.district_slug);
const transitTags = Array.isArray(manifest.project.transit_tags)
  ? manifest.project.transit_tags
  : [];

const { data: location, error: locErr } = await supabase
  .from("locations")
  .upsert(
    {
      slug: loc.slug,
      name_en: loc.name.en,
      name_zh: loc.name.zh,
      name_th: loc.name.th,
      city_en: loc.city.en,
      city_zh: loc.city.zh,
      city_th: loc.city.th,
      province_en: loc.province.en,
      province_zh: loc.province.zh,
      province_th: loc.province.th,
      country_code: loc.country_code || "TH",
      city_id: cityId,
      district_id: districtId,
    },
    { onConflict: "slug" },
  )
  .select("*")
  .single();
if (locErr) throw locErr;

const dev = manifest.developer;
const { data: developer, error: devErr } = await supabase
  .from("developers")
  .upsert(
    {
      slug: dev.slug,
      name_en: dev.name.en,
      name_zh: dev.name.zh,
      name_th: dev.name.th,
      legal_name_en: dev.legal_name?.en ?? null,
      legal_name_zh: dev.legal_name?.zh ?? null,
      legal_name_th: dev.legal_name?.th ?? null,
      description_en: dev.description?.en ?? null,
      description_zh: dev.description?.zh ?? null,
      description_th: dev.description?.th ?? null,
      website: dev.website ?? null,
      facebook_url: dev.facebook_url ?? null,
      phone: dev.phone ?? null,
      email: dev.email ?? null,
      logo_url: dev.logo_url ?? null,
      is_published: dev.is_published !== false,
      seo_title_en: dev.seo?.title?.en ?? null,
      seo_title_zh: dev.seo?.title?.zh ?? null,
      seo_title_th: dev.seo?.title?.th ?? null,
      seo_description_en: dev.seo?.description?.en ?? null,
      seo_description_zh: dev.seo?.description?.zh ?? null,
      seo_description_th: dev.seo?.description?.th ?? null,
    },
    { onConflict: "slug" },
  )
  .select("*")
  .single();
if (devErr) throw devErr;

const p = manifest.project;
const now = new Date().toISOString();
const { data: project, error: projErr } = await supabase
  .from("property_projects")
  .upsert(
    {
      slug: manifest.slug,
      developer_id: developer.id,
      location_id: location.id,
      city_id: cityId,
      district_id: districtId,
      transit_tags: transitTags,
      status: "published",
      name_en: p.name.en,
      name_zh: p.name.zh,
      name_th: p.name.th,
      description_en: p.description?.en ?? null,
      description_zh: p.description?.zh ?? null,
      description_th: p.description?.th ?? null,
      address_en: p.address.en,
      address_zh: p.address.zh,
      address_th: p.address.th,
      postal_code: p.postal_code ?? null,
      latitude: p.latitude ?? null,
      longitude: p.longitude ?? null,
      google_maps_url: p.google_maps_url ?? null,
      official_website: p.official_website ?? null,
      facebook_url: p.facebook_url ?? null,
      completion_year: p.completion_year ?? null,
      total_floors: p.total_floors ?? null,
      total_units: p.total_units ?? null,
      building_count: p.building_count ?? null,
      land_area_rai: p.land_area_rai ?? null,
      parking_spaces: p.parking_spaces ?? null,
      ceiling_height_m: p.ceiling_height_m ?? null,
      common_fee_thb_per_sqm: p.common_fee_thb_per_sqm ?? null,
      specifications: p.specifications ?? {},
      unit_types: p.unit_types ?? [],
      facilities: p.facilities ?? [],
      transportation: p.transportation ?? [],
      nearby_schools: p.nearby_schools ?? [],
      nearby_hospitals: p.nearby_hospitals ?? [],
      nearby_malls: p.nearby_malls ?? [],
      faq: p.faq ?? [],
      seo_title_en: p.seo?.title?.en ?? null,
      seo_title_zh: p.seo?.title?.zh ?? null,
      seo_title_th: p.seo?.title?.th ?? null,
      seo_description_en: p.seo?.description?.en ?? null,
      seo_description_zh: p.seo?.description?.zh ?? null,
      seo_description_th: p.seo?.description?.th ?? null,
      og_image_path: p.og_image_path ?? null,
      hero_image_path: p.hero_image_path ?? null,
      source_notes: p.source_notes ?? null,
      published_at: now,
    },
    { onConflict: "slug" },
  )
  .select("*")
  .single();
if (projErr) throw projErr;

let listingCount = 0;
for (const listing of listingsPkg.listings || []) {
  const identity = deriveListingIdentity({
    ...listing,
    project_slug: listing.project_slug || manifest.slug,
  });
  const verificationStatus =
    listing.verification_status ||
    (listing.publish_ready ? "verified" : "unverified");
  const capturedAt =
    listing.source_captured_at ||
    listing.collected_at ||
    now.slice(0, 10);
  const verifiedAt =
    verificationStatus === "verified" ? capturedAt : null;

  const slugBase =
    `${manifest.slug}-${listing.listing_type}-${listing.external_ref}`
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 80);

  const listingTransit = Array.isArray(listing.transit_tags)
    ? listing.transit_tags
    : transitTags;

  const payload = {
    slug: slugBase,
    status: "published",
    listing_type: listing.listing_type,
    property_type: listing.property_type || "condo",
    project_id: project.id,
    location_id: location.id,
    city_id: cityId,
    district_id: districtId,
    transit_tags: listingTransit,
    is_verified_listing:
      verificationStatus === "verified" || listing.publish_ready === true,
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
    source: identity.source,
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
    last_verified_at: verifiedAt,
    listing_lifecycle_status:
      verificationStatus === "delisted" ? "delisted" : "active",
    floor_label: listing.floor_label ?? null,
    building_label: listing.building_label ?? null,
  };

  const { data: existingByRef } = await supabase
    .from("properties")
    .select("id,price_thb,listing_type,source,published_at")
    .eq("external_ref", listing.external_ref)
    .maybeSingle();

  let existing = existingByRef;
  if (!existing && identity.source_listing_id) {
    const { data: bySourceId } = await supabase
      .from("properties")
      .select("id,price_thb,listing_type,source,published_at")
      .eq("source", identity.source)
      .eq("source_listing_id", identity.source_listing_id)
      .maybeSingle();
    existing = bySourceId;
  }
  if (!existing) {
    const { data: existingByUrl } = await supabase
      .from("properties")
      .select("id,price_thb,listing_type,source,published_at")
      .eq("listing_url", listing.listing_url)
      .maybeSingle();
    existing = existingByUrl;
  }

  // Preserve original published_at on updates (incremental import)
  if (existing?.published_at) {
    payload.published_at = existing.published_at;
  } else {
    payload.published_at = now;
  }

  let propertyId = existing?.id;
  let error;
  if (existing?.id) {
    ({ error } = await supabase
      .from("properties")
      .update(payload)
      .eq("id", existing.id));
  } else {
    const { data: inserted, error: insertErr } = await supabase
      .from("properties")
      .insert(payload)
      .select("id")
      .single();
    error = insertErr;
    propertyId = inserted?.id;
  }
  if (error) throw error;

  // Append price history when price changes (or first observation)
  const prevPrice = existing?.price_thb != null ? Number(existing.price_thb) : null;
  const nextPrice = Number(listing.price_thb);
  if (propertyId && (prevPrice == null || prevPrice !== nextPrice)) {
    await supabase.from("listing_price_history").insert({
      property_id: propertyId,
      price_thb: nextPrice,
      listing_type: listing.listing_type,
      verification_status: verificationStatus,
      source: identity.source,
      listing_url: listing.listing_url,
      observed_at: now,
      note: prevPrice == null ? "initial_import" : "price_change",
    });
  }

  // Per-source row (does not erase other sources)
  if (propertyId && identity.source_listing_id) {
    const sourceRow = {
      property_id: propertyId,
      source: identity.source,
      source_listing_id: identity.source_listing_id,
      listing_url: listing.listing_url,
      normalized_source_url: identity.normalized_source_url,
      source_url_hash: identity.source_url_hash,
      listing_type: listing.listing_type,
      price_thb: nextPrice,
      verification_status: verificationStatus,
      identity_fingerprint: identity.duplicate_fingerprint,
      soft_match_fingerprint: identity.soft_match_fingerprint,
      last_seen_at: now,
      last_verified_at: verifiedAt,
      is_primary: true,
      payload: {
        external_ref: listing.external_ref,
        project_slug: listing.project_slug || manifest.slug,
      },
    };
    const { data: existingSource } = await supabase
      .from("property_listing_sources")
      .select("id,first_seen_at")
      .eq("source", identity.source)
      .eq("source_listing_id", identity.source_listing_id)
      .maybeSingle();
    if (existingSource?.id) {
      await supabase
        .from("property_listing_sources")
        .update(sourceRow)
        .eq("id", existingSource.id);
    } else {
      await supabase.from("property_listing_sources").insert(sourceRow);
    }
  }

  listingCount += 1;
}
console.log(
  JSON.stringify(
    {
      ok: true,
      project_slug: project.slug,
      project_id: project.id,
      developer_id: developer.id,
      location_id: location.id,
      city_id: cityId,
      district_id: districtId,
      listings_upserted: listingCount,
    },
    null,
    2,
  ),
);
