#!/usr/bin/env node
/**
 * P1-05 — Homepage conversion hierarchy contracts.
 *
 * Offline checks: CTA routes, section order, featured bounds, claim hygiene,
 * keyboard focus affordances. No live network / property APIs.
 *
 * Run: node scripts/test-homepage-conversion.mjs
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

const HOME = "src/app/[lang]/page.tsx";
const PATHS = "src/components/home/home-conversion-paths.tsx";
const HERO = "src/components/home/home-hero-search.tsx";

const EXPECTED_SECTION_ORDER = [
  "hero",
  "sources",
  "paths",
  "listings",
  "projects",
  "districts",
  "developers",
  "why",
  "marketplace",
  "knowledge",
  "support",
];

check("home:conversion files exist", () => {
  for (const file of [HOME, PATHS, HERO]) {
    assert.ok(existsSync(resolve(root, file)), file);
  }
});

check("home:section order hero→paths→listings→projects→districts→inquiry", () => {
  const home = read(HOME);
  assert.ok(
    home.includes("HOME_SECTION_ORDER"),
    "documented HOME_SECTION_ORDER export",
  );
  const markers = EXPECTED_SECTION_ORDER.map(
    (id) => `data-home-section="${id}"`,
  );
  let last = -1;
  for (const marker of markers) {
    const idx = home.indexOf(marker);
    // paths lives in HomeConversionPaths component
    if (marker.includes('"paths"') && idx < 0) {
      const paths = read(PATHS);
      assert.ok(
        paths.includes('data-home-section="paths"'),
        "paths section marker",
      );
      continue;
    }
    assert.ok(idx >= 0, `missing ${marker}`);
    assert.ok(idx > last, `order break at ${marker}`);
    last = idx;
  }
  // listings before projects
  assert.ok(
    home.indexOf('data-home-section="listings"') <
      home.indexOf('data-home-section="projects"'),
    "listings must precede projects",
  );
  // support (inquiry) last
  assert.ok(
    home.lastIndexOf('data-home-section="support"') >
      home.indexOf('data-home-section="marketplace"'),
    "support inquiry after marketplace",
  );
});

check("home:featured sections remain bounded", () => {
  const home = read(HOME);
  assert.ok(home.includes("HOME_BOUNDS"), "HOME_BOUNDS present");
  assert.ok(home.includes("listings: 6"), "listings bound 6");
  assert.ok(home.includes("projects: 6"), "projects bound 6");
  assert.ok(home.includes("districts: 12"), "districts bound 12");
  assert.ok(home.includes("developers: 6"), "developers bound 6");
  assert.ok(home.includes("pageSize: HOME_BOUNDS.listings"), "paged by bound");
  assert.ok(
    home.includes("slice(0, HOME_BOUNDS.projects)"),
    "projects sliced",
  );
  assert.ok(
    home.includes("slice(0, HOME_BOUNDS.districts)"),
    "districts sliced",
  );
  assert.ok(
    home.includes("slice(0, HOME_BOUNDS.developers)"),
    "developers sliced",
  );
});

check("home:every primary CTA lands on a valid localized route", () => {
  const paths = read(PATHS);
  const hero = read(HERO);
  const home = read(HOME);

  const required = [
    { file: PATHS, needle: 'localePath(locale, "/buy")', label: "buy path" },
    { file: PATHS, needle: 'localePath(locale, "/rent")', label: "rent path" },
    {
      file: PATHS,
      needle: 'listing_type=sale&city=bangkok&sort=price_asc',
      label: "sale scan filters",
    },
    {
      file: HERO,
      needle: 'action={localePath(locale, "/properties")}',
      label: "hero filtered listings",
    },
    {
      file: HERO,
      needle: 'localePath(locale, "/find-my-home")',
      label: "find my home",
    },
    {
      file: HERO,
      needle: 'localePath(locale, "/list-your-property")',
      label: "list property",
    },
    {
      file: HOME,
      needle: 'localePath(lang, "/projects")',
      label: "projects index",
    },
    {
      file: HOME,
      needle: "`/districts/${district.slug}`",
      label: "district detail",
    },
    {
      file: HOME,
      needle: 'localePath(lang, "/contact")',
      label: "contact inquiry",
    },
    {
      file: HOME,
      needle: 'localePath(lang, "/marketplace")',
      label: "marketplace",
    },
  ];

  for (const item of required) {
    const src = item.file === PATHS ? paths : item.file === HERO ? hero : home;
    assert.ok(src.includes(item.needle), item.label);
  }

  // Route files exist for buy/rent/properties/projects/contact/marketplace/find-my-home
  for (const routeFile of [
    "src/app/[lang]/buy/page.tsx",
    "src/app/[lang]/rent/page.tsx",
    "src/app/[lang]/properties/page.tsx",
    "src/app/[lang]/projects/page.tsx",
    "src/app/[lang]/contact/page.tsx",
    "src/app/[lang]/marketplace/page.tsx",
    "src/app/[lang]/find-my-home/page.tsx",
    "src/app/[lang]/list-your-property/page.tsx",
  ]) {
    assert.ok(existsSync(resolve(root, routeFile)), routeFile);
  }
});

check("home:no unsupported performance / yield claims", () => {
  for (const file of [HOME, PATHS, HERO]) {
    const src = read(file).toLowerCase();
    for (const banned of [
      "roi",
      "yield forecast",
      "guaranteed return",
      "best price guarantee",
      "fastest growing",
      "award-winning",
    ]) {
      assert.ok(!src.includes(banned), `${file} must not claim ${banned}`);
    }
    assert.ok(
      !/\b#1\b/.test(src) && !src.includes("number one"),
      `${file} must not claim #1 ranking`,
    );
  }
  const paths = read(PATHS);
  assert.ok(
    paths.includes("not a yield forecast") ||
      read("src/dictionaries/en.json").includes("not a yield forecast"),
    "sale scan disclaims yield forecast",
  );
});

check("home:keyboard focus contracts on conversion controls", () => {
  const paths = read(PATHS);
  const hero = read(HERO);
  const home = read(HOME);
  assert.ok(paths.includes("focus-visible:ring-2"), "paths focus-visible");
  assert.ok(hero.includes("focus-visible:ring-2"), "hero toggle focus-visible");
  assert.ok(hero.includes("min-h-11"), "hero submit touch/keyboard target");
  assert.ok(home.includes("focus-visible:ring-2"), "home view-all focus");
  assert.ok(home.includes('data-home-cta="contact"'), "contact CTA marked");
});

check("home:EN/ZH/TH conversion copy keys present", () => {
  const keys = [
    "pathsTitle",
    "pathsSubtitle",
    "buy",
    "buyBody",
    "buyCta",
    "rent",
    "rentBody",
    "rentCta",
    "investment",
    "investmentBody",
    "investmentCta",
    "latestListingsTitle",
    "featuredProjectsTitle",
    "citiesTitle",
    "ctaButton",
    "developersSubtitle",
  ];
  for (const locale of ["en", "zh", "th"]) {
    const dict = JSON.parse(read(`src/dictionaries/${locale}.json`));
    for (const key of keys) {
      assert.ok(
        typeof dict.home?.[key] === "string" && dict.home[key].length > 0,
        `${locale}.home.${key}`,
      );
    }
  }
});

check("home:SEO metadata helpers unchanged on home route", () => {
  const home = read(HOME);
  assert.ok(home.includes("buildPageMetadata"), "metadata builder");
  assert.ok(home.includes("dict.meta.homeTitle"), "homeTitle");
  assert.ok(home.includes("organizationSchema"), "org json-ld");
  assert.ok(home.includes("websiteSchema"), "website json-ld");
});

if (process.exitCode) {
  console.log(JSON.stringify({ ok: false }));
  process.exit(1);
}
console.log(
  JSON.stringify({
    ok: true,
    sectionOrder: EXPECTED_SECTION_ORDER,
    checks: [
      "cta-routes",
      "section-order",
      "bounds",
      "claim-hygiene",
      "keyboard",
      "i18n",
    ],
  }),
);
