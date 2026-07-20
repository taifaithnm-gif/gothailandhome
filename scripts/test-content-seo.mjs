#!/usr/bin/env node
/**
 * P1-29 — Content metadata, schema, and sitemap integration.
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

const CONTENT_ROUTES = [
  "src/app/[lang]/knowledge/articles/[slug]/page.tsx",
  "src/app/[lang]/blog/[slug]/page.tsx",
  "src/app/[lang]/faq/page.tsx",
  "src/app/[lang]/knowledge/investment/page.tsx",
  "src/app/[lang]/knowledge/legal/page.tsx",
];

check("content-seo:routes and schema helper exist", () => {
  for (const file of CONTENT_ROUTES) {
    assert.ok(existsSync(resolve(root, file)), file);
  }
  assert.ok(read("src/lib/seo/schema.ts").includes("export function articleSchema"));
  assert.ok(read("src/lib/seo/schema.ts").includes("export function platformFaqSchema"));
});

check("content-seo:article schema on knowledge and blog detail", () => {
  const knowledge = read("src/app/[lang]/knowledge/articles/[slug]/page.tsx");
  const blog = read("src/app/[lang]/blog/[slug]/page.tsx");
  assert.ok(knowledge.includes("articleSchema"), "knowledge Article schema");
  assert.ok(blog.includes("articleSchema"), "blog Article schema");
  assert.ok(knowledge.includes("buildPageMetadata"), "canonical helper");
  assert.ok(blog.includes("buildPageMetadata"), "blog metadata");
});

check("content-seo:faq schema mirrors visible questions", () => {
  const faq = read("src/app/[lang]/faq/page.tsx");
  assert.ok(faq.includes("platformFaqSchema"));
  assert.ok(faq.includes("renderFaqEntriesLocale"));
});

check("content-seo:sitemap includes approved content families only", () => {
  const sitemap = read("src/app/sitemap.ts");
  for (const path of [
    "/knowledge/articles",
    "/knowledge/investment",
    "/knowledge/legal",
    "/faq",
    "/blog",
  ]) {
    assert.ok(sitemap.includes(`"${path}"`), path);
  }
  assert.ok(sitemap.includes("listKnowledgeArticles"), "approved articles");
  assert.ok(sitemap.includes("listBlogPosts"), "approved posts");
  assert.ok(!sitemap.includes("/compare"), "no compare state page");
  assert.ok(!sitemap.includes("/leads/"), "no lead result URLs");
  assert.ok(!sitemap.includes('"/search"'), "no search");
  assert.ok(!sitemap.includes("/admin"), "no admin");
});

check("content-seo:guides use metadata + breadcrumb schema", () => {
  for (const file of [
    "src/app/[lang]/knowledge/investment/page.tsx",
    "src/app/[lang]/knowledge/legal/page.tsx",
  ]) {
    const src = read(file);
    assert.ok(src.includes("buildPageMetadata"), file);
    assert.ok(src.includes("breadcrumbListSchema"), file);
  }
});

if (process.exitCode) {
  console.log(JSON.stringify({ ok: false }));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true }));
