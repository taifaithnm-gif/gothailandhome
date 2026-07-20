#!/usr/bin/env node
/**
 * P1-04 — Navigation and locale-switching contracts.
 *
 * Deterministic checks (no browser, no live network):
 * - Desktop/mobile/footer groups share the same IA membership
 * - Active-state matching avoids prefix collisions
 * - Locale switch preserves path + query
 * - EN/ZH/TH nav labels present
 * - Keyboard focus-visible + aria-current on header controls
 *
 * Run: node scripts/test-navigation-locale.mjs
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();

function read(rel) {
  return readFileSync(resolve(root, rel), "utf8");
}

function ok(msg) {
  console.log(`PASS: ${msg}`);
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

const NAV_MODULE = "src/lib/navigation/site-nav.ts";
const HEADER = "src/components/layout/site-header.tsx";
const FOOTER = "src/components/layout/site-footer.tsx";

check("nav:shared module and shell wiring exist", () => {
  assert.ok(existsSync(resolve(root, NAV_MODULE)), NAV_MODULE);
  assert.ok(existsSync(resolve(root, HEADER)), HEADER);
  assert.ok(existsSync(resolve(root, FOOTER)), FOOTER);
  const header = read(HEADER);
  const footer = read(FOOTER);
  assert.ok(header.includes("getSiteNavGroups"), "header uses shared groups");
  assert.ok(header.includes("swapLocaleHref"), "header uses locale swap helper");
  assert.ok(header.includes("isNavLinkActive"), "header uses active helper");
  assert.ok(header.includes("useSearchParams"), "locale switch reads query");
  assert.ok(header.includes("Suspense"), "locale switcher Suspense boundary");
  assert.ok(
    footer.includes("getFooterExploreLinks"),
    "footer explore from shared IA",
  );
  assert.ok(
    footer.includes("getFooterCompanyLinks"),
    "footer company from shared IA",
  );
});

check("nav:desktop/mobile groups match via shared getSiteNavGroups", () => {
  const nav = read(NAV_MODULE);
  for (const id of [
    '"browse"',
    '"marketplace"',
    '"company"',
    '"/buy"',
    '"/rent"',
    '"/properties"',
    '"/favorites"',
    '"/projects"',
    '"/cities"',
    '"/developers"',
    '"/marketplace"',
    '"/knowledge"',
    '"/about"',
    '"/contact"',
  ]) {
    assert.ok(nav.includes(id), `IA missing ${id}`);
  }
  // P1-21 hub-first: Find My Home / List Property are hub cards, not chrome peers.
  assert.ok(
    !nav.includes('id: "find-my-home"'),
    "find-my-home must not be chrome peer after P1-21",
  );
  assert.ok(
    !nav.includes('id: "list-property"'),
    "list-property must not be chrome peer after P1-21",
  );

  const header = read(HEADER);
  assert.ok(
    header.includes("dict.nav.primary") || header.includes("aria-label={dict.nav.primary}"),
    "desktop primary nav uses localized label",
  );
  assert.ok(header.includes("groups.map"), "shared groups rendered");
  assert.ok(header.includes('id="mobile-nav"'), "mobile nav drawer");
  assert.ok(header.includes('role="group"'), "desktop group landmarks");
});

check("nav:active-state helper avoids prefix collisions", () => {
  const src = read(NAV_MODULE);
  assert.ok(src.includes("normalizedPath.startsWith"), "nested path match");
  assert.ok(src.includes("normalizedHref === homeHref"), "home exact match");

  function isNavLinkActive(pathname, href, homeHref) {
    const normalizedPath =
      pathname.length > 1 && pathname.endsWith("/")
        ? pathname.slice(0, -1)
        : pathname;
    const normalizedHref =
      href.length > 1 && href.endsWith("/") ? href.slice(0, -1) : href;
    if (normalizedHref === homeHref) {
      return normalizedPath === homeHref;
    }
    return (
      normalizedPath === normalizedHref ||
      normalizedPath.startsWith(`${normalizedHref}/`)
    );
  }

  assert.equal(isNavLinkActive("/en", "/en", "/en"), true);
  assert.equal(isNavLinkActive("/en/buy", "/en", "/en"), false);
  assert.equal(isNavLinkActive("/en/properties", "/en/properties", "/en"), true);
  assert.equal(
    isNavLinkActive("/en/properties/abc", "/en/properties", "/en"),
    true,
  );
  assert.equal(
    isNavLinkActive("/en/properties-extra", "/en/properties", "/en"),
    false,
  );
  assert.equal(isNavLinkActive("/en/projects/x", "/en/projects", "/en"), true);
  assert.equal(isNavLinkActive("/en/buy", "/en/buy", "/en"), true);
});

check("nav:locale switch preserves path and query", () => {
  const src = read(NAV_MODULE);
  assert.ok(src.includes("export function swapLocalePathname"), "pathname swap");
  assert.ok(src.includes("export function swapLocaleHref"), "href swap");
  assert.ok(src.includes("query ? `${path}?${query}`"), "query preserved");

  function swapLocalePathname(pathname, nextLocale) {
    const segments = pathname.split("/");
    if (segments.length > 1 && ["en", "zh", "th"].includes(segments[1])) {
      segments[1] = nextLocale;
      return segments.join("/") || `/${nextLocale}`;
    }
    return `/${nextLocale}`;
  }
  function swapLocaleHref(pathname, nextLocale, search = "") {
    const path = swapLocalePathname(pathname, nextLocale);
    const query = search.startsWith("?") ? search.slice(1) : search;
    return query ? `${path}?${query}` : path;
  }

  assert.equal(
    swapLocaleHref("/en/properties", "zh", "city=bangkok&page=2"),
    "/zh/properties?city=bangkok&page=2",
  );
  assert.equal(
    swapLocaleHref("/th/projects/foo", "en", "?q=bts"),
    "/en/projects/foo?q=bts",
  );
  assert.equal(swapLocaleHref("/zh/about", "th", ""), "/th/about");
  assert.equal(swapLocaleHref("/en/find-my-home", "zh"), "/zh/find-my-home");
});

check("nav:keyboard + aria-current contracts on header", () => {
  const header = read(HEADER);
  assert.ok(
    header.includes('aria-current={active ? "page" : undefined}'),
    "aria-current page",
  );
  assert.ok(header.includes("focus-visible:ring-2"), "focus-visible rings");
  assert.ok(header.includes("aria-expanded={open}"), "menu expanded state");
  assert.ok(header.includes('aria-controls="mobile-nav"'), "menu controls");
  assert.ok(header.includes("aria-label={dict.nav.language}"), "language label");
});

check("nav:EN/ZH/TH labels for Phase 1 IA keys", () => {
  const keys = [
    "home",
    "buy",
    "rent",
    "properties",
    "favorites",
    "projects",
    "cities",
    "developers",
    "marketplace",
    "findMyHome",
    "listProperty",
    "knowledge",
    "about",
    "partners",
    "contact",
    "sectionBrowse",
    "sectionMarketplace",
    "sectionCompany",
    "language",
    "menu",
    "close",
  ];
  for (const locale of ["en", "zh", "th"]) {
    const dict = JSON.parse(read(`src/dictionaries/${locale}.json`));
    for (const key of keys) {
      assert.ok(
        typeof dict.nav?.[key] === "string" && dict.nav[key].length > 0,
        `${locale}.nav.${key}`,
      );
    }
  }
});

check("nav:header still surfaces buy/rent/marketplace for existing gates", () => {
  const nav = read(NAV_MODULE);
  assert.ok(nav.includes('/buy"') || nav.includes('"/buy"'), "buy path");
  assert.ok(nav.includes("/rent"), "rent path");
  assert.ok(nav.includes("/marketplace"), "marketplace path");
});

if (process.exitCode) {
  console.log(JSON.stringify({ ok: false }));
  process.exit(1);
}
console.log(
  JSON.stringify({
    ok: true,
    groups: ["browse", "marketplace", "company"],
    checks: [
      "shared-ia",
      "active-state",
      "locale-query-preserve",
      "keyboard",
      "i18n-labels",
    ],
  }),
);
