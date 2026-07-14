#!/usr/bin/env node
/**
 * Backfill Wave1 PropertyHub identity/provenance fields from packages.
 * Does NOT re-harvest. Does NOT change prices unless package==db mismatch (logs only).
 * Usage: node pipelines/factory/backfill-wave1-identity.mjs [--dry-run] [--limit=N]
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
import { deriveListingIdentity } from "./lib/listing-identity.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const dryRun = process.argv.includes("--dry-run");
const limit = Number(
  (process.argv.find((a) => a.startsWith("--limit=")) || "--limit=99999").split(
    "=",
  )[1],
);

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
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}
loadEnvLocal();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const BATCH_KEY = `wave1-identity-backfill-${new Date().toISOString().slice(0, 10)}`;
const evidenceDir = join(ROOT, "pipelines/factory/wave1-hardening");
mkdirSync(evidenceDir, { recursive: true });

const packages = [];
for (const d of readdirSync(join(ROOT, "content/projects"))) {
  const f = join(ROOT, "content/projects", d, "listings.json");
  if (!existsSync(f)) continue;
  const L = JSON.parse(readFileSync(f, "utf8"));
  for (const listing of L.listings || []) {
    packages.push({ project: d, listing });
  }
}

const evidence = {
  dry_run: dryRun,
  batch_key: BATCH_KEY,
  package_listings: packages.length,
  updated: 0,
  source_rows: 0,
  price_history: 0,
  events: 0,
  price_mismatches: [],
  missing_db: [],
  errors: [],
};

let processed = 0;
for (const { project, listing } of packages) {
  if (processed >= limit) break;
  processed += 1;
  const identity = deriveListingIdentity({
    ...listing,
    project_slug: listing.project_slug || project,
  });
  const verificationStatus = listing.verification_status || "verified";
  const capturedAt =
    listing.source_captured_at || listing.collected_at || null;
  const now = new Date().toISOString();

  const { data: row, error } = await supabase
    .from("properties")
    .select(
      "id,price_thb,verification_status,is_verified_listing,duplicate_fingerprint,source_captured_at,source",
    )
    .eq("external_ref", listing.external_ref)
    .maybeSingle();
  if (error) {
    evidence.errors.push({ ref: listing.external_ref, error: error.message });
    continue;
  }
  if (!row) {
    evidence.missing_db.push(listing.external_ref);
    continue;
  }

  if (Number(row.price_thb) !== Number(listing.price_thb)) {
    evidence.price_mismatches.push({
      ref: listing.external_ref,
      db: row.price_thb,
      pkg: listing.price_thb,
    });
    // Do not overwrite price without evidence review
  }

  const patch = {
    source: identity.source,
    source_listing_id: identity.source_listing_id,
    normalized_source_url: identity.normalized_source_url,
    source_url_hash: identity.source_url_hash,
    duplicate_fingerprint: identity.duplicate_fingerprint,
    soft_match_fingerprint: identity.soft_match_fingerprint,
    source_captured_at: row.source_captured_at || capturedAt,
    verification_status: verificationStatus,
    is_verified_listing: verificationStatus === "verified",
    last_seen_at: capturedAt || now,
    last_verified_at:
      verificationStatus === "verified" ? capturedAt || now : null,
    listing_lifecycle_status: "active",
  };

  if (!dryRun) {
    const { error: uerr } = await supabase
      .from("properties")
      .update(patch)
      .eq("id", row.id);
    if (uerr) {
      evidence.errors.push({ ref: listing.external_ref, error: uerr.message });
      continue;
    }

    // Seed source row
    const sourceRow = {
      property_id: row.id,
      source: identity.source,
      source_listing_id: identity.source_listing_id,
      listing_url: listing.listing_url,
      normalized_source_url: identity.normalized_source_url,
      source_url_hash: identity.source_url_hash,
      listing_type: listing.listing_type,
      price_thb: Number(listing.price_thb),
      verification_status: verificationStatus,
      identity_fingerprint: identity.duplicate_fingerprint,
      soft_match_fingerprint: identity.soft_match_fingerprint,
      last_seen_at: capturedAt || now,
      last_verified_at: capturedAt || now,
      is_primary: true,
      payload: { external_ref: listing.external_ref, project_slug: project },
    };
    const { data: es } = await supabase
      .from("property_listing_sources")
      .select("id")
      .eq("source", identity.source)
      .eq("source_listing_id", identity.source_listing_id)
      .maybeSingle();
    if (es?.id) {
      await supabase
        .from("property_listing_sources")
        .update(sourceRow)
        .eq("id", es.id);
    } else {
      await supabase.from("property_listing_sources").insert(sourceRow);
    }
    evidence.source_rows += 1;

    // Seed price history once if empty for this property
    const { count } = await supabase
      .from("listing_price_history")
      .select("*", { count: "exact", head: true })
      .eq("property_id", row.id);
    if (!count) {
      await supabase.from("listing_price_history").insert({
        property_id: row.id,
        price_thb: Number(listing.price_thb),
        listing_type: listing.listing_type,
        verification_status: verificationStatus,
        source: identity.source,
        listing_url: listing.listing_url,
        observed_at: capturedAt || now,
        note: "wave1_identity_backfill",
      });
      evidence.price_history += 1;
    }

    await supabase.from("listing_verification_events").insert({
      property_id: row.id,
      source: identity.source,
      source_listing_id: identity.source_listing_id,
      event_type: "identity_backfill",
      from_status: row.verification_status,
      to_status: verificationStatus,
      evidence: {
        external_ref: listing.external_ref,
        package_project: project,
        fingerprint: identity.duplicate_fingerprint,
      },
      batch_key: BATCH_KEY,
    });
    evidence.events += 1;
  }
  evidence.updated += 1;
}

const outPath = join(evidenceDir, "backfill-wave1-identity.json");
writeFileSync(outPath, JSON.stringify(evidence, null, 2));
console.log(JSON.stringify({ ...evidence, out: outPath }, null, 2));
