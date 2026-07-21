#!/usr/bin/env node
/**
 * Phase 2C — Map contracts (P2-050–055).
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const {
  parseBboxParam,
  stripBboxForCanonical,
  parseMapSearchParams,
  MAP_PERF_BUDGET,
  MAP_PROVIDER,
} = await import(path.join(root, "src/lib/map/bbox.ts"));

assert.equal(MAP_PROVIDER.id, "openstreetmap");
assert.equal(MAP_PERF_BUDGET.maxPinsPerRequest, 80);

assert.equal(parseBboxParam("13.7,100.4,13.8,100.5")?.south, 13.7);
assert.equal(parseBboxParam("13.8,100.4,13.7,100.5"), null); // inverted
assert.equal(parseBboxParam("13.0,100.0,14.0,101.0"), null); // span too large

const filters = parseMapSearchParams({
  bbox: "13.7,100.4,13.8,100.5",
  district: "sukhumvit",
  listing_type: "sale",
});
const canonical = stripBboxForCanonical(filters);
assert.equal(canonical.bbox, undefined);
assert.equal(canonical.district, "sukhumvit");

const mapPage = fs.readFileSync(
  path.join(root, "src/app/[lang]/map/page.tsx"),
  "utf8",
);
assert.match(mapPage, /isPhase2MapEnabled/);
assert.match(mapPage, /searchMapListings/);
assert.match(mapPage, /dict\.map/);

const search = fs.readFileSync(
  path.join(root, "src/lib/map/search.ts"),
  "utf8",
);
assert.match(search, /coordinateSource: "project"/);
assert.match(search, /unmappedCount/);

const policy = fs.readFileSync(
  path.join(root, "docs/phase2/m5/P2-050_MAP_PROVIDER_POLICY.md"),
  "utf8",
);
assert.match(policy, /OpenStreetMap/);

console.log("PASS: phase2 map contracts");
