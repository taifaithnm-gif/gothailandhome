#!/usr/bin/env node
/**
 * Developer evidence presentation invariants (matrix is read-only).
 * Run: node scripts/test-developer-evidence-labels.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const matrix = JSON.parse(
  readFileSync(
    resolve(
      process.cwd(),
      "pipelines/factory/developer-master/completeness_matrix.json",
    ),
    "utf8",
  ),
);

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

function toPresentationClass(status) {
  switch (status) {
    case "OFFICIAL":
      return "OFFICIAL";
    case "FACTORY":
    case "MIXED":
      return "FACTORY_LINKED";
    case "PLACEHOLDER":
    case "MISSING":
      return "UNVERIFIED";
    case "PRESENT":
    case "SET_OR_CATALOG":
    case "CITY_ONLY":
      return "PARTIAL";
    default:
      return "UNVERIFIED";
  }
}

function evidenceLabelKey(cls) {
  switch (cls) {
    case "OFFICIAL":
      return "evidenceOfficial";
    case "PARTIAL":
      return "evidencePartial";
    case "FACTORY_LINKED":
      return "evidenceFactory";
    default:
      return "evidenceUnavailable";
  }
}

check("matrix has 20 developers", () => {
  assert.equal(matrix.length, 20);
});

check("all logos remain PLACEHOLDER (no unofficial promotion)", () => {
  for (const row of matrix) {
    assert.equal(row.S_logo_source, "PLACEHOLDER", row.slug);
  }
});

check("names and websites stay OFFICIAL", () => {
  for (const row of matrix) {
    assert.equal(row.S_official_name, "OFFICIAL", row.slug);
    assert.equal(row.S_official_website, "OFFICIAL", row.slug);
  }
});

check("presentation mapping does not upgrade SET_OR_CATALOG", () => {
  assert.equal(toPresentationClass("SET_OR_CATALOG"), "PARTIAL");
  assert.equal(toPresentationClass("CITY_ONLY"), "PARTIAL");
  assert.equal(toPresentationClass("FACTORY"), "FACTORY_LINKED");
  assert.equal(toPresentationClass("PLACEHOLDER"), "UNVERIFIED");
  assert.equal(toPresentationClass("OFFICIAL"), "OFFICIAL");
});

check("user-facing label keys", () => {
  assert.equal(evidenceLabelKey("OFFICIAL"), "evidenceOfficial");
  assert.equal(evidenceLabelKey("PARTIAL"), "evidencePartial");
  assert.equal(evidenceLabelKey("FACTORY_LINKED"), "evidenceFactory");
  assert.equal(evidenceLabelKey("UNVERIFIED"), "evidenceUnavailable");
});

check("dictionary keys exist", () => {
  const en = JSON.parse(
    readFileSync(resolve(process.cwd(), "src/dictionaries/en.json"), "utf8"),
  );
  for (const key of [
    "evidenceOfficial",
    "evidencePartial",
    "evidenceFactory",
    "evidenceUnavailable",
    "trustBody",
    "contactPlatformNote",
  ]) {
    assert.ok(en.developers[key], key);
  }
});

check("mqdc retains OFFICIAL year/HQ without change", () => {
  const mqdc = matrix.find((r) => r.slug === "mqdc");
  assert.ok(mqdc);
  assert.equal(mqdc.S_established_year, "OFFICIAL");
  assert.equal(mqdc.S_headquarters, "OFFICIAL");
});

if (process.exitCode) {
  console.log(JSON.stringify({ ok: false }));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true }));
