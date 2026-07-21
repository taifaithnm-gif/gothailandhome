#!/usr/bin/env node
/** Phase 2 CRM adapter contracts. */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const required = [
  "docs/phase2/m2/P2-025_CRM_PROVIDER_SELECTION.md",
  "docs/phase2/m2/P2-026_CRM_ADAPTER_CONTRACT.md",
  "src/lib/crm/adapter.ts",
  "src/lib/crm/webhook.ts",
];

for (const rel of required) {
  assert.ok(fs.existsSync(path.join(root, rel)), `missing ${rel}`);
}

const { mapLeadToCrmPayload, verifyCrmWebhookSignature } = await import(
  path.join(root, "src/lib/crm/adapter.ts")
);

const payload = mapLeadToCrmPayload({
  id: "00000000-0000-0000-0000-000000000001",
  leadType: "find_home",
  status: "new",
  email: "a@example.com",
  name: "Test",
  locale: "en",
});
assert.equal(payload.external_id, "00000000-0000-0000-0000-000000000001");
assert.equal(payload.channel, "gothailandhome");

const crypto = await import("node:crypto");
const body = JSON.stringify({ ok: true });
const secret = "test-secret";
const sig = crypto.createHmac("sha256", secret).update(body).digest("hex");
assert.equal(verifyCrmWebhookSignature(body, sig, secret), true);
assert.equal(verifyCrmWebhookSignature(body, "bad", secret), false);

console.log("PASS: phase2 CRM mapping + webhook signature");
