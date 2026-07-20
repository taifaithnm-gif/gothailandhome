#!/usr/bin/env node
/**
 * P1-13 — Developer detail decision flow contracts.
 *
 * Offline checks: honest logo status, platform-subset portfolio labeling,
 * bounded project/listing previews, metadata/schema wiring, a11y/responsive
 * section contracts. No live property sources / Windows01.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();

const FILES = {
  center: "src/components/developer/developer-center.tsx",
  page: "src/app/[lang]/developers/[slug]/page.tsx",
  logo: "src/lib/developers/logo-presentation.ts",
  evidence: "src/lib/developers/evidence.ts",
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

check("developer-detail:required files exist", () => {
  for (const file of Object.values(FILES)) {
    assert.ok(existsSync(resolve(root, file)), file);
  }
});

check("developer-detail:logo status represented honestly", () => {
  const center = read(FILES.center);
  const logoHelper = read(FILES.logo);
  assert.ok(center.includes("getDeveloperLogoPresentation"));
  assert.ok(center.includes("logoStatusLabelKey"));
  assert.ok(center.includes('data-slot="developer-logo-status"'));
  assert.ok(center.includes("canPresentOfficialMark"));
  assert.ok(logoHelper.includes("official_cached"));
  assert.ok(logoHelper.includes("official_remote"));
  assert.ok(logoHelper.includes("placeholder"));
  assert.ok(logoHelper.includes("cached_local_path"));
  assert.ok(logoHelper.includes("publicFileExists"));
  // Never hotlink remote URL as the presented official mark.
  assert.ok(
    !center.includes("packageFacts.officialLogoUrl || developer.logoUrl"),
  );

  const meta = JSON.parse(
    read("public/developers/sansiri/logo.meta.json"),
  );
  assert.equal(meta.status, "official_cached");
  assert.ok(String(meta.cached_local_path).startsWith("/"));
  assert.ok(
    existsSync(
      resolve(root, "public", String(meta.cached_local_path).replace(/^\//, "")),
    ),
  );
  assert.ok(logoHelper.includes("canPresentOfficialMark: true"));
});

check("developer-detail:portfolio labeled as platform subset", () => {
  const center = read(FILES.center);
  assert.ok(center.includes("portfolioSubsetNote"));
  assert.ok(center.includes('data-slot="developer-portfolio-subset"'));
  assert.ok(center.includes("projectsDisclaimer"));
  assert.ok(center.includes("factoryLinkedNote"));
});

check("developer-detail:previews remain bounded", () => {
  const center = read(FILES.center);
  const page = read(FILES.page);
  const evidence = read(FILES.evidence);
  assert.match(evidence, /DEVELOPER_PROJECT_PREVIEW_SIZE\s*=\s*6/);
  assert.match(evidence, /DEVELOPER_LISTING_PREVIEW_SIZE\s*=\s*3/);
  assert.ok(center.includes("items.slice(0, DEVELOPER_PROJECT_PREVIEW_SIZE)"));
  assert.ok(center.includes("items.slice(0, DEVELOPER_LISTING_PREVIEW_SIZE)"));
  assert.ok(center.includes("related.slice(0, 4)"));
  assert.ok(page.includes("DEVELOPER_LISTING_PREVIEW_SIZE"));
  assert.ok(page.includes("scored.slice(0, 4)"));
});

check("developer-detail:section nav + contact pathways", () => {
  const center = read(FILES.center);
  assert.ok(center.includes('data-slot="developer-section-nav"'));
  assert.ok(center.includes("aria-label={d.sectionNav}"));
  for (const id of [
    "overview",
    "projects",
    "listings",
    "company",
    "official-website",
    "verification",
    "partnership",
    "related-developers",
    "platform-support",
  ]) {
    assert.ok(center.includes(`"${id}"`), id);
  }
  assert.ok(center.includes("PlatformCustomerSuccess"));
  assert.ok(center.includes("contactPartnershipCta"));
  assert.ok(center.includes("scroll-mt-24"));
});

check("developer-detail:metadata and schema wiring", () => {
  const page = read(FILES.page);
  const schema = read(FILES.schema);
  assert.ok(page.includes("buildPageMetadata"));
  assert.ok(page.includes("developerSchema"));
  assert.ok(page.includes("breadcrumbListSchema"));
  assert.ok(page.includes("JsonLd"));
  assert.ok(schema.includes("export function developerSchema"));
});

check("developer-detail:dictionary keys en/zh/th", () => {
  for (const locale of ["en", "zh", "th"]) {
    const dict = JSON.parse(read(`src/dictionaries/${locale}.json`));
    for (const key of [
      "sectionNav",
      "portfolioSubsetNote",
      "logoStatusPlaceholder",
      "logoStatusOfficialRemote",
      "logoStatusOfficialCached",
      "projectsDisclaimer",
      "logoMissing",
    ]) {
      assert.ok(dict.developers[key], `${locale}.${key}`);
    }
  }
});

if (process.exitCode) {
  console.log(JSON.stringify({ ok: false }));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true }));
