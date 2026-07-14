#!/usr/bin/env node
/**
 * Detect LivingInsider ↔ PropertyHub soft-match candidates.
 * NEVER auto-merges. Inserts open rows into listing_duplicate_candidates.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { softMatchFingerprint } from "./lib/listing-identity.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = join(ROOT, "pipelines/factory/livinginsider/_runs");
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

const liListings = [];
const phListings = [];
for (const d of readdirSync(join(ROOT, "content/projects"))) {
  const li = join(ROOT, "content/projects", d, "listings-livinginsider.json");
  const ph = join(ROOT, "content/projects", d, "listings.json");
  if (existsSync(li)) {
    for (const x of JSON.parse(readFileSync(li, "utf8")).listings || []) {
      liListings.push({
        ...x,
        soft:
          x.soft_match_fingerprint ||
          softMatchFingerprint({
            projectSlug: x.project_slug || d,
            listingType: x.listing_type,
            bedrooms: x.bedrooms,
            areaSqm: x.area_sqm,
            floorLabel: x.floor_label,
          }),
      });
    }
  }
  if (existsSync(ph)) {
    for (const x of JSON.parse(readFileSync(ph, "utf8")).listings || []) {
      phListings.push({
        ...x,
        soft:
          x.soft_match_fingerprint ||
          softMatchFingerprint({
            projectSlug: x.project_slug || d,
            listingType: x.listing_type,
            bedrooms: x.bedrooms,
            areaSqm: x.area_sqm,
            floorLabel: x.floor_label,
          }),
      });
    }
  }
}

const phBySoft = new Map();
for (const p of phListings) {
  if (!p.soft) continue;
  if (!phBySoft.has(p.soft)) phBySoft.set(p.soft, []);
  phBySoft.get(p.soft).push(p);
}

const candidates = [];
for (const li of liListings) {
  const hits = phBySoft.get(li.soft) || [];
  for (const ph of hits) {
    candidates.push({
      match_reason: "cross_source_soft_match",
      confidence: 0.55,
      livinginsider: {
        external_ref: li.external_ref,
        source_listing_id: li.source_listing_id,
        listing_url: li.listing_url,
        price_thb: li.price_thb,
        project_slug: li.project_slug,
      },
      propertyhub: {
        external_ref: ph.external_ref,
        source_listing_id: ph.source_listing_id,
        listing_url: ph.listing_url,
        price_thb: ph.price_thb,
        project_slug: ph.project_slug,
      },
      soft_match_fingerprint: li.soft,
      note: "candidate only — never auto-merge",
    });
  }
}

const report = {
  generated_at: new Date().toISOString(),
  livinginsider_listings: liListings.length,
  propertyhub_listings: phListings.length,
  candidate_pairs: candidates.length,
  candidates: candidates.slice(0, 500),
};

writeFileSync(
  join(OUT, "cross-source-soft-matches.json"),
  JSON.stringify(report, null, 2),
);

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

// Ensure livinginsider priority exists (additive)
await admin.from("listing_source_priority").upsert(
  {
    source: "livinginsider",
    priority: 25,
    notes: "LivingInsider adapter — below official, near PropertyHub",
  },
  { onConflict: "source" },
);

let inserted = 0;
let skipped = 0;
for (const c of candidates) {
  const { data: a } = await admin
    .from("properties")
    .select("id")
    .eq("external_ref", c.livinginsider.external_ref)
    .maybeSingle();
  const { data: b } = await admin
    .from("properties")
    .select("id")
    .eq("external_ref", c.propertyhub.external_ref)
    .maybeSingle();
  if (!a?.id || !b?.id) {
    skipped += 1;
    continue;
  }
  const [idA, idB] = a.id < b.id ? [a.id, b.id] : [b.id, a.id];
  const { error } = await admin.from("listing_duplicate_candidates").insert({
    property_id_a: idA,
    property_id_b: idB,
    match_reason: "cross_source_soft_match",
    confidence: 0.55,
    evidence: c,
    status: "open",
  });
  if (error) {
    if (String(error.code) === "23505" || /duplicate/i.test(error.message))
      skipped += 1;
    else skipped += 1;
  } else inserted += 1;
}

const out = {
  ...report,
  db_inserted: inserted,
  db_skipped: skipped,
};
writeFileSync(join(OUT, "cross-source-soft-matches.json"), JSON.stringify(out, null, 2));
console.log(
  JSON.stringify(
    {
      livinginsider_listings: liListings.length,
      propertyhub_listings: phListings.length,
      candidate_pairs: candidates.length,
      db_inserted: inserted,
      db_skipped: skipped,
    },
    null,
    2,
  ),
);
