#!/usr/bin/env node
/**
 * Regression: project nearby/facility normalization for every observed shape.
 * Run: node --experimental-strip-types scripts/test-project-content-normalize.mjs
 */
import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const mod = await import(
  pathToFileURL(
    resolve(process.cwd(), "src/lib/projects/normalize-project-content.ts"),
  ).href
);

const {
  normalizePoi,
  normalizePois,
  normalizeFacilities,
  normalizeUnitTypes,
  coerceLocalizedText,
} = mod;

function ok(message) {
  console.log(`PASS: ${message}`);
}

const cases = [];

function check(name, fn) {
  try {
    fn();
    ok(name);
    cases.push(name);
  } catch (error) {
    console.error(`FAIL: ${name} — ${error.message}`);
    process.exitCode = 1;
  }
}

check("null POI omitted", () => {
  assert.equal(normalizePoi(null), null);
});

check("missing name omitted", () => {
  assert.equal(normalizePoi({}), null);
  assert.equal(normalizePoi({ name: null }), null);
  assert.equal(normalizePoi({ name: { en: "  " } }), null);
});

check("missing name.en keeps other locale (no fabrication)", () => {
  const poi = normalizePoi({ name: { zh: "学校", th: "" } });
  assert.ok(poi);
  assert.equal(poi.name.zh, "学校");
  assert.equal(poi.name.en, "");
});

check("localized object + distance_m", () => {
  const poi = normalizePoi({
    name: { en: "BTS Asok", zh: "Asok", th: "อโศก" },
    distance_m: 400,
  });
  assert.equal(poi.name.en, "BTS Asok");
  assert.equal(poi.distance, "400 m");
});

check("string POI", () => {
  assert.equal(normalizePoi("Terminal 21").name.en, "Terminal 21");
});

check("incomplete nearby filtered", () => {
  assert.equal(
    normalizePois([null, { name: { en: "A" } }, undefined, {}, ""]).length,
    1,
  );
});

check("flat facilities {key,name,source}", () => {
  const zones = normalizeFacilities([
    {
      key: "pool",
      name: { en: "Swimming pool", zh: "泳池", th: "สระ" },
      source: "propertyhub",
    },
    null,
    { key: "gym", name: { en: "Fitness" } },
  ]);
  assert.equal(zones.length, 2, "group by source without inventing headings");
  const withSource = zones.find((z) => z.source === "propertyhub");
  const without = zones.find((z) => !z.source);
  assert.ok(withSource);
  assert.equal(withSource.zone.en, "", "must not invent zone heading");
  assert.equal(withSource.items[0].en, "Swimming pool");
  assert.ok(without);
  assert.equal(without.items[0].en, "Fitness");
});

check("zoned facilities preserved", () => {
  const zones = normalizeFacilities([
    {
      zone: { en: "Leisure", zh: "休闲", th: "นันทนาการ" },
      items: [{ en: "Pool", zh: "池", th: "สระ" }],
    },
  ]);
  assert.equal(zones[0].zone.en, "Leisure");
  assert.equal(zones[0].items[0].en, "Pool");
});

check("string unit types without inventing area", () => {
  const units = normalizeUnitTypes(["Studio", "1 Bedroom"]);
  assert.equal(units.length, 2);
  assert.equal(units[0].label.en, "Studio");
  assert.equal(units[0].area_sqm, 0);
});

check("coerceLocalizedText never invents", () => {
  assert.equal(coerceLocalizedText(null), null);
  assert.equal(coerceLocalizedText(""), null);
  assert.equal(coerceLocalizedText({ en: "  " }), null);
});

if (process.exitCode) {
  console.log(JSON.stringify({ ok: false, cases: cases.length }));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true, cases: cases.length }));
