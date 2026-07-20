#!/usr/bin/env node
/**
 * P1-25 — Investment guide surface.
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

check("investment-guide:route and content exist", () => {
  for (const file of [
    "src/app/[lang]/knowledge/investment/page.tsx",
    "content/guides/investment/INDEX.json",
    "content/guides/investment/thailand-property-discovery-guide.json",
  ]) {
    assert.ok(existsSync(resolve(root, file)), file);
  }
});

check("investment-guide:approved loader and 404 contract", () => {
  const src = read("src/app/[lang]/knowledge/investment/page.tsx");
  assert.ok(src.includes("renderInvestmentGuideLocale"), "localized loader");
  assert.ok(src.includes("if (!guide) notFound()"), "missing guide 404");
});

check("investment-guide:disclaimer version owner reviewed visible", () => {
  const src = read("src/app/[lang]/knowledge/investment/page.tsx");
  assert.ok(src.includes("guide.disclaimer.value"), "disclaimer visible");
  assert.ok(src.includes("guide.version"), "version visible");
  assert.ok(src.includes("guide.owner"), "owner visible");
  assert.ok(src.includes("guide.reviewedAt"), "reviewed date visible");
  assert.ok(src.includes("citationsTitle"), "citations visible");
});

check("investment-guide:no calculator or yield UI", () => {
  const src = read("src/app/[lang]/knowledge/investment/page.tsx");
  assert.ok(!src.includes("calculator"), "no calculator");
  assert.ok(src.includes("notAdviceLabel"), "not advice label");
  assert.ok(src.includes("educationalLabel"), "educational label");
});

check("investment-guide:metadata schema and sitemap", () => {
  const src = read("src/app/[lang]/knowledge/investment/page.tsx");
  assert.ok(src.includes('path: "/knowledge/investment"'), "canonical path");
  assert.ok(src.includes("collectionPageSchema"), "schema");
  const sitemap = read("src/app/sitemap.ts");
  assert.ok(sitemap.includes('"/knowledge/investment"'));
});

check("investment-guide:dictionary keys en zh th", () => {
  for (const locale of ["en", "zh", "th"]) {
    const dict = JSON.parse(read(`src/dictionaries/${locale}.json`));
    assert.ok(dict.investmentGuide.title, `${locale}.investmentGuide.title`);
    assert.ok(dict.investmentGuide.notAdviceLabel, `${locale}.notAdviceLabel`);
  }
});

if (process.exitCode) {
  console.log(JSON.stringify({ ok: false }));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true }));
