#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
for (const rel of [
  "docs/phase2/m3/P2-031_ACQUISITION_STATE_MACHINE.md",
  "docs/phase2/m3/P2-032_EVIDENCE_CHECKLIST.md",
  "docs/phase2/m3/P2-035_PUBLISH_BRIDGE.md",
  "src/lib/acquisition/state-machine.ts",
  "src/lib/acquisition/evidence.ts",
  "src/lib/acquisition/publish-bridge.ts",
  "src/app/admin/ops/acquisition/page.tsx",
]) {
  assert.ok(fs.existsSync(path.join(root, rel)), `missing ${rel}`);
}

const sm = await import(
  path.join(root, "src/lib/acquisition/state-machine.ts")
);
assert.equal(sm.canTransitionAcquisition("submitted", "in_review"), true);
assert.equal(sm.canTransitionAcquisition("published", "approved"), false);
assert.equal(
  sm.canTransitionAcquisition("submitted", "withdrawn", "submitter"),
  true,
);

const ev = await import(path.join(root, "src/lib/acquisition/evidence.ts"));
const sat = ev.evidenceFromIntakePayload({
  consent: true,
  authorization: true,
  project: "Ashton",
  price: "5000000",
  location: "Ashton",
  propertyType: "condo",
  source: "list_your_property_form",
});
assert.equal(ev.canPublishWithEvidence(sat), true);
assert.equal(
  ev.canPublishWithEvidence(ev.emptyEvidenceSatisfaction()),
  false,
);

const bridge = await import(
  path.join(root, "src/lib/acquisition/publish-bridge.ts")
);
const built = bridge.buildDraftPropertyFromCase(
  {
    id: "11111111-1111-1111-1111-111111111111",
    titleHint: "Ashton Asoke",
    propertyType: "condo",
    listingType: "sale",
    priceText: "12,000,000",
    projectName: "Ashton Asoke",
    bedroomsText: "1",
    bathroomsText: "1",
    areaText: "35",
    locale: "en",
    submitterName: "A",
    notes: null,
  },
  "loc-1",
);
assert.ok(!("error" in built));
assert.equal(built.status, "draft");
assert.equal(built.price_thb, 12000000);
const missingLoc = bridge.buildDraftPropertyFromCase(
  {
    id: "11111111-1111-1111-1111-111111111111",
    titleHint: "X",
    propertyType: "condo",
    listingType: "sale",
    priceText: "1",
    projectName: "X",
    bedroomsText: null,
    bathroomsText: null,
    areaText: null,
    locale: "en",
    submitterName: null,
    notes: null,
  },
  "",
);
assert.ok("error" in missingLoc);

console.log("PASS: phase2 acquisition state/evidence/bridge");
