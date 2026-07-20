#!/usr/bin/env node
/**
 * P1-24 — Static blog index/detail routes.
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

check("blog:routes and inventory exist", () => {
  for (const file of [
    "src/app/[lang]/blog/page.tsx",
    "src/app/[lang]/blog/[slug]/page.tsx",
    "content/blog/posts/INDEX.json",
  ]) {
    assert.ok(existsSync(resolve(root, file)), file);
  }
});

check("blog:metadata keys exist in EN/ZH/TH", () => {
  for (const locale of ["en", "zh", "th"]) {
    const dict = JSON.parse(read(`src/dictionaries/${locale}.json`));
    assert.ok(dict.meta.blogTitle, `${locale}.meta.blogTitle`);
    assert.ok(dict.meta.blogDescription, `${locale}.meta.blogDescription`);
    for (const key of [
      "title",
      "subtitle",
      "notice",
      "emptyTitle",
      "emptyBody",
      "authorLabel",
      "publishedLabel",
      "updatedLabel",
      "reviewedLabel",
      "editorialLabel",
      "bodyTitle",
      "citationsTitle",
      "fallbackTitle",
      "fallbackBody",
    ]) {
      assert.ok(dict.blog[key], `${locale}.blog.${key}`);
    }
  }
});

check("blog:index is separated from knowledge reference guides", () => {
  const src = read("src/app/[lang]/blog/page.tsx");
  assert.ok(src.includes("blog.notice"), "editorial separation notice");
  assert.ok(src.includes('data-slot="blog-empty-state"'), "empty state slot");
  assert.ok(src.includes("listBlogPosts"), "approved blog loader");
});

check("blog:detail fails closed and has author/date/update labels", () => {
  const src = read("src/app/[lang]/blog/[slug]/page.tsx");
  assert.ok(src.includes("if (!post) notFound()"), "unknown/draft 404");
  assert.ok(src.includes("authorLabel"), "author label");
  assert.ok(src.includes("publishedLabel"), "published label");
  assert.ok(src.includes("updatedLabel"), "updated label");
  assert.ok(src.includes("editorialLabel"), "editorial distinction label");
});

check("blog:locale fallback disclosure is explicit", () => {
  const src = read("src/app/[lang]/blog/[slug]/page.tsx");
  assert.ok(src.includes('data-locale-fallback="en"'), "fallback marker");
  assert.ok(src.includes("fallbackTitle"), "fallback title");
});

check("blog:index path is in sitemap static inventory", () => {
  const sitemap = read("src/app/sitemap.ts");
  assert.ok(sitemap.includes('"/blog"'));
});

if (process.exitCode) {
  console.log(JSON.stringify({ ok: false }));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true }));
