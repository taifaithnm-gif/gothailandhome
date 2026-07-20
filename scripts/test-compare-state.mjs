#!/usr/bin/env node
/**
 * P1-17 — Accountless comparison selection contract + field allowlist.
 *
 * Offline checks only. No account/backend, no live property sources,
 * no Windows01, no UI (P1-18).
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  COMPARE_APPROVED_FIELDS,
  COMPARE_BLOCKED_FIELDS,
  COMPARE_MISSING_VALUE_POLICY,
  compareAllowlistExcludesInvestmentClaims,
  isApprovedCompareField,
  isBlockedCompareField,
  listApprovedCompareFields,
} from "../src/lib/compare/fields.ts";
import {
  COMPARE_MAX_ITEMS,
  COMPARE_RETENTION_NOTE,
  COMPARE_SCHEMA_VERSION,
  COMPARE_STORAGE_KEY,
  addCompareItem,
  clearCompare,
  clearCompareStorage,
  createMemoryCompareStorage,
  emptyCompareState,
  hasCompareItem,
  listCompareIds,
  listCompareSlugs,
  loadCompare,
  normalizeCompareRef,
  parseCompareState,
  removeCompareItem,
  saveCompare,
  serializeCompareState,
} from "../src/lib/compare/index.ts";

const root = process.cwd();

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

check("compare:modules exist under src/lib/compare", () => {
  assert.ok(existsSync(resolve(root, "src/lib/compare/index.ts")));
  assert.ok(existsSync(resolve(root, "src/lib/compare/fields.ts")));
});

check("compare:no account or backend coupling in contract", () => {
  const src = readFileSync(resolve(root, "src/lib/compare/index.ts"), "utf8");
  const fields = readFileSync(
    resolve(root, "src/lib/compare/fields.ts"),
    "utf8",
  );
  assert.ok(src.includes("Local-device only"));
  assert.ok(!/supabase|createClient|fetch\(|auth|cookie/i.test(src));
  assert.ok(!/supabase|createClient|fetch\(|auth|cookie/i.test(fields));
  assert.ok(src.includes(COMPARE_STORAGE_KEY));
  assert.ok(COMPARE_RETENTION_NOTE.includes("this device"));
  assert.ok(COMPARE_RETENTION_NOTE.includes("not linked to an account"));
});

check("compare:normalize keeps only stable identifiers", () => {
  const ref = normalizeCompareRef({
    id: "prop_123",
    slug: "Ashton-Asoke-2BR",
    title: "Secret title",
    price: 999999,
    yield: 0.07,
    imageUrl: "https://evil.example/img.jpg",
  });
  assert.deepEqual(ref, { id: "prop_123", slug: "ashton-asoke-2br" });
  assert.equal(normalizeCompareRef({ title: "only title" }), null);
  assert.equal(normalizeCompareRef(null), null);
  assert.equal(normalizeCompareRef("slug-only"), null);
});

check("compare:deterministic add/remove/clear", () => {
  let state = emptyCompareState();
  state = addCompareItem(state, { slug: "alpha" });
  state = addCompareItem(state, { id: "1", slug: "beta" });
  state = addCompareItem(state, { slug: "gamma" });
  assert.deepEqual(listCompareSlugs(state), ["alpha", "beta", "gamma"]);
  assert.equal(hasCompareItem(state, { slug: "beta" }), true);
  assert.equal(hasCompareItem(state, { id: "1" }), true);

  // Duplicate moves to end (most recent).
  state = addCompareItem(state, { slug: "alpha" });
  assert.deepEqual(listCompareSlugs(state), ["beta", "gamma", "alpha"]);

  state = removeCompareItem(state, { id: "1" });
  assert.deepEqual(listCompareSlugs(state), ["gamma", "alpha"]);
  assert.equal(hasCompareItem(state, { slug: "beta" }), false);

  state = clearCompare();
  assert.deepEqual(state, emptyCompareState());
  assert.equal(state.items.length, 0);
});

check("compare:corrupt and old storage fail safely", () => {
  assert.deepEqual(parseCompareState(null), emptyCompareState());
  assert.deepEqual(parseCompareState(""), emptyCompareState());
  assert.deepEqual(parseCompareState("{not-json"), emptyCompareState());
  assert.deepEqual(parseCompareState("[]"), emptyCompareState());
  assert.deepEqual(
    parseCompareState(
      JSON.stringify({ version: 99, items: [{ slug: "x" }] }),
    ),
    emptyCompareState(),
  );
  assert.deepEqual(
    parseCompareState(JSON.stringify({ version: 0, items: [{ slug: "x" }] })),
    emptyCompareState(),
  );

  const migrated = parseCompareState(
    JSON.stringify({
      version: COMPARE_SCHEMA_VERSION,
      items: [
        { slug: "ok-one", title: "drop me", yield: 0.08 },
        { slug: "!!bad!!" },
        { id: "id-2", slug: "ok-two", roi: 12 },
        null,
        "string",
      ],
      extra: true,
    }),
  );
  assert.equal(migrated.version, COMPARE_SCHEMA_VERSION);
  assert.deepEqual(migrated.items, [
    { slug: "ok-one" },
    { id: "id-2", slug: "ok-two" },
  ]);
});

check("compare:bounded selection drops oldest first", () => {
  assert.equal(COMPARE_MAX_ITEMS, 4);
  let state = emptyCompareState();
  for (let i = 0; i < COMPARE_MAX_ITEMS + 2; i += 1) {
    state = addCompareItem(state, { slug: `item-${i}` });
  }
  assert.equal(state.items.length, COMPARE_MAX_ITEMS);
  assert.equal(state.items[0]?.slug, "item-2");
  assert.equal(
    state.items[state.items.length - 1]?.slug,
    `item-${COMPARE_MAX_ITEMS + 1}`,
  );
});

check("compare:serialize round-trip strips non-identifiers", () => {
  const state = addCompareItem(emptyCompareState(), {
    id: "abc",
    slug: "demo-listing",
  });
  const dirty = {
    version: state.version,
    items: [
      {
        id: "abc",
        slug: "demo-listing",
        title: "nope",
        price: 3,
        yield: 0.05,
      },
    ],
  };
  const json = serializeCompareState(/** @type {any} */ (dirty));
  const parsed = parseCompareState(json);
  assert.deepEqual(parsed.items, [{ id: "abc", slug: "demo-listing" }]);
  assert.ok(!json.includes("title"));
  assert.ok(!json.includes("price"));
  assert.ok(!json.includes("yield"));
  assert.deepEqual(listCompareIds(parsed), ["abc"]);
  assert.deepEqual(listCompareSlugs(parsed), ["demo-listing"]);
});

