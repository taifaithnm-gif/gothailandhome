#!/usr/bin/env node
/**
 * P1-03 — Responsive verification matrix for core public routes.
 *
 * Deterministic, offline checks (no browser, no live network). Failures name
 * route + viewport + selector so overflow, clipped controls, and unusable
 * target-size regressions can be traced to a surface.
 *
 * Agreed viewport matrix (CSS px, Tailwind-aligned):
 *   - mobile  375  → below sm/md/lg: single-column / mobile chrome
 *   - tablet  768  → md+ stacking and mid grids
 *   - desktop 1280 → lg+/xl multi-column chrome
 *
 * Screenshot / evidence output policy:
 *   artifacts/responsive/{routeId}/{viewportId}.png
 *   See artifacts/responsive/README.md (captures are optional local evidence;
 *   this suite enforces structural responsive contracts in CI).
 *
 * Run: node scripts/test-responsive-matrix.mjs
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();

/** Agreed Phase 1 viewport matrix. */
export const VIEWPORTS = [
  {
    id: "mobile",
    width: 375,
    label: "mobile",
    band: "<640/<768/<1024",
    expects: ["single-column-default", "mobile-nav-chrome", "touch-targets"],
  },
  {
    id: "tablet",
    width: 768,
    label: "tablet",
    band: "md+",
    expects: ["mid-grids", "footer-columns"],
  },
  {
    id: "desktop",
    width: 1280,
    label: "desktop",
    band: "lg+/xl",
    expects: ["primary-nav", "multi-column-detail"],
  },
];

/**
 * Core public routes — aligned with P1-02 accessibility baseline inventory.
 * `components` are the responsive owners checked for each route.
 */
export const CORE_ROUTES = [
  {
    id: "home",
    route: "/[lang]",
    file: "src/app/[lang]/page.tsx",
    components: [
      "src/app/[lang]/page.tsx",
      "src/components/listings/hero-search.tsx",
      "src/components/layout/site-header.tsx",
      "src/components/layout/site-footer.tsx",
    ],
  },
  {
    id: "properties",
    route: "/[lang]/properties",
    file: "src/app/[lang]/properties/page.tsx",
    components: [
      "src/app/[lang]/properties/page.tsx",
      "src/components/listings/listing-filters.tsx",
      "src/components/property/property-grid.tsx",
      "src/components/listings/listing-pagination.tsx",
    ],
  },
  {
    id: "property-detail",
    route: "/[lang]/properties/[id]",
    file: "src/app/[lang]/properties/[id]/page.tsx",
    components: [
      "src/app/[lang]/properties/[id]/page.tsx",
      "src/components/property/listing-gallery.tsx",
      "src/components/property/property-card.tsx",
    ],
  },
  {
    id: "projects",
    route: "/[lang]/projects",
    file: "src/app/[lang]/projects/page.tsx",
    components: ["src/app/[lang]/projects/page.tsx"],
  },
  {
    id: "project-detail",
    route: "/[lang]/projects/[slug]",
    file: "src/app/[lang]/projects/[slug]/page.tsx",
    components: ["src/app/[lang]/projects/[slug]/page.tsx"],
  },
  {
    id: "developer-detail",
    route: "/[lang]/developers/[slug]",
    file: "src/app/[lang]/developers/[slug]/page.tsx",
    components: [
      "src/app/[lang]/developers/[slug]/page.tsx",
      "src/components/developer/developer-center.tsx",
    ],
  },
  {
    id: "district-detail",
    route: "/[lang]/districts/[slug]",
    file: "src/app/[lang]/districts/[slug]/page.tsx",
    components: [
      "src/app/[lang]/districts/[slug]/page.tsx",
      "src/components/district/district-center.tsx",
    ],
  },
  {
    id: "marketplace",
    route: "/[lang]/marketplace",
    file: "src/app/[lang]/marketplace/page.tsx",
    components: [
      "src/app/[lang]/marketplace/page.tsx",
      "src/components/marketplace/marketplace-entry-grid.tsx",
    ],
  },
  {
    id: "find-my-home",
    route: "/[lang]/find-my-home",
    file: "src/app/[lang]/find-my-home/page.tsx",
    components: [
      "src/app/[lang]/find-my-home/page.tsx",
      "src/components/marketplace/find-my-home-form.tsx",
      "src/components/marketplace/form-kit.tsx",
    ],
  },
  {
    id: "contact",
    route: "/[lang]/contact",
    file: "src/app/[lang]/contact/page.tsx",
    components: ["src/app/[lang]/contact/page.tsx"],
  },
  {
    id: "knowledge",
    route: "/[lang]/knowledge",
    file: "src/app/[lang]/knowledge/page.tsx",
    components: ["src/app/[lang]/knowledge/page.tsx"],
  },
];

