#!/usr/bin/env node
/**
 * Phase 9 M2 marketplace hub entry checks.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();

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

check("hub page exists", () => {
  assert.ok(
    existsSync(resolve(root, "src/app/[lang]/marketplace/page.tsx")),
  );
});

check("entry grid + paths exist", () => {
  assert.ok(
    existsSync(
      resolve(root, "src/components/marketplace/marketplace-entry-grid.tsx"),
    ),
  );
  assert.ok(
    existsSync(resolve(root, "src/lib/marketplace/entry-paths.ts")),
  );
});

check("five entry ids present", () => {
  const src = readFileSync(
    resolve(root, "src/lib/marketplace/entry-paths.ts"),
    "utf8",
  );
  for (const id of [
    "find_my_home",
    "list_your_property",
    "developer_partnership",
    "agency_partnership",
    "viewing_request",
  ]) {
    assert.ok(src.includes(`"${id}"`) || src.includes(`'${id}'`), id);
  }
});

check("header points at marketplace hub", () => {
  const src = readFileSync(
    resolve(root, "src/components/layout/site-header.tsx"),
    "utf8",
  );
  assert.ok(src.includes("/marketplace"));
});

check("hub promise has no Apple on hub page", () => {
  const hub = readFileSync(
    resolve(root, "src/app/[lang]/marketplace/page.tsx"),
    "utf8",
  );
  assert.ok(!/\bApple\b/.test(hub));
  const grid = readFileSync(
    resolve(root, "src/components/marketplace/marketplace-entry-grid.tsx"),
    "utf8",
  );
  assert.ok(!/\bApple\b/.test(grid));
});

check("dictionary hub keys en/zh/th", () => {
  for (const locale of ["en", "zh", "th"]) {
    const dict = JSON.parse(
      readFileSync(resolve(root, `src/dictionaries/${locale}.json`), "utf8"),
    );
    for (const key of [
      "hubTitle",
      "hubPromise",
      "viewingEntryTitle",
      "roleBuyer",
    ]) {
      assert.ok(dict.marketplace[key], `${locale} ${key}`);
    }
    assert.ok(dict.nav.marketplace, `${locale} nav.marketplace`);
    assert.ok(dict.meta.marketplaceTitle, `${locale} meta.marketplaceTitle`);
  }
});

if (process.exitCode) {
  console.log(JSON.stringify({ ok: false }));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true }));
