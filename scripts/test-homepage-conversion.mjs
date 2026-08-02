#!/usr/bin/env node
/**
 * P1-05 — Homepage conversion hierarchy contracts.
 *
 * Offline checks: CTA routes, section order, featured bounds, claim hygiene,
 * keyboard focus affordances. No live network / property APIs.
 *
 * Updated for CONTENT_LAUNCH_V1 curated homepage.
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
const LAUNCH = "src/lib/launch/content-launch-v1.ts";

const EXPECTED_SECTION_ORDER = [
  "hero",
  "sources",
  "paths",
  "listings",
  "projects",
  "areas",
  "developers",
  "knowledge",
  "why",
  "journey",
  "categories",
  "marketplace",
  "consultation",
  "trust",
];

check("home:conversion files exist", () => {
  for (const file of [HOME, PATHS, HERO, LAUNCH]) {
    assert.ok(existsSync(resolve(root, file)), file);
  }
});

check("home:launch package files exist", () => {
  for (const file of [
    "CONTENT_LAUNCH_V1/homepage_content.json",
    "CONTENT_LAUNCH_V1/featured_projects.json",
    "CONTENT_LAUNCH_V1/developer_content.json",
    "CONTENT_LAUNCH_V1/knowledge_cards.json",
    "CONTENT_LAUNCH_V1/area_content.json",
    "CONTENT_LAUNCH_V1/cta_content.json",
    "CONTENT_LAUNCH_V1/image_manifest.json",
  ]) {
    assert.ok(existsSync(resolve(root, file)), file);
  }
});

check("home:section order content-launch hierarchy", () => {
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
  assert.ok(
    home.lastIndexOf('data-home-section="trust"') >
      home.indexOf('data-home-section="consultation"'),
    "trust after consultation",
  );
});

check("home:featured sections use launch bounds", () => {
  const home = read(HOME);
  assert.ok(home.includes("HOME_BOUNDS"), "HOME_BOUNDS present");
  assert.ok(home.includes("listings: 6"), "listings bound 6");
  assert.ok(home.includes("projects: 12"), "projects bound 12");
  assert.ok(home.includes("developers: 10"), "developers bound 10");
  assert.ok(home.includes("knowledge: 6"), "knowledge bound 6");
  assert.ok(home.includes("getFeaturedLaunchProjects"), "uses launch projects");
  assert.ok(home.includes("getLaunchDevelopers"), "uses launch developers");
  assert.ok(home.includes("getLaunchKnowledgeCards"), "uses launch knowledge");
});

check("home:empty listings section is gated", () => {
  const home = read(HOME);
  assert.ok(
    home.includes("latestListings.length > 0"),
    "listings hidden when empty",
  );
  assert.ok(
    home.includes("featuredProjects.length > 0"),
    "projects hidden when empty",
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
      needle: "listing_type=sale&city=bangkok&sort=price_asc",
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
  for (const [file, src] of [
    [PATHS, paths],
    [HERO, hero],
    [HOME, home],
  ]) {
    assert.ok(
      src.includes("focus-visible:ring") || src.includes("focus-visible:"),
      `${file} uses focus-visible affordance`,
    );
  }
});

check("home:launch counts match package", () => {
  const projects = JSON.parse(
    read("CONTENT_LAUNCH_V1/featured_projects.json"),
  );
  const developers = JSON.parse(
    read("CONTENT_LAUNCH_V1/developer_content.json"),
  );
  const knowledge = JSON.parse(read("CONTENT_LAUNCH_V1/knowledge_cards.json"));
  assert.equal(projects.projects.length, 12, "12 featured projects");
  assert.equal(developers.developers.length, 10, "10 developers");
  assert.equal(knowledge.cards.length, 21, "21 knowledge cards");
  assert.ok(
    knowledge.cards.every((c) => c.publish_ready),
    "all knowledge cards publish_ready",
  );
});

if (process.exitCode) {
  console.error("Homepage conversion checks failed.");
  process.exit(process.exitCode);
} else {
  console.log("All homepage conversion checks passed.");
}
