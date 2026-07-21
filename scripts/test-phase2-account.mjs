#!/usr/bin/env node
/** Phase 2 account contracts — expanded as M1 ships. */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const required = [
  "docs/phase2/m1/P2-010_AUTH_PROVIDER_THREAT_MODEL.md",
  "docs/phase2/m1/P2-011_CUSTOMER_PROFILE_CONTRACT.md",
  "docs/phase2/m1/P2-012_ACCOUNT_DASHBOARD_UX.md",
  "docs/phase2/m1/P2-013_SAVED_ITEMS_SYNC_DESIGN.md",
  "docs/phase2/m1/P2-014_SAVED_SEARCH_CONTRACT.md",
  "docs/phase2/m1/P2-015_ACCOUNT_API_DESIGN.md",
  "src/lib/account/saved-search.ts",
  "src/lib/account/customer.ts",
  "src/lib/auth/customer.ts",
  "src/lib/auth/safe-next.ts",
];

for (const rel of required) {
  assert.ok(fs.existsSync(path.join(root, rel)), `missing ${rel}`);
}

const savedSearch = fs.readFileSync(
  path.join(root, "src/lib/account/saved-search.ts"),
  "utf8",
);
assert.match(savedSearch, /serializeSavedSearchFilters|parseSavedSearchFilters/);

const { parseSavedSearchFilters, serializeSavedSearchFilters } = await import(
  path.join(root, "src/lib/account/saved-search.ts")
);

const roundTrip = parseSavedSearchFilters(
  serializeSavedSearchFilters({
    q: "sukhumvit",
    listingType: "rent",
    district: "khlong-toei",
    minPrice: 20000,
    maxPrice: 50000,
    bedrooms: 1,
    page: 1,
    sort: "newest",
  }),
);
assert.equal(roundTrip.q, "sukhumvit");
assert.equal(roundTrip.listingType, "rent");
assert.equal(roundTrip.district, "khlong-toei");
assert.equal(roundTrip.minPrice, 20000);
assert.equal(roundTrip.bedrooms, 1);

const safeNext = await import(path.join(root, "src/lib/auth/safe-next.ts"));
assert.equal(safeNext.sanitizeNextPath("/en/account", "/admin"), "/en/account");
assert.equal(safeNext.sanitizeNextPath("https://evil.example", "/en"), "/en");
assert.equal(safeNext.sanitizeNextPath("//evil.example", "/en"), "/en");

console.log("PASS: phase2 account contracts + saved-search round-trip + safe next");
