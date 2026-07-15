#!/usr/bin/env node
/**
 * Evidence presentation invariants (completeness matrix is read-only).
 * Does not import server-only modules.
 * Run: node scripts/test-project-evidence-labels.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const matrix = JSON.parse(
  readFileSync(
    resolve(
      process.cwd(),
      "pipelines/factory/project-master/completeness_matrix.json",
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

function evidenceLabelKey(evidence) {
  switch (evidence) {
    case "OFFICIAL":
      return "evidenceOfficial";
    case "VERIFIED_PORTAL":
      return "evidencePortal";
    case "DERIVED":
      return "evidenceDerived";
    default:
      return "evidenceUnavailable";
  }
}

function toVerificationLevel(evidence) {
  switch (evidence) {
    case "OFFICIAL":
      return "official";
    case "VERIFIED_PORTAL":
      return "verified_portal";
    case "DERIVED":
      return "derived";
    default:
      return "unverified";
  }
}

function mayPresentFact(evidence) {
  return (
    evidence === "OFFICIAL" ||
    evidence === "VERIFIED_PORTAL" ||
    evidence === "DERIVED"
  );
}

function hasVerifiedCoordinates(row) {
  const lat = row.C_latitude;
  const lng = row.C_longitude;
  return (
    (lat === "OFFICIAL" || lat === "VERIFIED_PORTAL") &&
    (lng === "OFFICIAL" || lng === "VERIFIED_PORTAL")
  );
}

check("matrix has 50 projects", () => {
  assert.equal(matrix.projects.length, 50);
});

check("user-facing label keys", () => {
  assert.equal(evidenceLabelKey("OFFICIAL"), "evidenceOfficial");
  assert.equal(evidenceLabelKey("VERIFIED_PORTAL"), "evidencePortal");
  assert.equal(evidenceLabelKey("DERIVED"), "evidenceDerived");
  assert.equal(evidenceLabelKey("UNVERIFIED"), "evidenceUnavailable");
});

check("verification level mapping", () => {
  assert.equal(toVerificationLevel("OFFICIAL"), "official");
  assert.equal(toVerificationLevel("VERIFIED_PORTAL"), "verified_portal");
});

check("mayPresentFact rejects UNVERIFIED", () => {
  assert.equal(mayPresentFact("UNVERIFIED"), false);
  assert.equal(mayPresentFact("OFFICIAL"), true);
});

check("dense/sparse coordinate gate", () => {
  const dense = matrix.projects.find((p) => p.slug === "ashton-asoke");
  const sparse = matrix.projects.find(
    (p) => p.slug === "168-sukhothai-residences",
  );
  assert.ok(dense);
  assert.ok(sparse);
  assert.equal(hasVerifiedCoordinates(dense), true);
  assert.equal(hasVerifiedCoordinates(sparse), false);
});

check("classifications are from known enum only", () => {
  const allowed = new Set(matrix.classification_enum);
  for (const project of matrix.projects) {
    for (const [key, value] of Object.entries(project)) {
      if (!key.startsWith("C_")) continue;
      assert.ok(allowed.has(value), `${project.slug} ${key}=${value}`);
    }
  }
});

check("dictionary keys exist in en.json", () => {
  const en = JSON.parse(
    readFileSync(resolve(process.cwd(), "src/dictionaries/en.json"), "utf8"),
  );
  for (const key of [
    "evidenceOfficial",
    "evidencePortal",
    "evidenceDerived",
    "evidenceUnavailable",
  ]) {
    assert.ok(en.projectLanding[key], key);
  }
});

if (process.exitCode) {
  console.log(JSON.stringify({ ok: false }));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true }));
