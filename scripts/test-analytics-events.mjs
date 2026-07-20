#!/usr/bin/env node
/**
 * P1-32 — Frontend event taxonomy and instrumentation.
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

const APPROVED_EVENTS = [
  "page_view",
  "listing_filter_apply",
  "favorite_toggle",
  "compare_toggle",
  "lead_intent_submit",
  "generate_lead",
];

check("analytics-events:taxonomy types match approved names", () => {
  const types = read("src/lib/analytics/types.ts");
  for (const name of APPROVED_EVENTS) {
    assert.ok(types.includes(`"${name}"`), name);
  }
  assert.ok(types.includes("ANALYTICS_PII_KEYS"), "pii blocklist");
});

check("analytics-events:helpers export approved trackers", () => {
  const events = read("src/lib/analytics/events.ts");
  assert.ok(events.includes("trackPageView"));
  assert.ok(events.includes("trackListingFilterApply"));
  assert.ok(events.includes("trackFavoriteToggle"));
  assert.ok(events.includes("trackCompareToggle"));
  assert.ok(events.includes("trackLeadIntentSubmit"));
  assert.ok(events.includes("trackGenerateLead"));
});

check("analytics-events:dedupe and consent no-call", () => {
  const adapter = read("src/lib/analytics/adapter.ts");
  assert.ok(adapter.includes("DEDUPE_WINDOW_MS"), "dedupe window");
  assert.ok(adapter.includes("isDuplicate"), "dedupe guard");
  assert.ok(
    adapter.includes("if (!isAnalyticsConsentGranted()) return"),
    "denied consent no calls",
  );
});

check("analytics-events:instrumentation on target surfaces", () => {
  assert.ok(
    read("src/components/favorites/favorite-button.tsx").includes(
      "trackFavoriteToggle",
    ),
  );
  assert.ok(
    read("src/components/compare/compare-button.tsx").includes("trackCompareToggle"),
  );
  assert.ok(
    read("src/components/listings/listing-filters.tsx").includes(
      "trackListingFilterApply",
    ),
  );
  const lead = read("src/components/projects/project-lead-form.tsx");
  assert.ok(lead.includes("trackGenerateLead"));
  assert.ok(lead.includes("trackLeadIntentSubmit"));
  assert.ok(lead.includes("if (!state.ok) return"), "conversion after success");
  assert.ok(
    read("src/components/analytics/page-view-tracker.tsx").includes("trackPageView"),
  );
});

check("analytics-events:filter keys exclude free-text q", () => {
  const filters = read("src/components/listings/listing-filters.tsx");
  assert.ok(filters.includes("FILTER_KEY_ALLOWLIST"));
  const allowlistMatch = filters.match(
    /FILTER_KEY_ALLOWLIST = \[([\s\S]*?)\] as const/,
  );
  assert.ok(allowlistMatch, "allowlist block");
  assert.ok(!allowlistMatch[1].includes('"q"'), "q not tracked as filter key");
});

check("analytics-events:stripPii removes blocked keys", () => {
  const adapter = read("src/lib/analytics/adapter.ts");
  assert.ok(adapter.includes("stripPii"));
  assert.ok(adapter.includes("ANALYTICS_PII_KEYS"));
});

check("analytics-events:modules exist", () => {
  assert.ok(existsSync(resolve(root, "src/lib/analytics/events.ts")));
  assert.ok(existsSync(resolve(root, "src/lib/analytics/adapter.ts")));
});

if (process.exitCode) {
  console.log(JSON.stringify({ ok: false }));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true }));
