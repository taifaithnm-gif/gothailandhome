#!/usr/bin/env node
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
function ok(m) {
  console.log(`PASS: ${m}`);
}
function check(name, fn) {
  try {
    fn();
    ok(name);
  } catch (e) {
    console.error(`FAIL: ${name} — ${e.message}`);
    process.exitCode = 1;
  }
}

const files = {
  schema: "src/lib/seo/schema.ts",
  jsonLd: "src/components/seo/json-ld.tsx",
  metadata: "src/lib/i18n/metadata.ts",
  sitemapInventory: "src/lib/seo/sitemap-inventory.ts",
  sitemap: "src/app/sitemap.ts",
  propertiesData: "src/lib/data/properties.ts",
  home: "src/app/[lang]/page.tsx",
  search: "src/app/[lang]/search/page.tsx",
  properties: "src/app/[lang]/properties/page.tsx",
  listing: "src/app/[lang]/properties/[id]/page.tsx",
  project: "src/app/[lang]/projects/[slug]/page.tsx",
  developer: "src/app/[lang]/developers/[slug]/page.tsx",
  district: "src/app/[lang]/districts/[slug]/page.tsx",
  robots: "src/app/robots.ts",
  admin: "src/app/admin/layout.tsx",
  og: "public/og/default.svg",
  media: "src/components/property/listing-media-frame.tsx",
};

const inventory = await import(
  pathToFileURL(resolve(root, files.sitemapInventory)).href
);

check("SEO assets exist", () => {
  for (const path of Object.values(files)) {
    assert.ok(existsSync(resolve(root, path)), path);
  }
});

check("schema builders export core types", () => {
  const src = readFileSync(resolve(root, files.schema), "utf8");
  for (const name of [
    "organizationSchema",
    "websiteSchema",
    "listingSchema",
    "projectSchema",
    "developerSchema",
    "districtSchema",
    "breadcrumbListSchema",
    "collectionPageSchema",
  ]) {
    assert.ok(src.includes(`export function ${name}`), name);
  }
});

check("target pages emit JsonLd", () => {
  for (const key of [
    "home",
    "properties",
    "listing",
    "project",
    "developer",
    "district",
  ]) {
    const src = readFileSync(resolve(root, files[key]), "utf8");
    assert.ok(src.includes("JsonLd"), key);
  }
});

check("search is noindex redirect helper", () => {
  const src = readFileSync(resolve(root, files.search), "utf8");
  assert.ok(src.includes("index: false"));
  assert.ok(src.includes("redirect"));
});

check("metadata helper ships default OG image", () => {
  const src = readFileSync(resolve(root, files.metadata), "utf8");
  assert.ok(src.includes("/og/default.svg"));
  assert.ok(src.includes("images: [ogImage]"));
});

check("robots disallow admin", () => {
  const src = readFileSync(resolve(root, files.robots), "utf8");
  assert.ok(src.includes("/admin"));
});

check("admin layout is noindex", () => {
  const src = readFileSync(resolve(root, files.admin), "utf8");
  assert.ok(src.includes("index: false"));
});

check("LCP media uses fetchPriority", () => {
  const src = readFileSync(resolve(root, files.media), "utf8");
  assert.ok(src.includes("fetchPriority"));
  assert.ok(src.includes("sizes="));
});

check("sitemap uses bounded paged property slug inventory", () => {
  const sitemapSrc = readFileSync(resolve(root, files.sitemap), "utf8");
  const dataSrc = readFileSync(resolve(root, files.propertiesData), "utf8");
  assert.ok(
    sitemapSrc.includes("listPublishedPropertySlugsForSitemap"),
    "sitemap calls paged slug inventory",
  );
  assert.ok(
    sitemapSrc.includes("buildLocalizedPropertySitemapEntries"),
    "sitemap expands localized property URLs",
  );
  assert.ok(
    !sitemapSrc.includes("listPublishedProperties("),
    "sitemap no longer uses uncapped listPublishedProperties",
  );
  assert.ok(
    dataSrc.includes(
      "export async function listPublishedPropertySlugsForSitemap",
    ),
    "slug inventory export exists",
  );
  assert.ok(dataSrc.includes('.eq("status", "published")'), "published only");
  assert.ok(
    dataSrc.includes('.eq("is_verified_listing", true)'),
    "verified only",
  );
  assert.ok(
    dataSrc.includes('.order("slug", { ascending: true })'),
    "deterministic slug order",
  );
  assert.ok(dataSrc.includes(".range(from, to)"), "bounded range paging");
  assert.ok(!sitemapSrc.includes("/admin"), "no admin URLs");
  assert.ok(!sitemapSrc.includes("/leads/"), "no lead result URLs");
});

check("sitemap property paging covers inventory past PostgREST 1000 cap", () => {
  const {
    SITEMAP_PROPERTY_PAGE_SIZE,
    SITEMAP_PROPERTY_MAX_PAGES,
    hasMoreSitemapPropertyPages,
    buildLocalizedPropertySitemapEntries,
  } = inventory;

  assert.ok(
    SITEMAP_PROPERTY_PAGE_SIZE > 0 && SITEMAP_PROPERTY_PAGE_SIZE < 1000,
    `page size must be bounded under PostgREST default (${SITEMAP_PROPERTY_PAGE_SIZE})`,
  );
  assert.ok(
    SITEMAP_PROPERTY_MAX_PAGES * SITEMAP_PROPERTY_PAGE_SIZE >= 2000,
    "max window must exceed historical ~1318 published inventory",
  );

  const total = 1318;
  let collected = 0;
  let pageIndex = 0;
  while (collected < total) {
    const rowCount = Math.min(SITEMAP_PROPERTY_PAGE_SIZE, total - collected);
    collected += rowCount;
    if (!hasMoreSitemapPropertyPages(rowCount, pageIndex)) break;
    pageIndex += 1;
  }
  assert.equal(collected, total, "paged loop must collect full eligible count");
  assert.ok(pageIndex >= 2, "must page beyond a single 1000-row response");

  const locales = ["en", "zh", "th"];
  const slugs = Array.from({ length: total }, (_, i) => `listing-${i}`);
  const entries = buildLocalizedPropertySitemapEntries({
    siteUrl: "https://www.gothailandhome.com",
    locales,
    slugs,
    lastModified: new Date("2026-07-18T00:00:00.000Z"),
  });
  assert.equal(
    entries.length,
    total * locales.length,
    "exact eligible count × locales",
  );
  for (const locale of locales) {
    assert.ok(
      entries.some(
        (e) =>
          e.url ===
          `https://www.gothailandhome.com/${locale}/properties/listing-0`,
      ),
      `${locale} first slug`,
    );
    assert.ok(
      entries.some(
        (e) =>
          e.url ===
          `https://www.gothailandhome.com/${locale}/properties/listing-1317`,
      ),
      `${locale} last slug past old 1000 cap`,
    );
  }
  assert.ok(
    entries.every(
      (e) => !e.url.includes("/admin") && !e.url.includes("/draft"),
    ),
    "no draft/admin property URLs",
  );
});

if (process.exitCode) {
  console.log(JSON.stringify({ ok: false }));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true }));
