#!/usr/bin/env node
/**
 * P1-06 — Canonical listing search/filter URL contracts.
 *
 * Imports the production parser/serializer directly. No mirrored test logic,
 * browser, network, database, or property source is used.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  buildListingFilterHref,
  buildListingSearchHref,
  LISTING_SORTS,
  parseListingSearchParams,
  PROPERTY_TYPES,
  toListingFilterValues,
} from "../src/lib/search/listing-search-state.ts";

const root = process.cwd();

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

check("contract:defaults are stable and omitted from canonical URL", () => {
  const state = parseListingSearchParams({});
  assert.equal(state.sort, "newest_verified");
  assert.equal(state.page, 1);
  assert.equal(state.listingType, "all");
  assert.equal(buildListingSearchHref("/en/properties", state), "/en/properties");
});

check("contract:every supported sort round-trips", () => {
  for (const sort of LISTING_SORTS) {
    const parsed = parseListingSearchParams({ sort });
    const href = buildListingSearchHref("/en/properties", parsed, 1);
    const query = Object.fromEntries(new URL(href, "https://example.test").searchParams);
    const reparsed = parseListingSearchParams(query);
    assert.equal(reparsed.sort, sort, sort);
  }
});

check("contract:every supported property type round-trips", () => {
  for (const type of PROPERTY_TYPES) {
    const parsed = parseListingSearchParams({ type });
    const href = buildListingSearchHref("/th/properties", parsed, 1);
    const query = Object.fromEntries(new URL(href, "https://example.test").searchParams);
    assert.equal(parseListingSearchParams(query).type, type, type);
  }
});

check("contract:all supported filters round-trip deterministically", () => {
  const raw = {
    q: "  BTS   condo  ",
    location: "  Asoke  ",
    sort: "area_desc",
    listing_type: "rent",
    type: "condo",
    city: "Bangkok",
    district: "Watthana",
    project: "Ashton-Asoke",
    developer: "Ananda-Development",
    transit: "BTS",
    bedrooms: "2",
    min_price: "15000.5",
    max_price: "50000",
    min_area: "30.5",
    max_area: "80",
    page: "4",
  };
  const parsed = parseListingSearchParams(raw);
  const href = buildListingSearchHref("/zh/properties", parsed);

  assert.equal(
    href,
    "/zh/properties?q=BTS+condo&location=Asoke&sort=area_desc&listing_type=rent&type=condo&city=bangkok&district=watthana&project=ashton-asoke&developer=ananda-development&transit=bts&bedrooms=2&min_price=15000.5&max_price=50000&min_area=30.5&max_area=80&page=4",
  );

  const url = new URL(href, "https://example.test");
  const reparsed = parseListingSearchParams(Object.fromEntries(url.searchParams));
  assert.deepEqual(reparsed, parsed);
  assert.equal(
    buildListingSearchHref("/zh/properties", reparsed),
    href,
    "serialize(parse(serialize(state))) must be stable",
  );
});

check("contract:invalid values fail safely", () => {
  const state = parseListingSearchParams({
    sort: "magic",
    listing_type: "lease",
    type: "castle",
    city: "../bangkok",
    district: "bad/slash",
    project: "x".repeat(121),
    developer: "space slug",
    transit: "boat",
    bedrooms: "2.5",
    min_price: "-5",
    max_price: "1e9",
    min_area: "0x10",
    max_area: "NaN",
    page: "3.7",
  });

  assert.equal(state.sort, "newest_verified");
  assert.equal(state.listingType, "all");
  assert.equal(state.type, undefined);
  assert.equal(state.city, undefined);
  assert.equal(state.district, undefined);
  assert.equal(state.project, undefined);
  assert.equal(state.developer, undefined);
  assert.equal(state.transit, undefined);
  assert.equal(state.bedrooms, undefined);
  assert.equal(state.minPrice, undefined);
  assert.equal(state.maxPrice, undefined);
  assert.equal(state.minArea, undefined);
  assert.equal(state.maxArea, undefined);
  assert.equal(state.page, 1);
  assert.equal(buildListingSearchHref("/en/properties", state), "/en/properties");
});

check("contract:zero values remain valid where supported", () => {
  const state = parseListingSearchParams({
    bedrooms: "0",
    min_price: "0",
    min_area: "0",
  });
  assert.equal(state.bedrooms, 0);
  assert.equal(state.minPrice, 0);
  assert.equal(state.minArea, 0);
  assert.equal(
    buildListingSearchHref("/en/properties", state),
    "/en/properties?bedrooms=0&min_price=0&min_area=0",
  );
});

check("contract:inverted numeric ranges fail safely", () => {
  const state = parseListingSearchParams({
    min_price: "5000000",
    max_price: "1000000",
    min_area: "80",
    max_area: "30",
  });
  assert.equal(state.minPrice, undefined);
  assert.equal(state.maxPrice, undefined);
  assert.equal(state.minArea, undefined);
  assert.equal(state.maxArea, undefined);
  assert.equal(buildListingSearchHref("/en/properties", state), "/en/properties");
});

check("contract:duplicate params use first value deterministically", () => {
  const state = parseListingSearchParams({
    city: ["bangkok", "phuket"],
    listing_type: ["sale", "rent"],
    page: ["2", "9"],
  });
  assert.equal(state.city, "bangkok");
  assert.equal(state.listingType, "sale");
  assert.equal(state.page, 2);
});

check("contract:unknown params are ignored and never serialized", () => {
  const state = parseListingSearchParams({
    city: "bangkok",
    unknown: "keep-me-out",
    utm_source: "test",
    admin: "true",
  });
  const href = buildListingSearchHref("/en/properties", state, 1);
  assert.equal(href, "/en/properties?city=bangkok");
  assert.ok(!href.includes("unknown"));
  assert.ok(!href.includes("utm_source"));
  assert.ok(!href.includes("admin"));
});

check("contract:filter changes reset page to one", () => {
  const state = parseListingSearchParams({
    city: "bangkok",
    listing_type: "sale",
    page: "8",
  });
  assert.equal(state.page, 8);
  assert.equal(
    buildListingFilterHref("/en/properties", state),
    "/en/properties?listing_type=sale&city=bangkok",
  );
  assert.ok(!buildListingFilterHref("/en/properties", state).includes("page="));

  const filters = read("src/components/listings/listing-filters.tsx");
  assert.ok(!filters.includes('name="page"'), "GET filter form must not retain page");
});

check("contract:pagination omits page=1 and includes page>1", () => {
  const state = parseListingSearchParams({ city: "bangkok" });
  assert.equal(
    buildListingSearchHref("/en/properties", state, 1),
    "/en/properties?city=bangkok",
  );
  assert.equal(
    buildListingSearchHref("/en/properties", state, 3),
    "/en/properties?city=bangkok&page=3",
  );
});

check("contract:localized base paths are preserved", () => {
  const state = parseListingSearchParams({
    listing_type: "sale",
    district: "watthana",
  });
  for (const locale of ["en", "zh", "th"]) {
    assert.equal(
      buildListingSearchHref(`/${locale}/properties`, state, 1),
      `/${locale}/properties?listing_type=sale&district=watthana`,
    );
  }

  const searchRoute = read("src/app/[lang]/search/page.tsx");
  assert.ok(
    searchRoute.includes('localePath(lang, "/properties")'),
    "search redirect retains locale",
  );
  assert.ok(
    searchRoute.includes("buildListingSearchHref"),
    "search redirect uses canonical serializer",
  );
});

check("contract:form defaults derive from parsed canonical state", () => {
  const state = parseListingSearchParams({
    sort: "price_desc",
    listing_type: "rent",
    bedrooms: "0",
    min_area: "30.50",
  });
  assert.deepEqual(toListingFilterValues(state), {
    q: undefined,
    location: undefined,
    sort: "price_desc",
    listing_type: "rent",
    type: undefined,
    city: undefined,
    district: undefined,
    project: undefined,
    developer: undefined,
    transit: undefined,
    bedrooms: "0",
    min_price: undefined,
    max_price: undefined,
    min_area: "30.5",
    max_area: undefined,
  });
});

if (process.exitCode) {
  console.log(JSON.stringify({ ok: false }));
  process.exit(1);
}

console.log(
  JSON.stringify({
    ok: true,
    sorts: LISTING_SORTS.length,
    propertyTypes: PROPERTY_TYPES.length,
    checks: [
      "round-trip",
      "invalid-safe",
      "unknown-ignored",
      "page-reset",
      "localized-path",
    ],
  }),
);
