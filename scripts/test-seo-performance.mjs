#!/usr/bin/env node
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

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

if (process.exitCode) {
  console.log(JSON.stringify({ ok: false }));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true }));
