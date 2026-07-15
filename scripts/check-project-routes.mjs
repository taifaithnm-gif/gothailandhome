#!/usr/bin/env node
/**
 * Check all 50 published project detail routes return non-500 locally.
 *
 * Usage:
 *   BASE_URL=http://127.0.0.1:3000 node scripts/check-project-routes.mjs
 *
 * Requires a running `next start` (or `next dev`) server with env configured.
 */
import { readdirSync, existsSync, writeFileSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";

const BASE = (process.env.BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const LANG = process.env.LANG_PREFIX || "en";
const OUT_DIR = resolve(process.cwd(), "pipelines/factory/overnight/_runs");
const OUT = join(OUT_DIR, "project-route-check.json");

function projectSlugs() {
  const root = resolve(process.cwd(), "content/projects");
  return readdirSync(root)
    .filter((name) => existsSync(join(root, name, "manifest.json")))
    .sort();
}

async function checkSlug(slug) {
  const url = `${BASE}/${LANG}/projects/${slug}`;
  const started = Date.now();
  try {
    const res = await fetch(url, {
      redirect: "manual",
      headers: { Accept: "text/html" },
    });
    const text = await res.text();
    const is500 = res.status >= 500;
    const nameEnCrash = /Cannot read properties of undefined \(reading 'en'\)/i.test(
      text,
    );
    return {
      slug,
      url,
      status: res.status,
      ok: !is500,
      bytes: Buffer.byteLength(text),
      ms: Date.now() - started,
      nameEnCrash,
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
      nameEnCrash: false,
    };
  }
}

async function main() {
  const slugs = projectSlugs();
  if (slugs.length !== 50) {
    console.error(`Expected 50 project packages, found ${slugs.length}`);
  }

  const results = [];
  for (const slug of slugs) {
    const row = await checkSlug(slug);
    results.push(row);
    const mark = row.ok ? "OK" : "FAIL";
    console.log(`${mark} ${row.status} ${slug} (${row.ms}ms)`);
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
  console.log(JSON.stringify({ ok: failed.length === 0, ...summary, results: undefined }, null, 2));
  console.log(`Wrote ${OUT}`);

  if (failed.length) process.exit(1);
}

main();
