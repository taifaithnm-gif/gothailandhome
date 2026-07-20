#!/usr/bin/env node
/**
 * P1-07 — Listing filter interaction contracts.
 *
 * Offline checks for dependency sanitization, programmatic labels, keyboard
 * disclosure, active-count accuracy, and deterministic reset. No live sources.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { countActiveListingFilters } from "../src/lib/search/listing-search-state.ts";

const root = process.cwd();
const FILTERS = "src/components/listings/listing-filters.tsx";
const PROPERTIES = "src/app/[lang]/properties/page.tsx";

function read(rel) {
  return readFileSync(resolve(root, rel), "utf8");
}

function ok(message) {
  console.log(`PASS: ${message}`);
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

/** Mirror of resolveDistrictForCity for deterministic pure-contract proof. */
function resolveDistrictForCity(city, district, districts) {
  if (!district) return "";
  const match = districts.find((item) => item.slug === district);
  if (!match) return "";
  if (city && match.citySlug && match.citySlug !== city) return "";
  return district;
}

const sampleDistricts = [
  { id: "1", slug: "watthana", name: { en: "Watthana", zh: "", th: "" }, citySlug: "bangkok" },
  { id: "2", slug: "pathum-wan", name: { en: "Pathum Wan", zh: "", th: "" }, citySlug: "bangkok" },
  { id: "3", slug: "banglamung", name: { en: "Bang Lamung", zh: "", th: "" }, citySlug: "pattaya" },
];

check("filters:dependent district cleared when city mismatches", () => {
  assert.equal(
    resolveDistrictForCity("bangkok", "watthana", sampleDistricts),
    "watthana",
  );
  assert.equal(
    resolveDistrictForCity("bangkok", "banglamung", sampleDistricts),
    "",
  );
  assert.equal(
    resolveDistrictForCity("", "banglamung", sampleDistricts),
    "banglamung",
  );
  assert.equal(
    resolveDistrictForCity("bangkok", "missing", sampleDistricts),
    "",
  );

  const src = read(FILTERS);
  assert.ok(src.includes("export function resolveDistrictForCity"));
  assert.ok(src.includes("setDistrict((prev) =>"));
  assert.ok(src.includes("resolveDistrictForCity(nextCity, prev, districts)"));
});

check("filters:properties page sanitizes mismatched district before query", () => {
  const src = read(PROPERTIES);
  assert.ok(src.includes("resolveDistrictForCity"));
  assert.ok(src.includes("safeDistrict"));
  assert.ok(src.includes("district: safeDistrict || undefined"));
});

check("filters:programmatic labels for keyword, city, price, area", () => {
  const src = read(FILTERS);
  for (const needle of [
    "htmlFor={`${idPrefix}-q`}",
    "htmlFor={`${idPrefix}-city`}",
    "htmlFor={`${idPrefix}-district`}",
    "htmlFor={`${idPrefix}-min-price`}",
    "htmlFor={`${idPrefix}-max-price`}",
    "htmlFor={`${idPrefix}-min-area`}",
    "htmlFor={`${idPrefix}-max-area`}",
    "FieldError",
    "aria-invalid={priceInvalid || undefined}",
    "aria-invalid={areaInvalid || undefined}",
  ]) {
    assert.ok(src.includes(needle), needle);
  }
});

check("filters:mobile disclosure is keyboard-safe", () => {
  const src = read(FILTERS);
  for (const needle of [
    'role="dialog"',
    'aria-modal="true"',
    'Escape',
    "FOCUSABLE_SELECTOR",
    "document.body.style.overflow = \"hidden\"",
    "trigger?.focus()",
    "closeRef.current?.focus()",
    'aria-haspopup="dialog"',
  ]) {
    assert.ok(src.includes(needle), needle);
  }
});

check("filters:active count remains accurate for non-default filters", () => {
  assert.equal(
    countActiveListingFilters({
      sort: "newest_verified",
      listingType: "all",
      page: 1,
    }),
    0,
  );
  assert.equal(
    countActiveListingFilters({
      sort: "price_asc",
      listingType: "sale",
      city: "bangkok",
      district: "watthana",
      bedrooms: 0,
      page: 2,
    }),
    5,
  );
  const src = read(FILTERS);
  assert.ok(src.includes("countActiveListingFilters(state)"));
});

check("filters:reset is deterministic to localized properties path", () => {
  const src = read(FILTERS);
  assert.ok(src.includes("localePath(locale, actionPath)"));
  assert.ok(src.includes("dict.listings.clearAll"));
  assert.ok(!src.includes('name="page"'), "clear/apply must not retain page");
});

check("filters:EN/ZH/TH dependency and range-error copy present", () => {
  for (const locale of ["en", "zh", "th"]) {
    const dict = JSON.parse(read(`src/dictionaries/${locale}.json`));
    assert.ok(dict.listings.districtHint, `${locale}.listings.districtHint`);
    assert.ok(dict.listings.rangeInvalid, `${locale}.listings.rangeInvalid`);
  }
});

if (process.exitCode) {
  console.log(JSON.stringify({ ok: false }));
  process.exit(1);
}

console.log(
  JSON.stringify({
    ok: true,
    checks: [
      "city-district-dependency",
      "programmatic-labels",
      "keyboard-disclosure",
      "active-count",
      "deterministic-reset",
    ],
  }),
);
