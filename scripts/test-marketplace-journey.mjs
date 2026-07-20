#!/usr/bin/env node
/**
 * P1-21 — Contact / marketplace journey consolidation.
 *
 * Deterministic route matrix: one canonical entry per audience; hub-first
 * chrome; contact roles accurate; private submissions never presented as
 * published. No live network / Windows01.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  CONTACT_PATH,
  MARKETPLACE_HUB_PATH,
  MARKETPLACE_JOURNEYS,
  getJourneyByAudience,
  listJourneyPaths,
} from "../src/lib/marketplace/journey.ts";
import { getMarketplaceEntries } from "../src/lib/marketplace/entry-paths.ts";

const root = process.cwd();

function read(rel) {
  return readFileSync(resolve(root, rel), "utf8");
}

function ok(message) {
  console.log(`PASS: ${message}`);
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

check("journey:six audiences with unique paths", () => {
  assert.equal(MARKETPLACE_JOURNEYS.length, 6);
  const audiences = MARKETPLACE_JOURNEYS.map((row) => row.audience);
  assert.deepEqual(audiences.sort(), [
    "agency",
    "buyer",
    "developer",
    "owner",
    "platform_support",
    "viewing",
  ]);
  const paths = listJourneyPaths();
  assert.equal(new Set(paths).size, paths.length, "no duplicate paths");
});

check("journey:hub entries cover five marketplace cards", () => {
  const dict = JSON.parse(read("src/dictionaries/en.json"));
  const entries = getMarketplaceEntries(dict);
  const hubIds = MARKETPLACE_JOURNEYS.map((row) => row.hubEntryId).filter(
    Boolean,
  );
  assert.equal(hubIds.length, 5);
  for (const id of hubIds) {
    assert.ok(
      entries.some((entry) => entry.id === id),
      `hub missing ${id}`,
    );
  }
  for (const entry of entries) {
    const journey = MARKETPLACE_JOURNEYS.find(
      (row) => row.hubEntryId === entry.id,
    );
    assert.ok(journey, `no journey for hub entry ${entry.id}`);
    assert.equal(entry.href, journey.path, `${entry.id} path mismatch`);
  }
});

check("journey:private submissions flagged for every intake", () => {
  for (const row of MARKETPLACE_JOURNEYS) {
    assert.equal(
      row.privateSubmission,
      true,
      `${row.audience} must stay private`,
    );
  }
});

check("journey:viewing form stays on listing detail", () => {
  const viewing = getJourneyByAudience("viewing");
  assert.equal(viewing.path, "/properties");
  assert.equal(viewing.formPath, "/properties/[id]");
  assert.ok(
    read("src/components/property/viewing-request-form.tsx").includes(
      "submitViewingRequestLead",
    ),
  );
  assert.ok(
    read("src/components/property/listing-contact-card.tsx").includes(
      "ViewingRequestForm",
    ),
  );
});

check("journey:chrome is hub-first (no peer FMH/List/Partners deep links)", () => {
  const nav = read("src/lib/navigation/site-nav.ts");
  assert.ok(nav.includes('"/marketplace"') || nav.includes("'/marketplace'"));
  assert.ok(nav.includes('"/contact"') || nav.includes("'/contact'"));
  // Marketplace group must not peer-link Find My Home / List Property.
  assert.ok(
    !nav.includes('id: "find-my-home"'),
    "find-my-home must not be chrome peer",
  );
  assert.ok(
    !nav.includes('id: "list-property"'),
    "list-property must not be chrome peer",
  );
  // Partners routes through the hub, not developers-only.
  assert.ok(
    nav.includes('id: "partners"') &&
      nav.includes('localePath(locale, "/marketplace")'),
    "partners chrome goes through marketplace hub",
  );
  assert.ok(
    !nav.includes('localePath(locale, "/partners/developers")'),
    "partners chrome must not deep-link developers only",
  );
});

check("journey:contact page roles + marketplace handoff", () => {
  const page = read("src/app/[lang]/contact/page.tsx");
  assert.ok(page.includes("assertApplePlatformCustomerSuccessOnly"));
  assert.ok(page.includes("PlatformSupportForm"));
  assert.ok(page.includes("PlatformCustomerSuccess"));
  assert.ok(page.includes("MARKETPLACE_HUB_PATH"));
  assert.ok(page.includes("contact-privacy-note"));
  assert.ok(page.includes("contact-journey"));
  assert.equal(CONTACT_PATH, "/contact");
  assert.equal(MARKETPLACE_HUB_PATH, "/marketplace");
});

check("journey:hub promise discloses private ≠ published", () => {
  for (const locale of ["en", "zh", "th"]) {
    const dict = JSON.parse(read(`src/dictionaries/${locale}.json`));
    const promise = dict.marketplace.hubPromise;
    assert.ok(
      /private|私密|ส่วนตัว|pending|审核|ตรวจสอบ|never|绝不|ไม่/i.test(promise),
      `${locale} hubPromise must disclose private/pending`,
    );
    assert.ok(dict.contact.journeyTitle, `${locale}.contact.journeyTitle`);
    assert.ok(dict.contact.privacyNote, `${locale}.contact.privacyNote`);
    assert.ok(
      dict.marketplace.findPrivacyNote,
      `${locale} findPrivacyNote`,
    );
    assert.ok(dict.marketplace.listReviewNote, `${locale} listReviewNote`);
    assert.ok(dict.marketplace.successPrivate, `${locale} successPrivate`);
  }
});

check("journey:form pages breadcrumb to hub", () => {
  for (const file of [
    "src/app/[lang]/find-my-home/page.tsx",
    "src/app/[lang]/list-your-property/page.tsx",
    "src/app/[lang]/partners/developers/page.tsx",
    "src/app/[lang]/partners/agencies/page.tsx",
  ]) {
    const src = read(file);
    assert.ok(
      src.includes('"/marketplace"') || src.includes("'/marketplace'"),
      `${file} breadcrumbs to hub`,
    );
  }
});

check("journey:required files exist", () => {
  for (const file of [
    "src/lib/marketplace/journey.ts",
    "src/lib/marketplace/entry-paths.ts",
    "src/app/[lang]/marketplace/page.tsx",
    "src/app/[lang]/contact/page.tsx",
    "src/lib/navigation/site-nav.ts",
  ]) {
    assert.ok(existsSync(resolve(root, file)), file);
  }
});

if (process.exitCode) {
  console.log(JSON.stringify({ ok: false }));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true }));
