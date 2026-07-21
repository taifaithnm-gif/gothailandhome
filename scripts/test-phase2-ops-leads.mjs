#!/usr/bin/env node
/** Phase 2 ops leads contracts — expanded as M2 ships. */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const required = [
  "docs/phase2/m2/P2-020_LEAD_LIFECYCLE.md",
  "docs/phase2/m2/P2-021_LEAD_INBOX_UX.md",
  "docs/phase2/m2/P2-022_LEAD_CAPTURE_COMPAT.md",
  "src/lib/ops/lead-lifecycle.ts",
  "src/app/admin/ops/leads/page.tsx",
];

for (const rel of required) {
  assert.ok(fs.existsSync(path.join(root, rel)), `missing ${rel}`);
}

const { LEAD_STATUSES, canTransitionLeadStatus, SLA_HOURS_BY_STATUS } =
  await import(path.join(root, "src/lib/ops/lead-lifecycle.ts"));

assert.ok(LEAD_STATUSES.includes("new"));
assert.ok(LEAD_STATUSES.includes("won"));
assert.equal(canTransitionLeadStatus("new", "assigned"), true);
assert.equal(canTransitionLeadStatus("won", "new"), false);
assert.ok(typeof SLA_HOURS_BY_STATUS.new === "number");

console.log("PASS: phase2 ops leads lifecycle + inbox route present");
