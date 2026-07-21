#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
for (const rel of [
  "docs/phase2/m4/P2-040_PARTNER_RBAC.md",
  "docs/phase2/m4/P2-041_DEVELOPER_MANAGEMENT.md",
  "docs/phase2/m4/P2-042_AGENT_WORKFLOW.md",
  "docs/phase2/m4/P2-043_PARTNER_ONBOARDING.md",
  "src/lib/partners/rbac.ts",
  "src/lib/partners/onboarding.ts",
  "src/app/partners/app/developer/page.tsx",
  "src/app/partners/app/agent/page.tsx",
]) {
  assert.ok(fs.existsSync(path.join(root, rel)), `missing ${rel}`);
}

const rbac = await import(path.join(root, "src/lib/partners/rbac.ts"));
assert.equal(rbac.partnerHasPermission("developer", "org.update"), true);
assert.equal(rbac.partnerHasPermission("developer", "leads.handoff"), false);
assert.equal(rbac.partnerHasPermission("agent", "listings.steward"), true);
assert.equal(rbac.PARTNER_PLANE_RULES.cannotAccessAdmin, true);

const robots = fs.readFileSync(path.join(root, "src/app/robots.ts"), "utf8");
assert.match(robots, /\/partners\/app/);

console.log("PASS: phase2 partner rbac + portal routes");
