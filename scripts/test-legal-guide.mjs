#!/usr/bin/env node
/**
 * P1-26 — Legal guide surface.
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

check("legal-guide:route and content exist", () => {
  for (const file of [
    "src/app/[lang]/knowledge/legal/page.tsx",
    "content/guides/legal/INDEX.json",
    "content/guides/legal/thailand-foreign-ownership-guide.json",
  ]) {
    assert.ok(existsSync(resolve(root, file)), file);
  }
});

check("legal-guide:approved loader and 404 contract", () => {
  const src = read("src/app/[lang]/knowledge/legal/page.tsx");
  assert.ok(src.includes("renderLegalGuideLocale"), "localized loader");
  assert.ok(src.includes("if (!guide) notFound()"), "missing guide 404");
});

check("legal-guide:jurisdiction disclaimer version owner reviewed", () => {
  const src = read("src/app/[lang]/knowledge/legal/page.tsx");
  assert.ok(src.includes("guide.jurisdiction.value"), "jurisdiction visible");
  assert.ok(src.includes("guide.disclaimer.value"), "disclaimer visible");
  assert.ok(src.includes("guide.version"), "version visible");
  assert.ok(src.includes("guide.owner"), "owner visible");
  assert.ok(src.includes("guide.reviewedAt"), "reviewed visible");
});

check("legal-guide:no personalized legal advice claim", () => {
  const src = read("src/app/[lang]/knowledge/legal/page.tsx");
  assert.ok(src.includes("notAdviceLabel"), "not advice label");
  const content = JSON.parse(
    read("content/guides/legal/thailand-foreign-ownership-guide.json"),
  );
  assert.equal(content.version, "LEG-GUIDE-1.0.0", "version identifiable");
});

check("legal-guide:metadata schema and sitemap", () => {
  const src = read("src/app/[lang]/knowledge/legal/page.tsx");
  assert.ok(src.includes('path: "/knowledge/legal"'), "canonical path");
  const sitemap = read("src/app/sitemap.ts");
  assert.ok(sitemap.includes('"/knowledge/legal"'));
});

check("legal-guide:dictionary keys en zh th", () => {
  for (const locale of ["en", "zh", "th"]) {
    const dict = JSON.parse(read(`src/dictionaries/${locale}.json`));
    assert.ok(dict.legalGuide.title, `${locale}.legalGuide.title`);
    assert.ok(dict.legalGuide.notAdviceLabel, `${locale}.notAdviceLabel`);
  }
});

if (process.exitCode) {
  console.log(JSON.stringify({ ok: false }));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true }));
