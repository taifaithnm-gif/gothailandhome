#!/usr/bin/env node
/**
 * P1-10 — Property detail trust and inquiry hierarchy contracts.
 *
 * Offline checks: contact-role separation, stale/missing fact honesty,
 * listing-scoped viewing/contact CTAs, metadata/JSON-LD wiring intact.
 * No live property sources / Windows01.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  buildListingInquiryContext,
  daysSinceUtc,
  displayOrUnknown,
  listingContactEscalationPath,
  listingFreshnessStatus,
  mayPresentPriceAsCurrent,
} from "../src/lib/property/listing-trust.ts";

const root = process.cwd();

const FILES = {
  page: "src/app/[lang]/properties/[id]/page.tsx",
  card: "src/components/property/listing-contact-card.tsx",
  viewing: "src/components/property/viewing-request-form.tsx",
  blocks: "src/components/marketplace/contact-blocks.tsx",
  actions: "src/app/[lang]/marketplace/actions.ts",
  trust: "src/lib/property/listing-trust.ts",
  schema: "src/lib/seo/schema.ts",
  en: "src/dictionaries/en.json",
  zh: "src/dictionaries/zh.json",
  th: "src/dictionaries/th.json",
};

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

function daysAgoIso(days, now = new Date()) {
  const d = new Date(now.getTime());
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString();
}

check("detail:required files exist", () => {
  for (const file of Object.values(FILES)) {
    assert.ok(existsSync(resolve(root, file)), file);
  }
});

check("detail:freshness bands and price-current gate", () => {
  const now = new Date("2026-07-19T12:00:00.000Z");
  assert.equal(listingFreshnessStatus(daysAgoIso(0, now), now), "fresh");
  assert.equal(listingFreshnessStatus(daysAgoIso(30, now), now), "fresh");
  assert.equal(listingFreshnessStatus(daysAgoIso(31, now), now), "warning");
  assert.equal(listingFreshnessStatus(daysAgoIso(90, now), now), "warning");
  assert.equal(listingFreshnessStatus(daysAgoIso(91, now), now), "expired");
  assert.equal(listingFreshnessStatus(null, now), "unknown");
  assert.equal(listingFreshnessStatus("not-a-date", now), "unknown");
  assert.equal(daysSinceUtc(null, now), null);

  assert.equal(
    mayPresentPriceAsCurrent({
      isVerifiedListing: true,
      lastVerifiedAt: daysAgoIso(10, now),
      now,
    }),
    true,
  );
  assert.equal(
    mayPresentPriceAsCurrent({
      isVerifiedListing: false,
      lastVerifiedAt: daysAgoIso(1, now),
      now,
    }),
    false,
  );
  assert.equal(
    mayPresentPriceAsCurrent({
      isVerifiedListing: true,
      lastVerifiedAt: daysAgoIso(45, now),
      now,
    }),
    false,
  );
  assert.equal(displayOrUnknown(null, "Unknown"), "Unknown");
  assert.equal(displayOrUnknown(2, "Unknown"), "2");
});

check("detail:listing inquiry context and escalation path", () => {
  const ctx = buildListingInquiryContext({
    propertyId: " uuid-1 ",
    propertySlug: " riverside-condo ",
    propertyTitle: " Riverside Condo ",
  });
  assert.deepEqual(ctx, {
    propertyId: "uuid-1",
    propertySlug: "riverside-condo",
    propertyTitle: "Riverside Condo",
  });
  assert.equal(
    listingContactEscalationPath("/en/contact", "riverside-condo"),
    "/en/contact?property=riverside-condo",
  );
});

check("detail:page keeps roles distinct and does not promote stale price", () => {
  const page = read(FILES.page);
  assert.ok(page.includes("mayPresentPriceAsCurrent"));
  assert.ok(page.includes("listingFreshnessStatus"));
  assert.ok(page.includes("data-price-current="));
  assert.ok(page.includes("listing-price-caption"));
  assert.ok(page.includes("FactValue"));
  assert.ok(page.includes("propertySlug={property.slug}"));
  assert.ok(page.includes("propertyTitle="));
  assert.ok(page.includes("listingSchema"));
  assert.ok(page.includes("breadcrumbListSchema"));
  assert.ok(page.includes('tone="unverified"'));
  assert.ok(!page.includes("Apple as listing"));
});

check("detail:contact card separates listing vs platform and carries context", () => {
  const card = read(FILES.card);
  assert.ok(/never silently substitutes Apple/i.test(card));
  assert.ok(card.includes("listing-contact-block"));
  assert.ok(card.includes("platform-support-block"));
  assert.ok(card.includes("request-viewing-block"));
  assert.ok(card.includes("listingContactEscalationPath"));
  assert.ok(card.includes("escalationHref"));
  assert.ok(card.includes("propertySlug"));
  assert.ok(card.includes("propertyTitle"));
  assert.ok(card.includes("inquiryForListing"));

  const viewing = read(FILES.viewing);
  assert.ok(viewing.includes('name="property_id"'));
  assert.ok(viewing.includes('name="property_slug"'));
  assert.ok(viewing.includes('name="property_title"'));
  assert.ok(viewing.includes("listing-inquiry-context"));

  const actions = read(FILES.actions);
  assert.ok(actions.includes("property_slug"));
  assert.ok(actions.includes("property_title"));
  assert.ok(actions.includes("platform_support_is_escalation_only: true"));
  assert.ok(actions.includes("uses_listing_contact_first: true"));

  const blocks = read(FILES.blocks);
  assert.ok(blocks.includes("escalationHref"));
  assert.ok(blocks.includes("Never renders Apple"));
});

check("detail:dictionaries expose trust and inquiry keys", () => {
  for (const locale of [FILES.en, FILES.zh, FILES.th]) {
    const dict = JSON.parse(read(locale));
    for (const key of [
      "inquiryForListing",
      "priceAsOf",
      "priceNotCurrent",
      "freshnessFresh",
      "freshnessWarning",
      "freshnessExpired",
      "freshnessUnknown",
      "contactListing",
      "contactPlatform",
      "contactPlatformNote",
    ]) {
      assert.ok(dict.property[key], `${locale} missing property.${key}`);
    }
  }
});

check("detail:JSON-LD listing schema contract remains present", () => {
  const schema = read(FILES.schema);
  assert.ok(schema.includes("export function listingSchema"));
  assert.ok(schema.includes("RealEstateListing"));
  assert.ok(schema.includes("priceCurrency: \"THB\""));
});

if (process.exitCode) {
  console.log(JSON.stringify({ ok: false }));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true }));
