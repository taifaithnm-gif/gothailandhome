#!/usr/bin/env node
/**
 * P1-15 — Accountless favorites state contract.
 *
 * Offline checks only. No account/backend, no live property sources,
 * no Windows01, no UI (P1-16).
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  FAVORITES_MAX_ITEMS,
  FAVORITES_RETENTION_NOTE,
  FAVORITES_SCHEMA_VERSION,
  FAVORITES_STORAGE_KEY,
  addFavorite,
  clearFavorites,
  clearFavoritesStorage,
  createMemoryFavoritesStorage,
  emptyFavoritesState,
  hasFavorite,
  listFavoriteIds,
  listFavoriteSlugs,
  loadFavorites,
  normalizeFavoriteRef,
  parseFavoritesState,
  removeFavorite,
  saveFavorites,
  serializeFavoritesState,
} from "../src/lib/favorites/index.ts";

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

check("favorites:module exists under src/lib/favorites", () => {
  assert.ok(existsSync(resolve(root, "src/lib/favorites/index.ts")));
});

check("favorites:no account or backend coupling in contract", () => {
  const src = readFileSync(
    resolve(root, "src/lib/favorites/index.ts"),
    "utf8",
  );
  assert.ok(src.includes("Local-device only"));
  assert.ok(!/supabase|createClient|fetch\(|auth|cookie/i.test(src));
  assert.ok(src.includes(FAVORITES_STORAGE_KEY));
  assert.ok(FAVORITES_RETENTION_NOTE.includes("this device"));
  assert.ok(FAVORITES_RETENTION_NOTE.includes("not linked to an account"));
});

check("favorites:normalize keeps only stable identifiers", () => {
  const ref = normalizeFavoriteRef({
    id: "prop_123",
    slug: "Ashton-Asoke-2BR",
    title: "Secret title",
    price: 999999,
    imageUrl: "https://evil.example/img.jpg",
  });
  assert.deepEqual(ref, { id: "prop_123", slug: "ashton-asoke-2br" });
  assert.equal(normalizeFavoriteRef({ title: "only title" }), null);
  assert.equal(normalizeFavoriteRef(null), null);
  assert.equal(normalizeFavoriteRef("slug-only"), null);
});

check("favorites:deterministic add/remove/clear", () => {
  let state = emptyFavoritesState();
  state = addFavorite(state, { slug: "alpha" });
  state = addFavorite(state, { id: "1", slug: "beta" });
  state = addFavorite(state, { slug: "gamma" });
  assert.deepEqual(listFavoriteSlugs(state), ["alpha", "beta", "gamma"]);
  assert.equal(hasFavorite(state, { slug: "beta" }), true);
  assert.equal(hasFavorite(state, { id: "1" }), true);

  // Duplicate moves to end (most recent).
  state = addFavorite(state, { slug: "alpha" });
  assert.deepEqual(listFavoriteSlugs(state), ["beta", "gamma", "alpha"]);

  state = removeFavorite(state, { id: "1" });
  assert.deepEqual(listFavoriteSlugs(state), ["gamma", "alpha"]);
  assert.equal(hasFavorite(state, { slug: "beta" }), false);

  state = clearFavorites();
  assert.deepEqual(state, emptyFavoritesState());
  assert.equal(state.items.length, 0);
});

check("favorites:corrupt and old storage fail safely", () => {
  assert.deepEqual(parseFavoritesState(null), emptyFavoritesState());
  assert.deepEqual(parseFavoritesState(""), emptyFavoritesState());
  assert.deepEqual(parseFavoritesState("{not-json"), emptyFavoritesState());
  assert.deepEqual(parseFavoritesState("[]"), emptyFavoritesState());
  assert.deepEqual(
    parseFavoritesState(JSON.stringify({ version: 99, items: [{ slug: "x" }] })),
    emptyFavoritesState(),
  );
  assert.deepEqual(
    parseFavoritesState(JSON.stringify({ version: 0, items: [{ slug: "x" }] })),
    emptyFavoritesState(),
  );

  const migrated = parseFavoritesState(
    JSON.stringify({
      version: FAVORITES_SCHEMA_VERSION,
      items: [
        { slug: "ok-one", title: "drop me", price: 1 },
        { slug: "!!bad!!" },
        { id: "id-2", slug: "ok-two", image: "/x.jpg" },
        null,
        "string",
      ],
      extra: true,
    }),
  );
  assert.equal(migrated.version, FAVORITES_SCHEMA_VERSION);
  assert.deepEqual(migrated.items, [
    { slug: "ok-one" },
    { id: "id-2", slug: "ok-two" },
  ]);
});

check("favorites:bounded item count drops oldest first", () => {
  let state = emptyFavoritesState();
  for (let i = 0; i < FAVORITES_MAX_ITEMS + 5; i += 1) {
    state = addFavorite(state, { slug: `item-${i}` });
  }
  assert.equal(state.items.length, FAVORITES_MAX_ITEMS);
  assert.equal(state.items[0]?.slug, "item-5");
  assert.equal(state.items[state.items.length - 1]?.slug, `item-${FAVORITES_MAX_ITEMS + 4}`);
});

check("favorites:serialize round-trip strips non-identifiers", () => {
  const state = addFavorite(emptyFavoritesState(), {
    id: "abc",
    slug: "demo-listing",
  });
  const dirty = {
    version: state.version,
    items: [{ id: "abc", slug: "demo-listing", title: "nope", price: 3 }],
  };
  const json = serializeFavoritesState(/** @type {any} */ (dirty));
  const parsed = parseFavoritesState(json);
  assert.deepEqual(parsed.items, [{ id: "abc", slug: "demo-listing" }]);
  assert.ok(!json.includes("title"));
  assert.ok(!json.includes("price"));
  assert.deepEqual(listFavoriteIds(parsed), ["abc"]);
  assert.deepEqual(listFavoriteSlugs(parsed), ["demo-listing"]);
});

check("favorites:storage adapter load/save/clear", () => {
  const storage = createMemoryFavoritesStorage();
  let state = emptyFavoritesState();
  state = addFavorite(state, { slug: "one" });
  state = addFavorite(state, { slug: "two" });
  saveFavorites(storage, state);

  const loaded = loadFavorites(storage);
  assert.deepEqual(listFavoriteSlugs(loaded), ["one", "two"]);
  assert.equal(storage.getItem(FAVORITES_STORAGE_KEY)?.includes("one"), true);

  const cleared = clearFavoritesStorage(storage);
  assert.deepEqual(cleared, emptyFavoritesState());
  assert.equal(storage.getItem(FAVORITES_STORAGE_KEY), null);
  assert.deepEqual(loadFavorites(storage), emptyFavoritesState());
});

check("favorites:no React UI in P1-15 contract module", () => {
  const src = readFileSync(
    resolve(root, "src/lib/favorites/index.ts"),
    "utf8",
  );
  assert.ok(!src.includes('"use client"'));
  assert.ok(!src.includes("FavoriteButton"));
  assert.ok(!src.includes("FavoritesProvider"));
});

if (process.exitCode) {
  console.log(JSON.stringify({ ok: false }));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true }));
