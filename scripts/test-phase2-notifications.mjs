#!/usr/bin/env node
/** Phase 2 notifications contracts. */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const required = [
  "docs/phase2/m2/P2-023_NOTIFICATION_CHANNEL_STRATEGY.md",
  "docs/phase2/m2/P2-024_SAVED_SEARCH_ALERT_RULES.md",
  "src/lib/notifications/prefs.ts",
  "src/lib/notifications/outbox.ts",
];

for (const rel of required) {
  assert.ok(fs.existsSync(path.join(root, rel)), `missing ${rel}`);
}

const { defaultNotificationPrefs, shouldSendNotification } = await import(
  path.join(root, "src/lib/notifications/prefs.ts")
);
const prefs = defaultNotificationPrefs();
assert.equal(prefs.emailEnabled, true);
assert.equal(prefs.pushEnabled, false);
assert.equal(
  shouldSendNotification(prefs, "saved_search_match", new Date("2026-07-21T10:00:00Z")),
  true,
);
assert.equal(
  shouldSendNotification(
    { ...prefs, emailEnabled: false },
    "saved_search_match",
    new Date("2026-07-21T10:00:00Z"),
  ),
  false,
);
assert.equal(
  shouldSendNotification(
    { ...prefs, quietHoursStart: 22, quietHoursEnd: 7 },
    "saved_search_match",
    new Date("2026-07-21T23:30:00Z"),
  ),
  false,
);

console.log("PASS: phase2 notifications prefs + quiet hours");
