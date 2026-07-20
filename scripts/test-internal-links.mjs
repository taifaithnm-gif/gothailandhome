#!/usr/bin/env node
/**
 * P1-30 — Internal linking and breadcrumb completion.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();

function read(rel) {
  return readFileSync(resolve(root, rel), "utf8");
}

function ok(msg) {
  console.log(`PASS: ${msg}`);
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

const PHASE1_PUBLIC_ROUTES = [
  "src/app/[lang]/page.tsx",
  "src/app/[lang]/properties/page.tsx",
  "src/app/[lang]/knowledge/page.tsx",
  "src/app/[lang]/knowledge/articles/page.tsx",
  "src/app/[lang]/knowledge/investment/page.tsx",
  "src/app/[lang]/knowledge/legal/page.tsx",
  "src/app/[lang]/blog/page.tsx",
  "src/app/[lang]/faq/page.tsx",
  "src/app/[lang]/marketplace/page.tsx",
  "src/app/[lang]/contact/page.tsx",
];

check("internal-links:phase1 public routes exist", () => {
  for (const file of PHASE1_PUBLIC_ROUTES) {
    assert.ok(existsSync(resolve(root, file)), file);
  }
});

check("internal-links:nav includes knowledge faq blog", () => {
  const nav = read("src/lib/navigation/site-nav.ts");
  assert.ok(nav.includes('"/faq"'), "faq in nav");
  assert.ok(nav.includes('"/blog"'), "blog in nav");
  assert.ok(nav.includes('"/knowledge"'), "knowledge in nav");
});

check("internal-links:related links component omits current path", () => {
  const src = read("src/components/content/content-related-links.tsx");
  assert.ok(src.includes("item.path !== currentPath"), "no self-link");
  assert.ok(src.includes("localePath(locale, item.path)"), "locale preserved");
});

check("internal-links:content surfaces wire related links + breadcrumbs", () => {
  for (const file of [
    "src/app/[lang]/knowledge/page.tsx",
    "src/app/[lang]/knowledge/investment/page.tsx",
    "src/app/[lang]/knowledge/legal/page.tsx",
    "src/app/[lang]/blog/page.tsx",
    "src/app/[lang]/faq/page.tsx",
  ]) {
    const src = read(file);
    assert.ok(src.includes("ContentRelatedLinks"), `${file} related links`);
  }
  for (const file of [
    "src/app/[lang]/knowledge/investment/page.tsx",
    "src/app/[lang]/knowledge/legal/page.tsx",
    "src/app/[lang]/faq/page.tsx",
  ]) {
    const src = read(file);
    assert.ok(src.includes("breadcrumbListSchema"), `${file} breadcrumb schema`);
    assert.ok(src.includes("breadcrumbs="), `${file} visible breadcrumbs`);
  }
});

check("internal-links:related link targets resolve to pages", () => {
  const targets = [
    "src/app/[lang]/knowledge/page.tsx",
    "src/app/[lang]/knowledge/articles/page.tsx",
    "src/app/[lang]/knowledge/investment/page.tsx",
    "src/app/[lang]/knowledge/legal/page.tsx",
    "src/app/[lang]/faq/page.tsx",
    "src/app/[lang]/blog/page.tsx",
  ];
  for (const file of targets) {
    assert.ok(existsSync(resolve(root, file)), `broken target ${file}`);
  }
});

check("internal-links:dictionary contentLinks keys", () => {
  for (const locale of ["en", "zh", "th"]) {
    const dict = JSON.parse(read(`src/dictionaries/${locale}.json`));
    assert.ok(dict.contentLinks?.title, `${locale}.contentLinks.title`);
  }
});

if (process.exitCode) {
  console.log(JSON.stringify({ ok: false }));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true }));
