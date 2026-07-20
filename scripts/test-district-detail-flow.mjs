#!/usr/bin/env node
/**
 * P1-14 — District detail discovery flow contracts.
 *
 * Offline checks: available facts only, honest empty amenities, bounded
 * project/listing previews, locale-preserving links, metadata/schema.
 * No live property sources / Windows01.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();

const FILES = {
  center: "src/components/district/district-center.tsx",
  page: "src/app/[lang]/districts/[slug]/page.tsx",
  package: "src/lib/districts/package.ts",
  schema: "src/lib/seo/schema.ts",
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

check("district-detail:required files exist", () => {
  for (const file of Object.values(FILES)) {
    assert.ok(existsSync(resolve(root, file)), file);
  }
});

check("district-detail:only available district facts render", () => {
  const center = read(FILES.center);
  assert.ok(center.includes("overviewFacts"));
  assert.ok(center.includes("if (pkg.postalCode)"));
  assert.ok(center.includes("if (pkg.districtCode != null)"));
  assert.ok(center.includes("if (pkg.khwaengCount != null)"));
  assert.ok(center.includes("coordsOk"));
  // Do not invent lifestyle content.
  assert.ok(center.includes("lifestyleMissing"));
  assert.ok(center.includes("knowledgeFallback"));
});

check("district-detail:empty amenities remain honest", () => {
  const center = read(FILES.center);
  const pkg = read(FILES.package);
  assert.ok(pkg.includes("never invent"));
  assert.ok(pkg.includes("normalizeAmenities"));
  assert.ok(center.includes("amenitiesEmpty"));
  assert.ok(center.includes("schoolsNote"));
  assert.ok(center.includes("hospitalsNote"));
  assert.ok(center.includes("shoppingNote"));
  assert.ok(center.includes("EmptyState"));
  assert.ok(center.includes("transitMissing"));
  assert.ok(center.includes("lifestyleMissing"));
});

check("district-detail:project and listing previews remain bounded", () => {
  const center = read(FILES.center);
  const page = read(FILES.page);
  const pkg = read(FILES.package);
  assert.match(pkg, /DISTRICT_PROJECT_PREVIEW_SIZE\s*=\s*6/);
  assert.match(pkg, /DISTRICT_LISTING_PREVIEW_SIZE\s*=\s*12/);
  assert.ok(center.includes("projects.slice(0, DISTRICT_PROJECT_PREVIEW_SIZE)"));
  assert.ok(center.includes("listings.slice(0, DISTRICT_LISTING_PREVIEW_SIZE)"));
  assert.ok(page.includes("DISTRICT_LISTING_PREVIEW_SIZE"));
  assert.ok(page.includes("pageSize: DISTRICT_LISTING_PREVIEW_SIZE"));
});

check("district-detail:links preserve locale", () => {
  const center = read(FILES.center);
  assert.ok(center.includes("localePath(locale, `/projects/${project.slug}`)"));
  assert.ok(center.includes("localePath(locale, `/cities/${district.citySlug}`)"));
  assert.ok(center.includes('localePath(locale, "/find-my-home")'));
  assert.ok(center.includes('localePath(locale, "/knowledge")'));
  assert.ok(
    center.includes('localePath(locale, "/knowledge/bangkok-districts")'),
  );
  assert.ok(center.includes('localePath(locale, "/knowledge/glossary")'));
  assert.ok(center.includes("`/properties?district=${encodeURIComponent(district.slug)}`"));
  assert.ok(center.includes('data-slot="district-knowledge-links"'));
  assert.ok(center.includes("amenitySource"));
});

check("district-detail:metadata and schema wiring", () => {
  const page = read(FILES.page);
  const schema = read(FILES.schema);
  assert.ok(page.includes("buildPageMetadata"));
  assert.ok(page.includes("districtSchema"));
  assert.ok(page.includes("breadcrumbListSchema"));
  assert.ok(page.includes("JsonLd"));
  assert.ok(schema.includes("export function districtSchema"));
});

check("district-detail:section nav discovery anchors", () => {
  const center = read(FILES.center);
  assert.ok(center.includes('data-slot="district-section-nav"'));
  assert.ok(center.includes("aria-label={d.sectionNav}"));
  for (const id of [
    "overview",
    "map",
    "projects",
    "listings",
    "transit",
    "lifestyle",
    "schools",
    "hospitals",
    "shopping",
    "knowledge",
    "find-my-home",
    "platform-support",
  ]) {
    assert.ok(center.includes(`"${id}"`), id);
  }
});

check("district-detail:dictionary keys en/zh/th", () => {
  for (const locale of ["en", "zh", "th"]) {
    const dict = JSON.parse(read(`src/dictionaries/${locale}.json`));
    for (const key of [
      "sectionNav",
      "amenitiesEmpty",
      "amenitySource",
      "schoolsNote",
      "hospitalsNote",
      "shoppingNote",
      "viewAllProjects",
      "knowledgeHub",
      "knowledgeDistricts",
      "knowledgeGlossary",
      "unknown",
    ]) {
      assert.ok(dict.districtCenter[key], `${locale}.${key}`);
    }
  }
});

if (process.exitCode) {
  console.log(JSON.stringify({ ok: false }));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true }));
