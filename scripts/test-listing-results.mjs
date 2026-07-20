#!/usr/bin/env node
/**
 * P1-08 — Listing results, sorting, pagination, and empty-state contracts.
 *
 * Offline checks: summary reflects filters/sort/page; page=1 omitted;
 * pagination preserves filters and targets #listing-results; empty-state
 * offers reset/navigation; focus landmarks exist. No live sources.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { buildListingPaginationHref } from "../src/lib/search/listing-pagination-href.ts";
import {
  countActiveListingFilters,
  listingSearchToQueryRecord,
  parseListingSearchParams,
} from "../src/lib/search/listing-search-state.ts";

const root = process.cwd();

const FILES = {
  properties: "src/app/[lang]/properties/page.tsx",
  chrome: "src/components/listings/search-results-chrome.tsx",
  pagination: "src/components/listings/listing-pagination.tsx",
  region: "src/components/listings/listing-results-region.tsx",
  states: "src/components/ui/states.tsx",
  en: "src/dictionaries/en.json",
  zh: "src/dictionaries/zh.json",
  th: "src/dictionaries/th.json",
};

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

check("results:required files exist", () => {
  for (const file of Object.values(FILES)) {
    assert.ok(existsSync(resolve(root, file)), file);
  }
});

check("results:summary reflects filters, non-default sort, and page>1", () => {
  const chrome = read(FILES.chrome);
  assert.ok(chrome.includes("state.sort !== \"newest_verified\""));
  assert.ok(chrome.includes("state.page > 1"));
  assert.ok(chrome.includes("dict.search.pageLabel"));
  assert.ok(chrome.includes("sortLabel"));
  assert.ok(chrome.includes("f.sortFeatured"));
  assert.ok(chrome.includes("countActiveListingFilters"));
  assert.ok(chrome.includes("dict.properties.resultCount"));

  const state = parseListingSearchParams({
    city: "bangkok",
    sort: "price_asc",
    page: "3",
    listing_type: "sale",
  });
  assert.equal(state.sort, "price_asc");
  assert.equal(state.page, 3);
  assert.ok(countActiveListingFilters(state) >= 2);
});

check("results:canonical first page omits page=1", () => {
  const href = buildListingPaginationHref(
    "en",
    "/properties",
    { city: "bangkok", sort: "newest" },
    1,
  );
  assert.equal(href, "/en/properties?city=bangkok&sort=newest#listing-results");
  assert.ok(!href.includes("page="));

  const page3 = buildListingPaginationHref(
    "zh",
    "/properties",
    { city: "bangkok", q: "asoke" },
    3,
  );
  assert.equal(
    page3,
    "/zh/properties?city=bangkok&q=asoke&page=3#listing-results",
  );
});

check("results:pagination preserves valid filters and results hash", () => {
  const pagination = read(FILES.pagination);
  assert.ok(pagination.includes("buildListingPaginationHref"));
  assert.ok(pagination.includes("LISTING_RESULTS_HASH"));
  assert.ok(pagination.includes("aria-label={dict.search.paginationLabel}"));
  assert.ok(pagination.includes('aria-current="page"'));
  assert.ok(pagination.includes("if (total === 0 || totalPages <= 0)"));

  const hrefModule = read("src/lib/search/listing-pagination-href.ts");
  assert.ok(hrefModule.includes("export function buildListingPaginationHref"));
  assert.ok(hrefModule.includes('#listing-results"'));
  assert.ok(hrefModule.includes('if (page > 1) search.set("page"'));

  const state = parseListingSearchParams({
    city: "bangkok",
    district: "watthana",
    sort: "price_desc",
    min_price: "1000000",
    page: "2",
  });
  const params = listingSearchToQueryRecord(state);
  assert.equal(params.page, undefined);
  assert.equal(params.city, "bangkok");
  assert.equal(params.district, "watthana");
  assert.equal(params.sort, "price_desc");
  assert.equal(params.min_price, "1000000");

  const href = buildListingPaginationHref("th", "/properties", params, 2);
  assert.ok(href.includes("city=bangkok"));
  assert.ok(href.includes("district=watthana"));
  assert.ok(href.includes("sort=price_desc"));
  assert.ok(href.includes("min_price=1000000"));
  assert.ok(href.includes("page=2"));
  assert.ok(href.endsWith("#listing-results"));
});

check("results:empty-state offers clear, bangkok, buy, and rent navigation", () => {
  const page = read(FILES.properties);
  assert.ok(page.includes("dict.properties.noResultsClear"));
  assert.ok(page.includes("dict.properties.noResultsBrowse"));
  assert.ok(page.includes("dict.properties.noResultsBuy"));
  assert.ok(page.includes("dict.properties.noResultsRent"));
  assert.ok(page.includes('localePath(lang, "/buy")'));
  assert.ok(page.includes('localePath(lang, "/rent")'));
  assert.ok(page.includes("?city=bangkok"));
  assert.ok(page.includes("focusTitle"));
  assert.ok(page.includes("ListingResultsRegion"));
  assert.ok(page.includes("resultsHeading"));
});

check("results:focus moves to listing-results landmark after pagination", () => {
  const region = read(FILES.region);
  assert.ok(region.includes('id="listing-results"'));
  assert.ok(region.includes("tabIndex={-1}"));
  assert.ok(region.includes('window.location.hash !== "#listing-results"'));
  assert.ok(region.includes("ref.current?.focus"));

  const states = read(FILES.states);
  assert.ok(states.includes("focusTitle"));
  assert.ok(states.includes("useFocusTitle"));
  assert.ok(states.includes('role="status"'));
  assert.ok(states.includes('aria-live="polite"'));
});

check("results:dictionaries expose summary/pagination/empty keys", () => {
  for (const locale of [FILES.en, FILES.zh, FILES.th]) {
    const dict = JSON.parse(read(locale));
    assert.ok(dict.listings.sortFeatured, locale);
    assert.ok(dict.search.pageLabel, locale);
    assert.ok(dict.search.paginationLabel, locale);
    assert.ok(dict.properties.resultsHeading, locale);
    assert.ok(dict.properties.noResultsBuy, locale);
    assert.ok(dict.properties.noResultsRent, locale);
  }
});

check("results:properties page keeps district sanitization from P1-07", () => {
  const page = read(FILES.properties);
  assert.ok(page.includes("resolveDistrictForCity"));
  assert.ok(page.includes("safeDistrict"));
  assert.ok(page.includes("district: safeDistrict || undefined"));
});

if (process.exitCode) {
  console.log(JSON.stringify({ ok: false }));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true }));