const ARTIFACTS_README = "artifacts/responsive/README.md";

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

function requireIn(file, needle, ctx) {
  const src = read(file);
  assert.ok(
    src.includes(needle),
    `${ctx} file:${file} missing ${JSON.stringify(needle)}`,
  );
}

function forbidIn(file, needle, ctx) {
  const src = read(file);
  assert.ok(
    !src.includes(needle),
    `${ctx} file:${file} forbidden pattern ${JSON.stringify(needle)}`,
  );
}

check("responsive:viewport matrix definition (375/768/1280)", () => {
  assert.deepEqual(
    VIEWPORTS.map((v) => v.width),
    [375, 768, 1280],
  );
  assert.deepEqual(
    VIEWPORTS.map((v) => v.id),
    ["mobile", "tablet", "desktop"],
  );
});

check("responsive:core route inventory files exist", () => {
  assert.equal(CORE_ROUTES.length, 11, "expected 11 core responsive routes");
  for (const route of CORE_ROUTES) {
    assert.ok(
      existsSync(resolve(root, route.file)),
      `route:${route.route} viewport:* file:${route.file}`,
    );
    for (const file of route.components) {
      assert.ok(
        existsSync(resolve(root, file)),
        `route:${route.route} viewport:* file:${file}`,
      );
    }
  }
});

check("responsive:screenshot output directory policy documented", () => {
  assert.ok(
    existsSync(resolve(root, ARTIFACTS_README)),
    `missing ${ARTIFACTS_README}`,
  );
  const readme = read(ARTIFACTS_README);
  for (const needle of [
    "artifacts/responsive/{routeId}/{viewportId}.png",
    "375",
    "768",
    "1280",
    "overflow",
    "target size",
  ]) {
    assert.ok(
      readme.includes(needle),
      `${ARTIFACTS_README} must document ${JSON.stringify(needle)}`,
    );
  }
});

check("responsive:shell overflow + chrome contracts (all routes)", () => {
  const header = "src/components/layout/site-header.tsx";
  const footer = "src/components/layout/site-footer.tsx";
  const globals = "src/app/globals.css";

  // Container padding prevents edge clipping at every viewport.
  requireIn(
    globals,
    "padding-inline: var(--space-4)",
    "route:shell viewport:mobile selector:.ds-container",
  );
  requireIn(
    globals,
    "@media (min-width: 640px)",
    "route:shell viewport:tablet selector:.ds-container",
  );
  requireIn(
    globals,
    "max-width: var(--container)",
    "route:shell viewport:desktop selector:.ds-container",
  );

  // Mobile: hamburger chrome; desktop: primary nav.
  requireIn(
    header,
    "lg:hidden",
    "route:shell viewport:mobile selector:button[aria-controls=mobile-nav]",
  );
  requireIn(
    header,
    "lg:flex",
    "route:shell viewport:desktop selector:nav[aria-label=Primary]",
  );
  requireIn(
    header,
    "overflow-x-auto",
    "route:shell viewport:desktop selector:nav overflow policy",
  );
  requireIn(
    header,
    "ds-container",
    "route:shell viewport:* selector:header .ds-container",
  );

  // Tablet+: footer columns.
  requireIn(
    footer,
    "md:grid-cols-[1.4fr_1fr_1fr]",
    "route:shell viewport:tablet selector:footer grid",
  );

  // Locale layout must keep a single main column (no fixed desktop-only shell width).
  forbidIn(
    "src/app/[lang]/layout.tsx",
    "w-screen",
    "route:shell viewport:* selector:body/layout",
  );
});

