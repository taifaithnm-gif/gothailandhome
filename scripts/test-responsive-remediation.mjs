#!/usr/bin/env node
/**
 * P1-34 — Cross-route responsive remediation regression.
 *
 * Extends P1-03 viewport matrix with M3–M5 surfaces. Ensures compare/content
 * tables have usable mobile patterns and no horizontal-overflow anti-patterns
 * on remediation owners.
 *
 * Run: node scripts/test-responsive-remediation.mjs
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();

const VIEWPORTS = [
  { id: "mobile", width: 375 },
  { id: "tablet", width: 768 },
  { id: "desktop", width: 1280 },
];

const REMEDIATION_ROUTES = [
  {
    id: "faq",
    route: "/[lang]/faq",
    file: "src/app/[lang]/faq/page.tsx",
  },
  {
    id: "blog",
    route: "/[lang]/blog",
    file: "src/app/[lang]/blog/page.tsx",
  },
  {
    id: "investment",
    route: "/[lang]/knowledge/investment",
    file: "src/app/[lang]/knowledge/investment/page.tsx",
  },
  {
    id: "legal",
    route: "/[lang]/knowledge/legal",
    file: "src/app/[lang]/knowledge/legal/page.tsx",
  },
  {
    id: "compare",
    route: "/[lang]/compare",
    file: "src/app/[lang]/compare/page.tsx",
    components: ["src/components/compare/compare-view.tsx"],
  },
  {
    id: "favorites",
    route: "/[lang]/favorites",
    file: "src/app/[lang]/favorites/page.tsx",
    components: ["src/components/favorites/favorites-board.tsx"],
  },
];

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

check("responsive-remediation:viewport matrix intact", () => {
  assert.deepEqual(
    VIEWPORTS.map((v) => v.width),
    [375, 768, 1280],
  );
});

check("responsive-remediation:expanded inventory exists", () => {
  for (const route of REMEDIATION_ROUTES) {
    assert.ok(existsSync(resolve(root, route.file)), route.file);
    for (const file of route.components ?? []) {
      assert.ok(existsSync(resolve(root, file)), file);
    }
  }
});

check("responsive-remediation:compare table mobile scroll pattern", () => {
  const src = read("src/components/compare/compare-view.tsx");
  assert.ok(src.includes("overflow-x-auto"), "horizontal scroll container");
  assert.ok(src.includes("min-w-["), "table min-width for scroll");
  assert.ok(src.includes('data-slot="compare-table-scroll"'), "scroll marker");
});

check("responsive-remediation:content grids use responsive columns", () => {
  const knowledge = read("src/app/[lang]/knowledge/page.tsx");
  assert.ok(
    knowledge.includes("md:grid-cols-") || knowledge.includes("sm:grid-cols-"),
    "knowledge responsive grid",
  );
  const blog = read("src/app/[lang]/blog/page.tsx");
  assert.ok(
    blog.includes("md:grid-cols-") || blog.includes("grid gap"),
    "blog layout",
  );
});

check("responsive-remediation:touch targets on engagement controls", () => {
  for (const file of [
    "src/components/favorites/favorite-button.tsx",
    "src/components/compare/compare-button.tsx",
  ]) {
    const src = read(file);
    assert.ok(src.includes("min-h-11"), `${file} min height`);
    assert.ok(src.includes("min-w-11"), `${file} min width`);
  }
});

check("responsive-remediation:artifacts policy documented", () => {
  const readme = read("artifacts/responsive/README.md");
  assert.ok(readme.includes("375"));
  assert.ok(readme.includes("768"));
  assert.ok(readme.includes("1280"));
});

check("responsive-remediation:no overflow-x-hidden clip on compare", () => {
  const src = read("src/components/compare/compare-view.tsx");
  assert.ok(
    !src.includes("overflow-x-hidden"),
    "must not clip compare table actions",
  );
});

check("responsive-remediation:P1-03 baseline remains wired", () => {
  const pkg = JSON.parse(read("package.json"));
  assert.ok(pkg.scripts["test:responsive"]);
  assert.ok(pkg.scripts.test.includes("test:responsive"));
});

if (process.exitCode) {
  console.log(JSON.stringify({ ok: false }));
  process.exit(1);
}
console.log(
  JSON.stringify({
    ok: true,
    viewports: VIEWPORTS,
    remediationRoutes: REMEDIATION_ROUTES.length,
  }),
);
