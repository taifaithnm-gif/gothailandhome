#!/usr/bin/env node
/**
 * Phase 2C — Finance & legal tools (P2-060–064).
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const { calculateMortgage, FINANCE_DISCLAIMER } = await import(
  path.join(root, "src/lib/finance/mortgage.ts")
);
const {
  LEGAL_CHECKLIST,
  LEGAL_WORKFLOW_DISCLAIMER,
  containsForbiddenLegalAdvice,
} = await import(path.join(root, "src/lib/legal/workflow.ts"));

const ok = calculateMortgage({
  principalThb: 3_000_000,
  annualRatePercent: 5,
  termYears: 30,
});
assert.ok(!("error" in ok));
assert.ok(ok.monthlyPaymentThb > 0);
assert.ok(FINANCE_DISCLAIMER.toLowerCase().includes("not financial advice"));

const zero = calculateMortgage({
  principalThb: 1_200_000,
  annualRatePercent: 0,
  termYears: 10,
});
assert.ok(!("error" in zero));
assert.equal(zero.monthlyPaymentThb, 10000);

assert.equal(calculateMortgage({ principalThb: -1, annualRatePercent: 5, termYears: 10 }).error != null, true);

assert.ok(LEGAL_CHECKLIST.length >= 5);
assert.ok(LEGAL_WORKFLOW_DISCLAIMER.toLowerCase().includes("not legal advice"));
assert.equal(containsForbiddenLegalAdvice("you qualify for freehold"), true);
assert.equal(containsForbiddenLegalAdvice("Ask counsel about tenure type"), false);

for (const rel of [
  "src/app/[lang]/tools/page.tsx",
  "src/app/[lang]/tools/mortgage/page.tsx",
  "src/app/[lang]/tools/legal/page.tsx",
]) {
  const src = fs.readFileSync(path.join(root, rel), "utf8");
  assert.match(src, /isPhase2ToolsEnabled/);
}

console.log("PASS: phase2 tools (finance/legal)");
