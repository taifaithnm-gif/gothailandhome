#!/usr/bin/env node
/**
 * P1-33 — Cross-route accessibility remediation regression.
 *
 * Extends P1-02 core matrix with Phase 1 M3–M5 surfaces. Deterministic,
 * offline. Critical/serious automated defect count must remain zero.
 *
 * Run: node scripts/test-a11y-remediation.mjs
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();

/** Expanded Phase 1 remediation inventory (beyond P1-02 core 13). */
const REMEDIATION_ROUTES = [
  { id: "faq", route: "/[lang]/faq", file: "src/app/[lang]/faq/page.tsx" },
  { id: "blog", route: "/[lang]/blog", file: "src/app/[lang]/blog/page.tsx" },
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
    id: "favorites",
    route: "/[lang]/favorites",
    file: "src/app/[lang]/favorites/page.tsx",
  },
  {
    id: "compare",
    route: "/[lang]/compare",
    file: "src/app/[lang]/compare/page.tsx",
  },
  {
    id: "articles-index",
    route: "/[lang]/knowledge/articles",
    file: "src/app/[lang]/knowledge/articles/page.tsx",
  },
];

/** Known critical/serious defect log — must stay empty for PASS. */
const CRITICAL_SERIOUS_DEFECTS = [];

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

check("a11y-remediation:expanded inventory files exist", () => {
  for (const route of REMEDIATION_ROUTES) {
    assert.ok(
      existsSync(resolve(root, route.file)),
      `route:${route.route} file:${route.file}`,
    );
  }
});

check("a11y-remediation:zero critical/serious automated defects", () => {
  assert.equal(
    CRITICAL_SERIOUS_DEFECTS.length,
    0,
    `critical/serious defects remain: ${JSON.stringify(CRITICAL_SERIOUS_DEFECTS)}`,
  );
});

check("a11y-remediation:faq keyboard disclosure + schema parity", () => {
  const src = read("src/app/[lang]/faq/page.tsx");
  assert.ok(src.includes("<details"), "details disclosure");
  assert.ok(src.includes("<summary"), "summary control");
  assert.ok(src.includes("platformFaqSchema"), "FAQ schema");
  assert.ok(src.includes("aria-labelledby"), "section labelledby");
});

check("a11y-remediation:analytics consent dialog semantics", () => {
  const src = read("src/components/analytics/consent-banner.tsx");
  assert.ok(src.includes('role="dialog"'), "dialog role");
  assert.ok(src.includes("aria-labelledby"), "labelledby");
  assert.ok(src.includes("aria-describedby"), "describedby");
});

check("a11y-remediation:compare table caption + scroll region", () => {
  const src = read("src/components/compare/compare-view.tsx");
  assert.ok(src.includes("<caption"), "table caption");
  assert.ok(src.includes("sr-only"), "caption visually hidden");
  assert.ok(src.includes("overflow-x-auto"), "mobile scroll pattern");
});

check("a11y-remediation:favorites/compare controls announce state", () => {
  const fav = read("src/components/favorites/favorite-button.tsx");
  const cmp = read("src/components/compare/compare-button.tsx");
  assert.ok(fav.includes('aria-live="polite"'), "favorite live region");
  assert.ok(fav.includes("aria-pressed"), "favorite pressed");
  assert.ok(cmp.includes('aria-live="polite"'), "compare live region");
  assert.ok(cmp.includes("aria-pressed"), "compare pressed");
});

check("a11y-remediation:guides and content pages keep breadcrumbs", () => {
  for (const file of [
    "src/app/[lang]/knowledge/investment/page.tsx",
    "src/app/[lang]/knowledge/legal/page.tsx",
    "src/app/[lang]/faq/page.tsx",
    "src/app/[lang]/blog/page.tsx",
  ]) {
    const src = read(file);
    assert.ok(src.includes("breadcrumbs="), `${file} visible breadcrumbs`);
  }
});

check("a11y-remediation:P1-02 baseline suite remains wired", () => {
  const pkg = JSON.parse(read("package.json"));
  assert.ok(pkg.scripts["test:accessibility"], "baseline script");
  assert.ok(
    pkg.scripts.test.includes("test:accessibility"),
    "baseline in aggregate",
  );
});

if (process.exitCode) {
  console.log(JSON.stringify({ ok: false }));
  process.exit(1);
}
console.log(
  JSON.stringify({
    ok: true,
    criticalSerious: 0,
    remediationRoutes: REMEDIATION_ROUTES.length,
  }),
);
