#!/usr/bin/env node
/**
 * Contract tests for Phase 2 feature-flag policy (P2-003).
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const flagSrc = fs.readFileSync(
  path.join(root, "src/lib/feature-flags/index.ts"),
  "utf8",
);
const policy = fs.readFileSync(
  path.join(root, "docs/phase2/m0/P2-003_FEATURE_FLAG_POLICY.md"),
  "utf8",
);

assert.match(flagSrc, /FEATURE_P2_ACCOUNT/);
assert.match(flagSrc, /FEATURE_P2_OPS_LEADS/);
assert.match(flagSrc, /FEATURE_P2_NOTIFICATIONS/);
assert.match(flagSrc, /FEATURE_P2_CRM_SYNC/);
assert.match(flagSrc, /FEATURE_P2_ACQUISITION/);
assert.match(flagSrc, /FEATURE_P2_PARTNER_PORTAL/);
assert.match(flagSrc, /FEATURE_P2_MAP/);
assert.match(flagSrc, /FEATURE_P2_TOOLS/);
assert.match(flagSrc, /FEATURE_P2_AI/);
assert.match(flagSrc, /FEATURE_P2_ANALYTICS_EXPANSION/);
assert.match(flagSrc, /getPhase2FeatureFlags/);
assert.match(policy, /Defaults are \*\*off\*\*/);

// Defaults must be false when env unset
delete process.env.FEATURE_P2_ACCOUNT;
delete process.env.NEXT_PUBLIC_FEATURE_P2_ACCOUNT;
delete process.env.FEATURE_P2_OPS_LEADS;
delete process.env.FEATURE_P2_NOTIFICATIONS;
delete process.env.FEATURE_P2_CRM_SYNC;
delete process.env.FEATURE_P2_ACQUISITION;
delete process.env.NEXT_PUBLIC_FEATURE_P2_ACQUISITION;
delete process.env.FEATURE_P2_PARTNER_PORTAL;
delete process.env.NEXT_PUBLIC_FEATURE_P2_PARTNER_PORTAL;
delete process.env.FEATURE_P2_MAP;
delete process.env.NEXT_PUBLIC_FEATURE_P2_MAP;
delete process.env.FEATURE_P2_TOOLS;
delete process.env.NEXT_PUBLIC_FEATURE_P2_TOOLS;
delete process.env.FEATURE_P2_AI;
delete process.env.NEXT_PUBLIC_FEATURE_P2_AI;
delete process.env.FEATURE_P2_ANALYTICS_EXPANSION;

const { getPhase2FeatureFlags } = await import(
  path.join(root, "src/lib/feature-flags/index.ts")
);
const flags = getPhase2FeatureFlags();
assert.equal(flags.account, false);
assert.equal(flags.opsLeads, false);
assert.equal(flags.notifications, false);
assert.equal(flags.crmSync, false);
assert.equal(flags.acquisition, false);
assert.equal(flags.partnerPortal, false);
assert.equal(flags.map, false);
assert.equal(flags.tools, false);
assert.equal(flags.ai, false);
assert.equal(flags.analyticsExpansion, false);

console.log("PASS: phase2 feature flags default off + policy present");