check("responsive:route:/[lang] viewport matrix layout contracts", () => {
  const home = "src/app/[lang]/page.tsx";
  const hero = "src/components/listings/hero-search.tsx";
  requireIn(
    home,
    "sm:grid-cols-2 lg:grid-cols-3",
    "route:/[lang] viewport:tablet selector:featured grids",
  );
  requireIn(
    home,
    "md:min-h-[72vh]",
    "route:/[lang] viewport:tablet selector:hero min-height",
  );
  requireIn(
    home,
    "overflow-hidden",
    "route:/[lang] viewport:mobile selector:hero overflow containment",
  );
  requireIn(
    hero,
    "sm:grid-cols-2 lg:grid-cols-5",
    "route:/[lang] viewport:desktop selector:hero-search grid",
  );
});

check("responsive:route:/[lang]/properties overflow+target-size contracts", () => {
  const filters = "src/components/listings/listing-filters.tsx";
  const grid = "src/components/property/property-grid.tsx";

  // Mobile disclosure prevents filter form from forcing horizontal overflow.
  requireIn(
    filters,
    'aria-controls="listing-filter-drawer"',
    "route:/[lang]/properties viewport:mobile selector:button[aria-controls=listing-filter-drawer]",
  );
  requireIn(
    filters,
    "min-h-11",
    "route:/[lang]/properties viewport:mobile selector:filter CTA min-h-11",
  );
  requireIn(
    filters,
    "min-w-11",
    "route:/[lang]/properties viewport:mobile selector:drawer close min-w-11",
  );
  requireIn(
    filters,
    "grid gap-3 sm:grid-cols-2",
    "route:/[lang]/properties viewport:tablet selector:filter field grid",
  );
  requireIn(
    grid,
    "sm:grid-cols-2 xl:grid-cols-3",
    "route:/[lang]/properties viewport:desktop selector:property-grid",
  );
});

check("responsive:route:/[lang]/properties/[id] detail+gallery contracts", () => {
  const detail = "src/app/[lang]/properties/[id]/page.tsx";
  const gallery = "src/components/property/listing-gallery.tsx";
  const card = "src/components/property/property-card.tsx";

  requireIn(
    detail,
    "lg:grid-cols-[1.45fr_0.9fr]",
    "route:/[lang]/properties/[id] viewport:desktop selector:detail split grid",
  );
  requireIn(
    detail,
    "grid grid-cols-2 gap-4 sm:grid-cols-4",
    "route:/[lang]/properties/[id] viewport:mobile selector:facts grid",
  );
  requireIn(
    gallery,
    "overflow-x-auto",
    "route:/[lang]/properties/[id] viewport:mobile selector:gallery thumbs overflow-x-auto",
  );
  requireIn(
    card,
    "min-h-11",
    "route:/[lang]/properties/[id] viewport:mobile selector:card CTA min-h-11",
  );
});

check("responsive:route:projects/developers/districts layout contracts", () => {
  requireIn(
    "src/app/[lang]/projects/page.tsx",
    "sm:grid-cols-2",
    "route:/[lang]/projects viewport:tablet selector:project list grid",
  );
  requireIn(
    "src/app/[lang]/projects/[slug]/page.tsx",
    "lg:grid-cols-[1.4fr_0.8fr]",
    "route:/[lang]/projects/[slug] viewport:desktop selector:project split grid",
  );
  requireIn(
    "src/app/[lang]/projects/[slug]/page.tsx",
    "sm:grid-cols-2",
    "route:/[lang]/projects/[slug] viewport:tablet selector:project fact grids",
  );
  requireIn(
    "src/components/developer/developer-center.tsx",
    "lg:grid-cols-[1.4fr_0.8fr]",
    "route:/[lang]/developers/[slug] viewport:desktop selector:developer split grid",
  );
  requireIn(
    "src/components/developer/developer-center.tsx",
    "sm:grid-cols-2",
    "route:/[lang]/developers/[slug] viewport:tablet selector:developer grids",
  );
  requireIn(
    "src/components/district/district-center.tsx",
    "sm:grid-cols-2 lg:grid-cols-4",
    "route:/[lang]/districts/[slug] viewport:desktop selector:district stats grid",
  );
  requireIn(
    "src/components/district/district-center.tsx",
    "ds-container",
    "route:/[lang]/districts/[slug] viewport:* selector:.ds-container",
  );
});

