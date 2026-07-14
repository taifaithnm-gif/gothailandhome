#!/usr/bin/env node
/**
 * Soft-match Hipflat ↔ PropertyHub and LivingInsider.
 * NEVER auto-merges. Inserts open listing_duplicate_candidates when DB ids exist.
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { softMatchFingerprint } from "./lib/listing-identity.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
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

function loadListings(fileName, sourceHint) {
  const out = [];
  for (const d of readdirSync(join(ROOT, "content/projects"))) {
    const f = join(ROOT, "content/projects", d, fileName);
    if (!existsSync(f)) continue;
    for (const x of JSON.parse(readFileSync(f, "utf8")).listings || []) {
      out.push({
        ...x,
        project_slug: x.project_slug || d,
        soft:
          x.soft_match_fingerprint ||
          softMatchFingerprint({
            projectSlug: x.project_slug || d,
            listingType: x.listing_type,
            bedrooms: x.bedrooms,
            areaSqm: x.area_sqm,
            floorLabel: x.floor_label,
          }),
        _source: sourceHint,
      });
    }
  }
  return out;
}

const hf = loadListings("listings-hipflat.json", "hipflat");
const ph = loadListings("listings.json", "propertyhub");
const li = loadListings("listings-livinginsider.json", "livinginsider");

function indexBySoft(list) {
  const m = new Map();
  for (const x of list) {
    if (!x.soft) continue;
    if (!m.has(x.soft)) m.set(x.soft, []);
    m.get(x.soft).push(x);
  }
  return m;
}
const phBySoft = indexBySoft(ph);
const liBySoft = indexBySoft(li);

const candidates = [];
for (const h of hf) {
  for (const phHit of phBySoft.get(h.soft) || []) {
    candidates.push({
      match_reason: "cross_source_soft_match",
      against: "propertyhub",
      confidence: 0.55,
      hipflat: {
        external_ref: h.external_ref,
        source_listing_id: h.source_listing_id,
        listing_url: h.listing_url,
        price_thb: h.price_thb,
        project_slug: h.project_slug,
      },
      other: {
        source: "propertyhub",
        external_ref: phHit.external_ref,
        source_listing_id: phHit.source_listing_id,
        listing_url: phHit.listing_url,
        price_thb: phHit.price_thb,
        project_slug: phHit.project_slug,
      },
      soft_match_fingerprint: h.soft,
      note: "candidate only — never auto-merge",
    });
  }
  for (const liHit of liBySoft.get(h.soft) || []) {
    candidates.push({
      match_reason: "cross_source_soft_match",
      against: "livinginsider",
      confidence: 0.55,
      hipflat: {
        external_ref: h.external_ref,
        source_listing_id: h.source_listing_id,
        listing_url: h.listing_url,
        price_thb: h.price_thb,
        project_slug: h.project_slug,
      },
      other: {
        source: "livinginsider",
        external_ref: liHit.external_ref,
        source_listing_id: liHit.source_listing_id,
        listing_url: liHit.listing_url,
        price_thb: liHit.price_thb,
        project_slug: liHit.project_slug,
      },
      soft_match_fingerprint: h.soft,
      note: "candidate only — never auto-merge",
    });
  }
}

const report = {
  generated_at: new Date().toISOString(),
  hipflat_listings: hf.length,
  propertyhub_listings: ph.length,
  livinginsider_listings: li.length,
  candidate_pairs: candidates.length,
  candidates: candidates.slice(0, 500),
};

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

let inserted = 0;
let skipped = 0;
for (const c of candidates) {
  const { data: a } = await admin
    .from("properties")
    .select("id")
    .eq("external_ref", c.hipflat.external_ref)
    .eq("source", "hipflat")
    .maybeSingle();
  const { data: b } = await admin
    .from("properties")
    .select("id")
    .eq("external_ref", c.other.external_ref)
    .eq("source", c.other.source)
    .maybeSingle();
  if (!a?.id || !b?.id) {
    skipped += 1;
    continue;
  }
  const [idA, idB] = a.id < b.id ? [a.id, b.id] : [b.id, a.id];
  const { error } = await admin.from("listing_duplicate_candidates").insert({
    property_id_a: idA,
    property_id_b: idB,
    match_reason: `cross_source_soft_match_hipflat_${c.against}`,
    confidence: 0.55,
    evidence: c,
    status: "open",
  });
  if (error) skipped += 1;
  else inserted += 1;
}

const out = { ...report, db_inserted: inserted, db_skipped: skipped };
writeFileSync(
  join(OUT, "cross-source-soft-matches.json"),
  JSON.stringify(out, null, 2),
);
console.log(
  JSON.stringify(
    {
      hipflat_listings: hf.length,
      propertyhub_listings: ph.length,
      livinginsider_listings: li.length,
      candidate_pairs: candidates.length,
      db_inserted: inserted,
      db_skipped: skipped,
    },
    null,
    2,
  ),
);
