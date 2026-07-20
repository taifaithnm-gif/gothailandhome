#!/usr/bin/env node
/**
 * P1-16 — Favorites controls and localized favorites page contracts.
 *
 * Offline checks: button announces state, hydration-safe provider, page +
 * metadata EN/ZH/TH, nav wiring, unavailable/empty handling, P1-15 preserved.
 * No live property sources / Windows01.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();

const FILES = {
  provider: "src/components/favorites/favorites-provider.tsx",
  button: "src/components/favorites/favorite-button.tsx",
  board: "src/components/favorites/favorites-board.tsx",
  page: "src/app/[lang]/favorites/page.tsx",
  actions: "src/app/[lang]/favorites/actions.ts",
  layout: "src/app/[lang]/layout.tsx",
  card: "src/components/property/property-card.tsx",
  detail: "src/app/[lang]/properties/[id]/page.tsx",
  nav: "src/lib/navigation/site-nav.ts",
  contract: "src/lib/favorites/index.ts",
  data: "src/lib/data/properties.ts",
  sitemap: "src/app/sitemap.ts",
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

check("favorites-ui:required files exist", () => {
  for (const file of Object.values(FILES)) {
    assert.ok(existsSync(resolve(root, file)), file);
  }
});

check("favorites-ui:controls announce state and are hydration-safe", () => {
  const button = read(FILES.button);
  const provider = read(FILES.provider);
  assert.ok(button.includes("aria-pressed={saved}"));
  assert.ok(button.includes("aria-label="));
  assert.ok(button.includes("aria-live=\"polite\""));
  assert.ok(button.includes("data-favorite-state"));
  assert.ok(button.includes("hydrated"));
  assert.ok(provider.includes("useSyncExternalStore"));
  assert.ok(provider.includes("getServerSnapshot"));
  assert.ok(provider.includes("FavoritesProvider"));
});

check("favorites-ui:cards and detail expose save/remove controls", () => {
  const card = read(FILES.card);
  const detail = read(FILES.detail);
  assert.ok(card.includes("FavoriteButton"));
  assert.ok(card.includes("propertySlug={property.slug}"));
  assert.ok(detail.includes("FavoriteButton"));
  assert.ok(detail.includes('data-slot="listing-key-summary"'));
});

check("favorites-ui:page empty/unavailable and prune contracts", () => {
  const board = read(FILES.board);
  const page = read(FILES.page);
  const actions = read(FILES.actions);
  assert.ok(page.includes("buildPageMetadata"));
  assert.ok(page.includes("dict.meta.favoritesTitle"));
  assert.ok(board.includes("EmptyState"));
  assert.ok(board.includes("emptyTitle"));
  assert.ok(board.includes("unavailableTitle"));
  assert.ok(board.includes("pruneToSlugs"));
  assert.ok(board.includes("retentionNote"));
  assert.ok(actions.includes("resolveFavoriteProperties"));
  assert.ok(actions.includes("missingSlugs"));
  assert.ok(read(FILES.data).includes("getPublishedPropertiesBySlugs"));
});

check("favorites-ui:nav + layout + sitemap wiring", () => {
  const nav = read(FILES.nav);
  const layout = read(FILES.layout);
  const sitemap = read(FILES.sitemap);
  assert.ok(nav.includes('"/favorites"'));
  assert.ok(nav.includes("dict.nav.favorites"));
  assert.ok(layout.includes("FavoritesProvider"));
  assert.ok(sitemap.includes('"/favorites"'));
});

check("favorites-ui:P1-15 contract remains local-device only", () => {
  const contract = read(FILES.contract);
  assert.ok(contract.includes("Local-device only"));
  assert.ok(contract.includes("FAVORITES_STORAGE_KEY"));
  assert.ok(!contract.includes('"use client"'));
});

check("favorites-ui:EN/ZH/TH metadata and copy keys", () => {
  for (const locale of ["en", "zh", "th"]) {
    const dict = JSON.parse(read(`src/dictionaries/${locale}.json`));
    assert.ok(dict.meta.favoritesTitle, `${locale}.meta.favoritesTitle`);
    assert.ok(
      dict.meta.favoritesDescription,
      `${locale}.meta.favoritesDescription`,
    );
    assert.ok(dict.nav.favorites, `${locale}.nav.favorites`);
    for (const key of [
      "title",
      "subtitle",
      "retentionNote",
      "save",
      "remove",
      "savedState",
      "unsavedState",
      "loadingState",
      "emptyTitle",
      "emptyBody",
      "browseListings",
      "unavailableTitle",
      "unavailableBody",
    ]) {
      assert.ok(dict.favorites[key], `${locale}.favorites.${key}`);
    }
  }
});

if (process.exitCode) {
  console.log(JSON.stringify({ ok: false }));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true }));
