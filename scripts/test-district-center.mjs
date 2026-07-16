#!/usr/bin/env node
/**
 * District Center package + page structure checks.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

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

check("district center page + component exist", () => {
  assert.ok(
    existsSync(resolve(root, "src/app/[lang]/districts/[slug]/page.tsx")),
  );
  assert.ok(
    existsSync(resolve(root, "src/components/district/district-center.tsx")),
  );
  assert.ok(existsSync(resolve(root, "src/lib/districts/package.ts")));
});

check("page wires required sections", () => {
  const src = readFileSync(
    resolve(root, "src/components/district/district-center.tsx"),
    "utf8",
  );
  for (const id of [
    "overview",
    "map",
    "projects",
    "listings",
    "transit",
    "lifestyle",
    "schools",
    "hospitals",
    "shopping",
    "knowledge",
    "find-my-home",
    "platform-support",
  ]) {
    assert.ok(src.includes(`id="${id}"`), id);
  }
  assert.ok(src.includes("PlatformCustomerSuccess"));
  assert.ok(src.includes("/find-my-home"));
});

check("package loader does not invent amenities", () => {
  const src = readFileSync(
    resolve(root, "src/lib/districts/package.ts"),
    "utf8",
  );
  assert.ok(src.includes("never invent"));
  assert.ok(src.includes("normalizeAmenities"));
});

check("bangkok district packages have coords; empty amenity arrays allowed", () => {
  const dir = join(root, "content/areas/bangkok/districts");
  const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
  assert.equal(files.length, 50);
  let withCoords = 0;
  for (const file of files) {
    const pkg = JSON.parse(readFileSync(join(dir, file), "utf8"));
    assert.ok(Array.isArray(pkg.schools));
    assert.ok(Array.isArray(pkg.hospitals));
    assert.ok(Array.isArray(pkg.shopping));
    assert.ok(Array.isArray(pkg.transportation));
    if (pkg.metadata?.latitude != null && pkg.metadata?.longitude != null) {
      withCoords += 1;
    }
    const inv = JSON.stringify(pkg.investment_summary || {});
    assert.ok(
      !/%\s*yield/i.test(inv) || /does not include|不含|ไม่มี/.test(inv),
      `${file} must not invent yield stats`,
    );
  }
  assert.equal(withCoords, 50);
});

check("dictionary districtCenter keys en/zh/th", () => {
  for (const locale of ["en", "zh", "th"]) {
    const dict = JSON.parse(
      readFileSync(resolve(root, `src/dictionaries/${locale}.json`), "utf8"),
    );
    for (const key of [
      "overview",
      "map",
      "projects",
      "listings",
      "transit",
      "lifestyle",
      "schools",
      "hospitals",
      "shopping",
      "knowledge",
      "findMyHomeCta",
      "platformSupport",
      "unknown",
    ]) {
      assert.ok(dict.districtCenter[key], `${locale}.${key}`);
    }
  }
});

if (process.exitCode) {
  console.log(JSON.stringify({ ok: false }));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true }));
