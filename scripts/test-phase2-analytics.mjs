#!/usr/bin/env node
/**
 * Phase 2D — Analytics expansion + i18n policy artifacts (P2-080–083).
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const events = fs.readFileSync(
  path.join(root, "src/lib/analytics/events.ts"),
  "utf8",
);
assert.match(events, /trackMapView/);
assert.match(events, /isPhase2AnalyticsExpansionEnabled/);
assert.match(events, /trackAiRecommendImpression/);

const types = fs.readFileSync(
  path.join(root, "src/lib/analytics/types.ts"),
  "utf8",
);
assert.match(types, /map_view/);
assert.match(types, /ai_invest_session_start/);

const phase2 = fs.readFileSync(
  path.join(root, "src/lib/analytics/phase2-events.ts"),
  "utf8",
);
assert.match(phase2, /PHASE2_ANALYTICS_EVENTS/);

assert.ok(
  fs.existsSync(path.join(root, "docs/phase2/m8/P2-082_MULTILINGUAL_GROWTH.md")),
);
assert.ok(
  fs.existsSync(path.join(root, "docs/phase2/m8/P2-083_ADMIN_I18N_POLICY.md")),
);

const en = JSON.parse(
  fs.readFileSync(path.join(root, "src/dictionaries/en.json"), "utf8"),
);
const zh = JSON.parse(
  fs.readFileSync(path.join(root, "src/dictionaries/zh.json"), "utf8"),
);
const th = JSON.parse(
  fs.readFileSync(path.join(root, "src/dictionaries/th.json"), "utf8"),
);
for (const [loc, d] of [
  ["en", en],
  ["zh", zh],
  ["th", th],
]) {
  assert.ok(d.map?.title, `${loc}.map`);
  assert.ok(d.tools?.mortgageTitle, `${loc}.tools`);
  assert.equal(Object.keys(d.map).length, Object.keys(en.map).length);
  assert.equal(Object.keys(d.tools).length, Object.keys(en.tools).length);
}

console.log("PASS: phase2 analytics + i18n");
