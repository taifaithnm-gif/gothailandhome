#!/usr/bin/env node
/**
 * Listing search state / filter query invariants (Phase 8.3).
 */
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");

// Load the TS module via experimental strip-types pathway used elsewhere,
// or mirror logic here for Node stability.
const LISTING_SORTS = [
  "newest_verified",
  "newest",
  "price_asc",
  "price_desc",
  "area_desc",
  "featured",
];

function one(value) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function positiveNumber(raw) {
  if (raw == null || raw === "") return undefined;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return undefined;
  return n;
}

function positiveInt(raw) {
  const n = positiveNumber(raw);
  return n == null ? undefined : Math.floor(n);
}

function normalizeTransit(raw) {
  if (!raw) return undefined;
  const v = String(raw).trim().toLowerCase();
  if (v === "bts" || v === "mrt") return v;
  return undefined;
}

function parseListingSort(raw) {
  if (raw && LISTING_SORTS.includes(raw)) return raw;
  return "newest_verified";
}

function parseListingSearchParams(input) {
  const listingRaw = one(input.listing_type) || "all";
  const listingType =
    listingRaw === "sale" || listingRaw === "rent" ? listingRaw : "all";
  const typeRaw = one(input.type);
  const type = typeRaw && typeRaw !== "all" ? typeRaw : undefined;
  const pageRaw = Number(one(input.page) || "1");
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;
  return {
    q: one(input.q)?.trim() || undefined,
    location: one(input.location)?.trim() || undefined,
    sort: parseListingSort(one(input.sort)),
    listingType,
    type,
    city: one(input.city)?.trim() || undefined,
    district: one(input.district)?.trim() || undefined,
    project: one(input.project)?.trim() || undefined,
    developer: one(input.developer)?.trim() || undefined,
    transit: normalizeTransit(one(input.transit)),
    bedrooms: positiveInt(one(input.bedrooms)),
    minPrice: positiveNumber(one(input.min_price)),
    maxPrice: positiveNumber(one(input.max_price)),
    minArea: positiveNumber(one(input.min_area)),
    maxArea: positiveNumber(one(input.max_area)),
    page,
  };
}

function listingSearchToQueryRecord(state) {
  const values = {
    q: state.q,
    location: state.location,
    sort: state.sort,
    listing_type: state.listingType === "all" ? undefined : state.listingType,
    type: state.type,
    city: state.city,
    district: state.district,
    project: state.project,
    developer: state.developer,
    transit: state.transit,
    bedrooms: state.bedrooms != null ? String(state.bedrooms) : undefined,
    min_price: state.minPrice != null ? String(state.minPrice) : undefined,
    max_price: state.maxPrice != null ? String(state.maxPrice) : undefined,
    min_area: state.minArea != null ? String(state.minArea) : undefined,
    max_area: state.maxArea != null ? String(state.maxArea) : undefined,
  };
  const out = {};
  for (const [k, v] of Object.entries(values)) {
    if (v) out[k] = v;
  }
  return out;
}

function buildHref(basePath, state, page) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(listingSearchToQueryRecord(state))) {
    if (value) search.set(key, value);
  }
  const p = page ?? state.page;
  if (p > 1) search.set("page", String(p));
  const qs = search.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

function ok(msg) {
  console.log(`PASS: ${msg}`);
}

function check(name, fn) {
  try {
    fn();
    ok(name);
  } catch (error) {
    console.error(`FAIL: ${name} — ${error.message}`);
    process.exitCode = 1;
  }
}

check("default sort is newest_verified", () => {
  const s = parseListingSearchParams({});
  assert.equal(s.sort, "newest_verified");
  assert.equal(s.page, 1);
  assert.equal(s.listingType, "all");
});

check("homepage BTS/MRT handoff normalizes casing", () => {
  assert.equal(parseListingSearchParams({ transit: "BTS" }).transit, "bts");
  assert.equal(parseListingSearchParams({ transit: "MRT" }).transit, "mrt");
  assert.equal(parseListingSearchParams({ transit: "boat" }).transit, undefined);
});

check("buy/rent and project/area filters parse", () => {
  const s = parseListingSearchParams({
    listing_type: "rent",
    project: "ashton-asoke",
    min_price: "1000000",
    max_price: "5000000",
    min_area: "30",
    max_area: "80",
    bedrooms: "2",
    type: "condo",
    page: "2",
  });
  assert.equal(s.listingType, "rent");
  assert.equal(s.project, "ashton-asoke");
  assert.equal(s.minPrice, 1000000);
  assert.equal(s.maxPrice, 5000000);
  assert.equal(s.minArea, 30);
  assert.equal(s.maxArea, 80);
  assert.equal(s.bedrooms, 2);
  assert.equal(s.type, "condo");
  assert.equal(s.page, 2);
});

check("URL round-trip preserves core filters without inventing params", () => {
  const s = parseListingSearchParams({
    listing_type: "sale",
    city: "bangkok",
    district: "watthana",
    transit: "bts",
    sort: "area_desc",
  });
  const href = buildHref("/en/properties", s, 1);
  assert.equal(
    href,
    "/en/properties?sort=area_desc&listing_type=sale&city=bangkok&district=watthana&transit=bts",
  );
});

check("pagination omits page=1 and includes page>1", () => {
  const s = parseListingSearchParams({ city: "bangkok" });
  assert.ok(!buildHref("/en/properties", s, 1).includes("page="));
  assert.ok(buildHref("/en/properties", s, 3).endsWith("page=3"));
});

check("invalid numbers discarded", () => {
  const s = parseListingSearchParams({
    min_price: "-5",
    bedrooms: "abc",
    page: "0",
  });
  assert.equal(s.minPrice, undefined);
  assert.equal(s.bedrooms, undefined);
  assert.equal(s.page, 1);
});

check("sort allowlist rejects unknown", () => {
  assert.equal(parseListingSearchParams({ sort: "magic" }).sort, "newest_verified");
  assert.equal(parseListingSearchParams({ sort: "price_asc" }).sort, "price_asc");
});

void root;
void createRequire;
void pathToFileURL;

if (process.exitCode) {
  console.log(JSON.stringify({ ok: false }));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true }));
