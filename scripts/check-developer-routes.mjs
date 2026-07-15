#!/usr/bin/env node
/**
 * Check all 20 published developer detail routes return non-500 locally.
 *
 * Usage:
 *   BASE_URL=http://127.0.0.1:3000 node scripts/check-developer-routes.mjs
 */
import { readdirSync, existsSync, writeFileSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";

const BASE = (process.env.BASE_URL || "http://127.0.0.1:3000").replace(
  /\/$/,
  "",
);
const LANG = process.env.LANG_PREFIX || "en";
const OUT_DIR = resolve(process.cwd(), "pipelines/factory/overnight/_runs");
const OUT = join(OUT_DIR, "developer-route-check.json");

function developerSlugs() {
  const root = resolve(process.cwd(), "content/developers");
  return readdirSync(root)
    .filter((name) => existsSync(join(root, name, "manifest.json")))
    .sort();
}

async function checkSlug(slug) {
  const url = `${BASE}/${LANG}/developers/${slug}`;
  const started = Date.now();
  try {
    const res = await fetch(url, {
      redirect: "manual",
      headers: { Accept: "text/html" },
    });
    const text = await res.text();
    const is500 = res.status >= 500;
    return {
      slug,
      url,
      status: res.status,
      ok: !is500,
      bytes: Buffer.byteLength(text),
      ms: Date.now() - started,
      cards: (text.match(/data-slot="listing-card"/g) || []).length,
      usesPlaceholderLogo: text.includes('data-slot="developer-logo-placeholder"'),
      hasOfficialContact: text.includes('data-slot="contact-official"'),
      hasPlatformContact: text.includes('data-slot="contact-platform"'),
    };
  } catch (error) {
    return {
      slug,
      url,
      status: 0,
      ok: false,
      bytes: 0,
      ms: Date.now() - started,
      error: error.message,
    };
  }
}

async function main() {
  const slugs = developerSlugs();
  if (slugs.length !== 20) {
    console.error(`Expected 20 developer packages, found ${slugs.length}`);
  }

  const results = [];
  for (const slug of slugs) {
    const row = await checkSlug(slug);
    results.push(row);
    console.log(`${row.ok ? "OK" : "FAIL"} ${row.status} ${slug} (${row.ms}ms, ${row.bytes}b)`);
  }

  const failed = results.filter((r) => !r.ok);
  const summary = {
    checked_at: new Date().toISOString(),
    base: BASE,
    total: results.length,
    ok: results.length - failed.length,
    failed: failed.length,
    failures: failed,
    results,
  };

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT, JSON.stringify(summary, null, 2));
  console.log(JSON.stringify({ ok: summary.ok, checked_at: summary.checked_at, base: BASE, total: summary.total, failed: summary.failed, failures: failed.map((f) => f.slug) }, null, 2));
  console.log(`Wrote ${OUT}`);
  if (failed.length) process.exit(1);
}

main();
