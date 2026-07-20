#!/usr/bin/env node
/**
 * P1-23 — Knowledge article routes.
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

check("knowledge-articles:routes and loader exist", () => {
  for (const file of [
    "src/app/[lang]/knowledge/articles/page.tsx",
    "src/app/[lang]/knowledge/articles/[slug]/page.tsx",
    "src/lib/content/loader.ts",
    "content/knowledge/articles/INDEX.json",
  ]) {
    assert.ok(existsSync(resolve(root, file)), file);
  }
});

check("knowledge-articles:index renders approved only and links detail", () => {
  const src = read("src/app/[lang]/knowledge/articles/page.tsx");
  assert.ok(src.includes("listKnowledgeArticles"), "uses approved loader");
  assert.ok(src.includes("/knowledge/articles/${item.slug}"), "detail link");
  assert.ok(src.includes("articlesEmptyTitle"), "localized empty state");
});

check("knowledge-articles:detail enforces 404 and visible evidence", () => {
  const src = read("src/app/[lang]/knowledge/articles/[slug]/page.tsx");
  assert.ok(src.includes("renderKnowledgeArticleLocale"), "localized loader");
  assert.ok(src.includes("if (!article) notFound()"), "unknown/draft 404");
  assert.ok(src.includes("citationsTitle"), "citations visible");
  assert.ok(src.includes("verifiedOn"), "verification date visible");
});

check("knowledge-articles:locale fallback is disclosed", () => {
  const src = read("src/app/[lang]/knowledge/articles/[slug]/page.tsx");
  assert.ok(src.includes("data-locale-fallback=\"en\""), "fallback marker");
  assert.ok(src.includes("fallbackTitle"), "fallback copy");
  for (const locale of ["en", "zh", "th"]) {
    const dict = JSON.parse(read(`src/dictionaries/${locale}.json`));
    assert.ok(dict.knowledge.fallbackTitle, `${locale}.knowledge.fallbackTitle`);
    assert.ok(dict.knowledge.fallbackBody, `${locale}.knowledge.fallbackBody`);
  }
});

check("knowledge-articles:metadata + breadcrumb contracts", () => {
  const src = read("src/app/[lang]/knowledge/articles/[slug]/page.tsx");
  assert.ok(src.includes("generateMetadata"), "metadata export");
  assert.ok(
    src.includes("path: `/knowledge/articles/${article.slug}`"),
    "canonical path",
  );
  assert.ok(src.includes("breadcrumbListSchema"), "breadcrumb schema");
});

check("knowledge-articles:index path in sitemap static inventory", () => {
  const sitemap = read("src/app/sitemap.ts");
  assert.ok(sitemap.includes('"/knowledge/articles"'));
});

if (process.exitCode) {
  console.log(JSON.stringify({ ok: false }));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true }));
