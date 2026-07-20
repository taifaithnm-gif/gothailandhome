#!/usr/bin/env node
/**
 * P1-18 — Property comparison page and controls contracts.
 *
 * Offline checks: controls announce state + hydration-safe; cards/detail expose
 * compare controls; localized page + noindex metadata; approved-field table with
 * unknown-not-zero; removed/unpublished handling + prune; nav/layout wiring;
 * EN/ZH/TH keys; only approved allowlist fields compared.
 * No live property sources / Windows01.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { COMPARE_BLOCKED_FIELDS } from "../src/lib/compare/fields.ts";
import {
  COMPARE_MAX_ITEMS,
  COMPARE_MIN_ITEMS,
} from "../src/lib/compare/index.ts";

const root = process.cwd();

const FILES = {
  provider: "src/components/compare/compare-provider.tsx",
  button: "src/components/compare/compare-button.tsx",
  view: "src/components/compare/compare-view.tsx",
  page: "src/app/[lang]/compare/page.tsx",
  actions: "src/app/[lang]/compare/actions.ts",
  layout: "src/app/[lang]/layout.tsx",
  card: "src/components/property/property-card.tsx",
  detail: "src/app/[lang]/properties/[id]/page.tsx",
  nav: "src/lib/navigation/site-nav.ts",
  contract: "src/lib/compare/index.ts",
  fields: "src/lib/compare/fields.ts",
  data: "src/lib/data/properties.ts",
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

check("compare-ui:required files exist", () => {
  for (const file of Object.values(FILES)) {
    assert.ok(existsSync(resolve(root, file)), file);
  }
});

check("compare-ui:controls announce state and are hydration-safe", () => {
  const button = read(FILES.button);
  const provider = read(FILES.provider);
  assert.ok(button.includes("aria-pressed={selected}"));
  assert.ok(button.includes("aria-label="));
  assert.ok(button.includes('aria-live="polite"'));
  assert.ok(button.includes("data-compare-state"));
  assert.ok(button.includes("hydrated"));
  assert.ok(button.includes("disabled={blocked}"), "full-selection guard");
  assert.ok(provider.includes("useSyncExternalStore"));
  assert.ok(provider.includes("getServerSnapshot"));
  assert.ok(provider.includes("CompareProvider"));
});

check("compare-ui:cards and detail expose compare controls", () => {
  const card = read(FILES.card);
  const detail = read(FILES.detail);
  assert.ok(card.includes("CompareButton"));
  assert.ok(card.includes("propertySlug={property.slug}"));
  assert.ok(detail.includes("CompareButton"));
  assert.ok(detail.includes('data-slot="listing-key-summary"'));
});

check("compare-ui:page is noindex and localized with metadata", () => {
  const page = read(FILES.page);
  assert.ok(page.includes("buildPageMetadata"));
  assert.ok(page.includes("dict.meta.compareTitle"));
  assert.ok(page.includes("index: false"), "state-dependent page is noindex");
  assert.ok(page.includes("CompareView"));
});

check("compare-ui:table compares two-to-four on approved fields", () => {
  const view = read(FILES.view);
  const contract = read(FILES.contract);
  assert.equal(COMPARE_MIN_ITEMS, 2);
  assert.equal(COMPARE_MAX_ITEMS, 4);
  assert.ok(view.includes("<table"), "renders a comparison table");
  assert.ok(view.includes('scope="col"'));
  assert.ok(view.includes('scope="row"'));
  assert.ok(view.includes("COMPARE_MIN_ITEMS"));
  assert.ok(view.includes("isApprovedCompareField"), "guards approved fields");
  assert.ok(contract.includes("COMPARE_MIN_ITEMS"));
});

check("compare-ui:missing values are unknown, never zero", () => {
  const view = read(FILES.view);
  assert.ok(view.includes("dict.property.unknown"));
  assert.ok(view.includes("isSourcedPrice"), "price 0 is unknown, not shown");
  assert.ok(view.includes("?? unknown") || view.includes(": unknown"));
});

check("compare-ui:no blocked investment-claim fields in view", () => {
  const view = read(FILES.view);
  for (const field of COMPARE_BLOCKED_FIELDS) {
    assert.ok(
      !new RegExp(`\\b${field}\\b`).test(view),
      `blocked field referenced in compare view: ${field}`,
    );
  }
});

check("compare-ui:removed/unpublished handled and pruned", () => {
  const view = read(FILES.view);
  const actions = read(FILES.actions);
  assert.ok(view.includes("missingSlugs"));
  assert.ok(view.includes("pruneToSlugs"));
  assert.ok(view.includes("unavailableTitle"));
  assert.ok(actions.includes("resolveCompareProperties"));
  assert.ok(actions.includes("missingSlugs"));
  assert.ok(read(FILES.data).includes("getPublishedPropertiesBySlugs"));
});

check("compare-ui:nav + layout wiring", () => {
  const nav = read(FILES.nav);
  const layout = read(FILES.layout);
  assert.ok(nav.includes('"/compare"'));
  assert.ok(nav.includes("dict.nav.compare"));
  assert.ok(layout.includes("CompareProvider"));
});

check("compare-ui:state-dependent compare route stays out of sitemap", () => {
  const sitemap = read("src/app/sitemap.ts");
  assert.ok(!sitemap.includes('"/compare"'), "noindex page not in sitemap");
});

check("compare-ui:EN/ZH/TH metadata and copy keys", () => {
  for (const locale of ["en", "zh", "th"]) {
    const dict = JSON.parse(read(`src/dictionaries/${locale}.json`));
    assert.ok(dict.meta.compareTitle, `${locale}.meta.compareTitle`);
    assert.ok(
      dict.meta.compareDescription,
      `${locale}.meta.compareDescription`,
    );
    assert.ok(dict.nav.compare, `${locale}.nav.compare`);
    for (const key of [
      "title",
      "subtitle",
      "retentionNote",
      "add",
      "remove",
      "selectedState",
      "unselectedState",
      "fullState",
      "loadingState",
      "loading",
      "emptyTitle",
      "emptyBody",
      "browseListings",
      "needMoreTitle",
      "needMoreBody",
      "clearAll",
      "tableCaption",
      "fieldColumn",
      "propertyType",
      "lastVerified",
      "yes",
      "no",
      "unavailableTitle",
      "unavailableBody",
      "unavailableItem",
    ]) {
      assert.ok(dict.compare[key], `${locale}.compare.${key}`);
    }
  }
});

if (process.exitCode) {
  console.log(JSON.stringify({ ok: false }));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true }));
