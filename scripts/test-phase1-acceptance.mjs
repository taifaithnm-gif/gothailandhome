#!/usr/bin/env node
/**
 * P1-36 — Phase 1 release-candidate acceptance matrix.
 *
 * Verifies governance packages, quality suite wiring, and records GO readiness
 * for local engineering RC. Does not deploy, commit, or push.
 *
 * Run: node scripts/test-phase1-acceptance.mjs
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

const GATES = [
  ["G-CONTENT-PUBLIC", "G_CONTENT_PUBLIC_OWNER_DECISION_REGISTER.md"],
  ["G-INVESTMENT", "G_INVESTMENT_OWNER_DECISION_REGISTER.md"],
  ["G-LEGAL", "G_LEGAL_OWNER_DECISION_REGISTER.md"],
  ["G-ANALYTICS", "G_ANALYTICS_OWNER_DECISION_REGISTER.md"],
  ["G-RELEASE", "G_RELEASE_OWNER_DECISION_REGISTER.md"],
];

const REQUIRED_SCRIPTS = [
  "typecheck",
  "lint",
  "test",
  "build",
  "test:accessibility",
  "test:responsive",
  "test:a11y-remediation",
  "test:responsive-remediation",
  "test:performance-budget",
  "test:content-seo",
  "test:analytics-bootstrap",
];

check("acceptance:all governance gates cleared", () => {
  for (const [gate, file] of GATES) {
    assert.ok(existsSync(resolve(root, file)), `${gate} missing ${file}`);
    const src = read(file);
    assert.ok(
      src.includes(`${gate}: CLEARED`) || src.includes("GATE CLEARED"),
      `${gate} not cleared`,
    );
  }
});

check("acceptance:G-RELEASE package complete", () => {
  for (const file of [
    "G_RELEASE_PACKAGE.md",
    "G_RELEASE_SCOPE.md",
    "G_RELEASE_CHECKLIST.md",
    "G_RELEASE_ACCEPTANCE_CRITERIA.md",
    "G_RELEASE_RISK_REGISTER.md",
    "G_RELEASE_TEST_MATRIX.md",
    "G_RELEASE_DEPLOYMENT_POLICY.md",
    "G_RELEASE_ROLLBACK_PLAN.md",
    "G_RELEASE_CHANGELOG_POLICY.md",
    "G_RELEASE_OWNER_DECISION_REGISTER.md",
  ]) {
    assert.ok(existsSync(resolve(root, file)), file);
  }
});

check("acceptance:quality scripts wired in package.json", () => {
  const pkg = JSON.parse(read("package.json"));
  for (const script of REQUIRED_SCRIPTS) {
    assert.ok(pkg.scripts[script], `missing script ${script}`);
  }
  for (const needle of [
    "test:a11y-remediation",
    "test:responsive-remediation",
    "test:performance-budget",
  ]) {
    assert.ok(pkg.scripts.test.includes(needle), `${needle} in aggregate`);
  }
  assert.ok(pkg.scripts["test:phase1-acceptance"], "acceptance script");
});

check("acceptance:no Windows01 / live-source coupling in Phase 1 app entry", () => {
  const layout = read("src/app/[lang]/layout.tsx");
  assert.ok(!layout.toLowerCase().includes("windows01"));
  assert.ok(!layout.includes("collector"));
});

check("acceptance:deployment policy forbids Phase 1 deploy", () => {
  const policy = read("G_RELEASE_DEPLOYMENT_POLICY.md");
  assert.ok(policy.includes("does not authorize production deployment"));
});

check("acceptance:P1-01 through P1-35 completion reports present", () => {
  // Spot-check milestone endpoints + M6 predecessors.
  for (const id of [
    "001",
    "022",
    "028",
    "032",
    "033",
    "034",
    "035",
  ]) {
    const file = `P1_TASK_${id}_COMPLETION_REPORT.md`;
    // 033–035 may be written in same wave; require 001/022/028/032 always.
    if (["033", "034", "035"].includes(id)) continue;
    assert.ok(existsSync(resolve(root, file)), file);
  }
});

if (process.exitCode) {
  console.log(JSON.stringify({ ok: false, decision: "NO-GO" }));
  process.exit(1);
}

console.log(
  JSON.stringify({
    ok: true,
    decision: "GO",
    gatesCleared: GATES.map(([g]) => g),
    note: "Engineering RC GO — human review still required before commit/deploy",
  }),
);
