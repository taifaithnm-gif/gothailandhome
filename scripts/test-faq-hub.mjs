#!/usr/bin/env node
/**
 * P1-27 — FAQ hub.
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

check("faq-hub:route content and loader exist", () => {
  for (const file of [
    "src/app/[lang]/faq/page.tsx",
    "content/faq/INDEX.json",
  ]) {
    assert.ok(existsSync(resolve(root, file)), file);
  }
});

check("faq-hub:inventory count matches schema set", () => {
  const index = JSON.parse(read("content/faq/INDEX.json"));
  assert.equal((index.entries ?? []).length, 10, "ten approved entries");
  const src = read("src/app/[lang]/faq/page.tsx");
  assert.ok(src.includes("platformFaqSchema"), "FAQPage schema");
  assert.ok(src.includes("renderFaqEntriesLocale"), "loader render");
});

check("faq-hub:categories anchors and keyboard details", () => {
  const src = read("src/app/[lang]/faq/page.tsx");
  assert.ok(src.includes('id={`faq-${categoryId}`}'), "category anchors");
  assert.ok(src.includes("<details"), "details disclosure");
  assert.ok(src.includes("<summary"), "summary control");
  assert.ok(src.includes("investmentGuideLink"), "investment guide link");
  assert.ok(src.includes("legalGuideLink"), "legal guide link");
});

check("faq-hub:guide answers link not improvise", () => {
  const investment = JSON.parse(
    read("content/faq/entries/faq-investment-questions.json"),
  );
  const legal = JSON.parse(read("content/faq/entries/faq-legal-questions.json"));
  assert.ok(investment.answer.en.includes("/knowledge/investment"));
  assert.ok(legal.answer.en.includes("/knowledge/legal"));
  assert.ok(investment.answer.en.includes("do not provide yield"));
});

check("faq-hub:metadata and sitemap", () => {
  const src = read("src/app/[lang]/faq/page.tsx");
  assert.ok(src.includes('path: "/faq"'), "canonical path");
  const sitemap = read("src/app/sitemap.ts");
  assert.ok(sitemap.includes('"/faq"'));
});

check("faq-hub:dictionary keys en zh th", () => {
  for (const locale of ["en", "zh", "th"]) {
    const dict = JSON.parse(read(`src/dictionaries/${locale}.json`));
    assert.ok(dict.faqHub.title, `${locale}.faqHub.title`);
    assert.ok(dict.faqHub.categories.platform, `${locale}.categories.platform`);
  }
});

if (process.exitCode) {
  console.log(JSON.stringify({ ok: false }));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true }));