check("compare:storage adapter load/save/clear", () => {
  const storage = createMemoryCompareStorage();
  let state = emptyCompareState();
  state = addCompareItem(state, { slug: "one" });
  state = addCompareItem(state, { slug: "two" });
  saveCompare(storage, state);

  const loaded = loadCompare(storage);
  assert.deepEqual(listCompareSlugs(loaded), ["one", "two"]);
  assert.equal(storage.getItem(COMPARE_STORAGE_KEY)?.includes("one"), true);

  const cleared = clearCompareStorage(storage);
  assert.deepEqual(cleared, emptyCompareState());
  assert.equal(storage.getItem(COMPARE_STORAGE_KEY), null);
  assert.deepEqual(loadCompare(storage), emptyCompareState());
});

check("compare:field allowlist excludes unsupported investment claims", () => {
  assert.equal(COMPARE_MISSING_VALUE_POLICY, "unknown_not_zero");
  assert.ok(compareAllowlistExcludesInvestmentClaims());
  assert.ok(isApprovedCompareField("priceThb"));
  assert.ok(isApprovedCompareField("bedrooms"));
  assert.ok(isApprovedCompareField("areaSqm"));
  assert.ok(isApprovedCompareField("lastVerifiedAt"));
  assert.equal(isApprovedCompareField("yield"), false);
  assert.equal(isApprovedCompareField("roi"), false);
  assert.ok(isBlockedCompareField("yield"));
  assert.ok(isBlockedCompareField("roi"));
  assert.ok(isBlockedCompareField("capRate"));
  assert.ok(isBlockedCompareField("guaranteedReturn"));

  for (const field of COMPARE_BLOCKED_FIELDS) {
    assert.equal(
      isApprovedCompareField(field),
      false,
      `blocked field leaked into allowlist: ${field}`,
    );
  }
  for (const field of COMPARE_APPROVED_FIELDS) {
    assert.equal(
      isBlockedCompareField(field),
      false,
      `approved field marked blocked: ${field}`,
    );
  }

  const listed = listApprovedCompareFields();
  assert.deepEqual(listed, [...COMPARE_APPROVED_FIELDS]);
  assert.ok(!listed.includes(/** @type {any} */ ("yield")));
});

check("compare:no React UI in P1-17 contract modules", () => {
  const indexSrc = readFileSync(
    resolve(root, "src/lib/compare/index.ts"),
    "utf8",
  );
  const fieldsSrc = readFileSync(
    resolve(root, "src/lib/compare/fields.ts"),
    "utf8",
  );
  for (const src of [indexSrc, fieldsSrc]) {
    assert.ok(!src.includes('"use client"'));
    assert.ok(!src.includes("CompareButton"));
    assert.ok(!src.includes("CompareProvider"));
  }
});

if (process.exitCode) {
  console.log(JSON.stringify({ ok: false }));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true }));