check("responsive:route:marketplace/forms/contact/knowledge contracts", () => {
  requireIn(
    "src/components/marketplace/marketplace-entry-grid.tsx",
    "sm:grid-cols-2 lg:grid-cols-3",
    "route:/[lang]/marketplace viewport:desktop selector:entry-grid",
  );
  requireIn(
    "src/components/marketplace/form-kit.tsx",
    "grid gap-4 sm:grid-cols-2",
    "route:/[lang]/find-my-home viewport:tablet selector:FormRow grid",
  );
  requireIn(
    "src/components/marketplace/find-my-home-form.tsx",
    "FormField",
    "route:/[lang]/find-my-home viewport:* selector:FormField",
  );
  requireIn(
    "src/app/[lang]/contact/page.tsx",
    "lg:grid-cols-[1.2fr_0.8fr]",
    "route:/[lang]/contact viewport:desktop selector:contact split grid",
  );
  requireIn(
    "src/app/[lang]/knowledge/page.tsx",
    "md:grid-cols-3",
    "route:/[lang]/knowledge viewport:tablet selector:knowledge cards",
  );
  requireIn(
    "src/app/[lang]/knowledge/page.tsx",
    "sm:grid-cols-2",
    "route:/[lang]/knowledge viewport:tablet selector:knowledge secondary grid",
  );
});

check("responsive:matrix coverage — every route×viewport is addressable", () => {
  // Meta-check: matrix cartesian product is defined and each cell has an owner file.
  const cells = [];
  for (const route of CORE_ROUTES) {
    for (const viewport of VIEWPORTS) {
      cells.push({
        route: route.route,
        viewport: viewport.id,
        width: viewport.width,
        file: route.file,
      });
      assert.ok(
        existsSync(resolve(root, route.file)),
        `route:${route.route} viewport:${viewport.id}(${viewport.width}) file:${route.file}`,
      );
    }
  }
  assert.equal(
    cells.length,
    CORE_ROUTES.length * VIEWPORTS.length,
    "incomplete route×viewport matrix",
  );
});

check("responsive:critical overflow anti-patterns absent on core owners", () => {
  // Fixed full-viewport widths on route owners commonly cause horizontal scroll.
  for (const route of CORE_ROUTES) {
    for (const file of route.components) {
      forbidIn(
        file,
        "w-screen",
        `route:${route.route} viewport:mobile selector:w-screen`,
      );
    }
  }
});

if (process.exitCode) {
  console.log(
    JSON.stringify({
      ok: false,
      viewports: VIEWPORTS.map((v) => ({ id: v.id, width: v.width })),
      routes: CORE_ROUTES.map((r) => r.route),
    }),
  );
  process.exit(1);
}

console.log(
  JSON.stringify({
    ok: true,
    viewports: VIEWPORTS.map((v) => ({ id: v.id, width: v.width })),
    routes: CORE_ROUTES.map((r) => r.route),
    cells: CORE_ROUTES.length * VIEWPORTS.length,
    artifactsPolicy: ARTIFACTS_README,
    checks: [
      "overflow-containment",
      "mobile-nav-chrome",
      "responsive-grids",
      "touch-target-min-h-11",
      "gallery-overflow-x",
      "screenshot-output-policy",
    ],
  }),
);
