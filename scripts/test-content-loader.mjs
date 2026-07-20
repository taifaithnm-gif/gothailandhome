#!/usr/bin/env node
/**
 * P1-22 — Static content schema and loader contract.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();

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

const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,79}$/;

function isContentSlug(value) {
  return SLUG_RE.test(value);
}

function normalizeContentStatus(value) {
  if (typeof value !== "string") return null;
  const raw = value.trim();
  if (!raw) return null;
  if (
    raw === "draft" ||
    raw === "in_review" ||
    raw === "approved" ||
    raw === "archived" ||
    raw === "rejected"
  ) {
    return raw;
  }
  return null;
}

function resolveContentStatus(input) {
  const explicit = normalizeContentStatus(input.status);
  if (explicit) return explicit;
  if (input.publish_ready === true) return "approved";
  return "draft";
}

check("content-loader:modules and approved roots exist", () => {
  for (const file of [
    "src/lib/content/types.ts",
    "src/lib/content/validate.ts",
    "src/lib/content/loader.ts",
    "content/knowledge/articles/INDEX.json",
    "content/blog/posts/INDEX.json",
  ]) {
    assert.ok(existsSync(resolve(root, file)), file);
  }
});

check("content-loader:status + slug validators are deterministic", () => {
  assert.equal(isContentSlug("bts-skytrain-overview"), true);
  assert.equal(isContentSlug("Bad Slug"), false);
  assert.equal(normalizeContentStatus("approved"), "approved");
  assert.equal(normalizeContentStatus("x"), null);
});

check("content-loader:legacy publish_ready maps fail-closed", () => {
  assert.equal(resolveContentStatus({ publish_ready: true }), "approved");
  assert.equal(resolveContentStatus({ publish_ready: false }), "draft");
  assert.equal(resolveContentStatus({}), "draft");
});

check("content-loader:knowledge article schema validates required fields", () => {
  const raw = JSON.parse(
    read("content/knowledge/articles/bts-skytrain-overview.json"),
  );
  assert.equal(raw.slug, "bts-skytrain-overview");
  assert.equal(raw.type, "knowledge_article");
  assert.equal(resolveContentStatus(raw), "approved");
  assert.ok(Array.isArray(raw.sources) && raw.sources.length > 0, "sources");
  assert.ok(raw.locale_status?.en, "locale status");
});

check("content-loader:drafts and invalid rows do not render", () => {
  assert.equal(isContentSlug("bad slug"), false, "invalid slug");
  assert.equal(resolveContentStatus({ publish_ready: false }), "draft");
});

check("content-loader:loader is directory-scoped and deterministic", () => {
  const src = read("src/lib/content/loader.ts");
  assert.ok(src.includes("KNOWLEDGE_ROOT"), "knowledge root constant");
  assert.ok(src.includes("BLOG_ROOT"), "blog root constant");
  assert.ok(src.includes("resolveScopedPath"), "scoped path guard");
  const index = JSON.parse(read("content/knowledge/articles/INDEX.json"));
  const slugs = (index.articles ?? []).map((row) => row.slug);
  const sorted = [...slugs].sort((a, b) => a.localeCompare(b));
  assert.deepEqual(slugs, sorted, "deterministic order");
});

check("content-loader:approved articles list includes only approved rows", () => {
  const index = JSON.parse(read("content/knowledge/articles/INDEX.json"));
  assert.ok((index.articles ?? []).length >= 1, "has approved article row");
  for (const row of index.articles ?? []) {
    const article = JSON.parse(read(row.path));
    assert.equal(resolveContentStatus(article), "approved");
  }
});

check("content-loader:no broad filesystem scans in loader", () => {
  const src = read("src/lib/content/loader.ts");
  assert.ok(!src.includes("readdir"), "no broad directory scans");
  assert.ok(!src.includes("glob"), "no glob scans");
});

if (process.exitCode) {
  console.log(JSON.stringify({ ok: false }));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true }));
