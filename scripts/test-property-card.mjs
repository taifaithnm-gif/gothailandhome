#!/usr/bin/env node
/**
 * P1-09 — Property card decision-information contracts.
 *
 * Offline checks: sourced-only fields, honest missing values, unique
 * accessible names, responsive layout affordances, and no first-page
 * catalog-size increase. No live property sources.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  cardLocationLabel,
  cardMediaAlt,
  cardProjectLabel,
  cardTransitLabels,
  displayCardValue,
  formatCardArea,
  formatCardBedrooms,
  isSourcedPrice,
  sourcedText,
} from "../src/lib/property/property-card-model.ts";

const root = process.cwd();

const FILES = {
  card: "src/components/property/property-card.tsx",
  media: "src/components/property/listing-media-frame.tsx",
  grid: "src/components/property/property-grid.tsx",
  mapper: "src/lib/data/properties.ts",
  model: "src/lib/property/property-card-model.ts",
  home: "src/app/[lang]/page.tsx",
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

check("card:required files exist", () => {
  for (const file of Object.values(FILES)) {
    assert.ok(existsSync(resolve(root, file)), file);
  }
});

check("card:model keeps missing values honest", () => {
  assert.equal(sourcedText("  "), null);
  assert.equal(sourcedText("Watthana"), "Watthana");
  assert.equal(displayCardValue(null, "Unknown"), "Unknown");
  assert.equal(displayCardValue("", "Unknown"), "Unknown");
  assert.equal(displayCardValue(2, "Unknown"), "2");
  assert.equal(formatCardBedrooms(null, "Studio", "Unknown"), "Unknown");
  assert.equal(formatCardBedrooms(0, "Studio", "Unknown"), "Studio");
  assert.equal(formatCardBedrooms(2, "Studio", "Unknown"), "2");
  assert.equal(formatCardArea(null, null, "sqm", "Unknown"), "Unknown");
  assert.equal(formatCardArea(45, null, "sqm", "Unknown"), "45 sqm");
  assert.equal(formatCardArea(null, 120, "sqm", "Unknown"), "120 sqm");
  assert.equal(isSourcedPrice(0), false);
  assert.equal(isSourcedPrice(Number.NaN), false);
  assert.equal(isSourcedPrice(3_500_000), true);
});

check("card:model surfaces only sourced location/project/transit", () => {
  assert.equal(
    cardLocationLabel(
      { en: "Watthana", zh: "", th: "" },
      { en: "Bangkok", zh: "", th: "" },
      "en",
    ),
    "Watthana",
  );
  assert.equal(
    cardLocationLabel(
      { en: "", zh: "", th: "" },
      { en: "Bangkok", zh: "", th: "" },
      "en",
    ),
    "Bangkok",
  );
  assert.equal(
    cardLocationLabel({ en: "", zh: "", th: "" }, { en: "", zh: "", th: "" }, "en"),
    null,
  );
  assert.equal(
    cardProjectLabel(null, { en: "Fake", zh: "", th: "" }, "en"),
    null,
  );
  assert.equal(
    cardProjectLabel("asoke-place", { en: "Asoke Place", zh: "", th: "" }, "en"),
    "Asoke Place",
  );
  assert.deepEqual(cardTransitLabels(["bts", "mrt"], { bts: "BTS", mrt: "MRT" }), [
    "BTS",
    "MRT",
  ]);
  assert.deepEqual(cardTransitLabels([], { bts: "BTS", mrt: "MRT" }), []);
  assert.equal(
    cardMediaAlt("Riverside Condo", "Condo", "Watthana"),
    "Riverside Condo · Condo · Watthana",
  );
});

check("card:component shows evidence-backed decision fields only", () => {
  const src = read(FILES.card);
  for (const needle of [
    "isSourcedPrice",
    "formatCardBedrooms",
    "formatCardArea",
    "cardLocationLabel",
    "cardProjectLabel",
    "cardTransitLabels",
    "dict.property.unknown",
    "verifiedLabel",
    "aria-label={viewLabel}",
    "aria-label={helpLabel}",
    "alt={mediaAlt}",
    "min-h-11",
    "dict.common.price",
  ]) {
    assert.ok(src.includes(needle), needle);
  }
  assert.ok(!src.includes('?? "—"'), "does not use opaque em-dash for missing");
  assert.ok(
    src.includes("property.isVerifiedListing"),
    "verified badge only when sourced",
  );
  assert.ok(
    src.includes("showSource={Boolean(property.coverUrl && property.source)}"),
    "image source only when media+source exist",
  );
});

check("card:media frame accepts unique alt without inventing imagery", () => {
  const media = read(FILES.media);
  assert.ok(media.includes("alt?: string"));
  assert.ok(media.includes("const imageAlt = alt?.trim() || title"));
  assert.ok(media.includes("Images unavailable") || media.includes("imagesUnavailable"));
  assert.ok(media.includes("Never uses fake interiors"));
});

check("card:mapper does not invent cover or project names", () => {
  const mapper = read(FILES.mapper);
  assert.ok(mapper.includes("export function mapProperty"));
  assert.ok(mapper.includes("media.find((item) => item.is_cover)"));
  assert.ok(mapper.includes("emptyI18n()"));
  assert.ok(mapper.includes("lastVerifiedAt: row.last_verified_at ?? null"));
  assert.ok(mapper.includes("isVerifiedListing: Boolean(row.is_verified_listing)"));
  assert.ok(!mapper.includes("fake"), "no fake media paths in mapper");
});

check("card:layout works at matrix widths without raising catalog size", () => {
  const card = read(FILES.card);
  const grid = read(FILES.grid);
  const home = read(FILES.home);
  const properties = read("src/lib/data/properties.ts");

  assert.ok(card.includes("sm:flex-row sm:items-center sm:justify-between"));
  assert.ok(card.includes("grid grid-cols-3"));
  assert.ok(card.includes("min-w-0"));
  assert.ok(grid.includes("sm:grid-cols-2 xl:grid-cols-3"));
  assert.ok(grid.includes("imagePriorityCount"));
  assert.ok(home.includes("listings: 6"), "homepage featured bound unchanged");
  assert.ok(
    properties.includes("DEFAULT_LISTING_PAGE_SIZE = 24"),
    "properties page size unchanged",
  );
  assert.ok(
    !card.includes("pageSize"),
    "card itself does not change catalog paging",
  );
});

if (process.exitCode) {
  console.log(JSON.stringify({ ok: false }));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true }));
