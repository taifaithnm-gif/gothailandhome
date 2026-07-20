#!/usr/bin/env node
/**
 * P1-28 — Static CMS validation and editorial QA.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const failures = [];

function read(rel) {
  return readFileSync(resolve(root, rel), "utf8");
}

function readJson(rel) {
  return JSON.parse(read(rel));
}

function fail(file, field, message) {
  failures.push({ file, field, message });
}

function daysSince(iso) {
  const ms = Date.now() - new Date(iso).getTime();
  return ms / (1000 * 60 * 60 * 24);
}

const INVESTMENT_FORBIDDEN = [
  "guaranteed return",
  "guaranteed yield",
  "expected roi",
  "projected yield",
  "rental yield",
  "cap rate",
  "price will rise",
  "best investment",
  "roi calculator",
  "yield calculator",
];

const LEGAL_FORBIDDEN = [
  "you qualify",
  "you can legally",
  "we recommend you",
  "legal advice for your",
  "guaranteed ownership",
  "tax avoidance",
];

function scanForbidden(text, tokens, file, field) {
  const lower = text.toLowerCase();
  for (const token of tokens) {
    if (lower.includes(token)) {
      fail(file, field, `forbidden token: ${token}`);
    }
  }
}

function validateLocaleStatus(file, localeStatus, requireComplete = true) {
  if (!localeStatus) {
    fail(file, "locale_status", "missing locale_status");
    return;
  }
  for (const locale of ["en", "zh", "th"]) {
    if (requireComplete && localeStatus[locale] !== "complete") {
      fail(file, `locale_status.${locale}`, "must be complete");
    }
  }
}

function validateReviewDate(file, reviewedAt, maxDays) {
  if (!reviewedAt) {
    fail(file, "reviewed_at", "missing reviewed_at");
    return;
  }
  if (Number.isNaN(new Date(reviewedAt).getTime())) {
    fail(file, "reviewed_at", "invalid date");
    return;
  }
  if (daysSince(reviewedAt) > maxDays) {
    fail(file, "reviewed_at", `stale review (> ${maxDays} days)`);
  }
}

function collectSlugs(indexPath, key, slugField = "slug") {
  const index = readJson(indexPath);
  const rows = index[key] ?? [];
  const slugs = [];
  for (const row of rows) {
    const slug = row[slugField];
    if (!slug) {
      fail(indexPath, slugField, "index row missing slug/id");
      continue;
    }
    slugs.push({ slug, path: row.path, indexPath });
  }
  return slugs;
}

function validateKnowledgeArticles() {
  const rows = collectSlugs("content/knowledge/articles/INDEX.json", "articles");
  const seen = new Set();
  for (const row of rows) {
    if (seen.has(row.slug)) fail(row.indexPath, row.slug, "duplicate slug");
    seen.add(row.slug);
    const doc = readJson(row.path);
    if (doc.status !== "approved" && doc.publish_ready !== true) {
      fail(row.path, "status", "non-approved article in index");
    }
    if (!Array.isArray(doc.sources) || !doc.sources.length) {
      fail(row.path, "sources", "missing citations");
    }
    validateLocaleStatus(row.path, doc.locale_status);
    validateReviewDate(row.path, doc.reviewed_at ?? doc.verified_at, 180);
  }
}

function validateBlogPosts() {
  const rows = collectSlugs("content/blog/posts/INDEX.json", "posts");
  for (const row of rows) {
    const doc = readJson(row.path);
    if (doc.status === "approved" && (!doc.sources || !doc.sources.length)) {
      fail(row.path, "sources", "approved blog missing sources");
    }
  }
}

function validateInvestmentGuide() {
  const rows = collectSlugs("content/guides/investment/INDEX.json", "guides");
  for (const row of rows) {
    const doc = readJson(row.path);
    if (!doc.disclaimer?.en) fail(row.path, "disclaimer", "missing disclaimer");
    if (!doc.forecast_disclaimer?.en) {
      fail(row.path, "forecast_disclaimer", "missing forecast disclaimer");
    }
    if (!doc.version) fail(row.path, "version", "missing version");
    if (!doc.owner) fail(row.path, "owner", "missing owner");
    validateLocaleStatus(row.path, doc.locale_status);
    validateReviewDate(row.path, doc.reviewed_at, 90);
    const bodyText = JSON.stringify(doc.body ?? {});
    scanForbidden(bodyText, INVESTMENT_FORBIDDEN, row.path, "body");
    scanForbidden(JSON.stringify(doc.disclaimer ?? {}), INVESTMENT_FORBIDDEN, row.path, "disclaimer");
  }
}

function validateLegalGuide() {
  const rows = collectSlugs("content/guides/legal/INDEX.json", "guides");
  for (const row of rows) {
    const doc = readJson(row.path);
    if (!doc.disclaimer?.en) fail(row.path, "disclaimer", "missing disclaimer");
    if (!doc.jurisdiction?.en) fail(row.path, "jurisdiction", "missing jurisdiction");
    if (!doc.version) fail(row.path, "version", "missing version");
    if (!doc.owner) fail(row.path, "owner", "missing owner");
    const gov = (doc.sources ?? []).some((s) => s.type === "government");
    if (!gov) fail(row.path, "sources", "missing government citation");
    validateLocaleStatus(row.path, doc.locale_status);
    validateReviewDate(row.path, doc.reviewed_at, 90);
    const bodyText = JSON.stringify(doc.body ?? {});
    scanForbidden(bodyText, LEGAL_FORBIDDEN, row.path, "body");
  }
}

function validateFaqEntries() {
  const rows = collectSlugs("content/faq/INDEX.json", "entries", "id");
  const seen = new Set();
  for (const row of rows) {
    if (seen.has(row.slug)) fail(row.indexPath, row.slug, "duplicate faq id");
    seen.add(row.slug);
    const doc = readJson(row.path);
    if (doc.status !== "approved") fail(row.path, "status", "faq not approved");
    validateLocaleStatus(row.path, doc.locale_status);
    validateReviewDate(row.path, doc.reviewed_at, 180);
    const answerText = JSON.stringify(doc.answer ?? {});
    scanForbidden(answerText, ["guaranteed return", "expected roi", "you qualify"], row.path, "answer");
    if (row.slug === "faq-investment-questions") {
      if (!doc.answer?.en?.includes("/knowledge/investment")) {
        fail(row.path, "answer.en", "must link to investment guide");
      }
    }
    if (row.slug === "faq-legal-questions") {
      if (!doc.answer?.en?.includes("/knowledge/legal")) {
        fail(row.path, "answer.en", "must link to legal guide");
      }
    }
  }
}

function validatePackageScript() {
  const pkg = readJson("package.json");
  assert.ok(pkg.scripts["test:content-editorial"], "test:content-editorial script");
  const testChain = pkg.scripts.test;
  assert.ok(testChain.includes("test:content-editorial"), "in aggregate npm test");
}

validateKnowledgeArticles();
validateBlogPosts();
validateInvestmentGuide();
validateLegalGuide();
validateFaqEntries();
validatePackageScript();

if (failures.length) {
  console.error("FAIL: content-editorial validation");
  for (const item of failures) {
    console.error(`  ${item.file} :: ${item.field} — ${item.message}`);
  }
  process.exit(1);
}

console.log("PASS: content-editorial — all static public content checks");
console.log(JSON.stringify({ ok: true, checks: "P1-28" }));
