#!/usr/bin/env node
/**
 * P1-02 — Deterministic accessibility baseline for core public routes and forms.
 *
 * No browser automation and no live network. Failures name route + selector/file.
 *
 * Documented keyboard / focus / form-error contracts checked by this suite:
 * - Skip link targets #main-content and becomes visible on focus
 * - Primary + mobile navigation expose landmarks / expand state
 * - Interactive controls retain focus-visible styles
 * - Form labels use htmlFor; field errors/failures use role="alert"
 * - Loading/success use polite live regions; route errors focus the title
 * - Gallery and card CTAs expose accessible names
 *
 * Run: node scripts/test-accessibility-baseline.mjs
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();

/** Agreed Alpha / Phase 1 core public route set for a11y baseline. */
const CORE_ROUTES = [
  {
    id: "home",
    route: "/[lang]",
    file: "src/app/[lang]/page.tsx",
  },
  {
    id: "properties",
    route: "/[lang]/properties",
    file: "src/app/[lang]/properties/page.tsx",
  },
  {
    id: "property-detail",
    route: "/[lang]/properties/[id]",
    file: "src/app/[lang]/properties/[id]/page.tsx",
  },
  {
    id: "projects",
    route: "/[lang]/projects",
    file: "src/app/[lang]/projects/page.tsx",
  },
  {
    id: "project-detail",
    route: "/[lang]/projects/[slug]",
    file: "src/app/[lang]/projects/[slug]/page.tsx",
  },
  {
    id: "developer-detail",
    route: "/[lang]/developers/[slug]",
    file: "src/app/[lang]/developers/[slug]/page.tsx",
  },
  {
    id: "district-detail",
    route: "/[lang]/districts/[slug]",
    file: "src/app/[lang]/districts/[slug]/page.tsx",
  },
  {
    id: "marketplace",
    route: "/[lang]/marketplace",
    file: "src/app/[lang]/marketplace/page.tsx",
  },
  {
    id: "find-my-home",
    route: "/[lang]/find-my-home",
    file: "src/app/[lang]/find-my-home/page.tsx",
  },
  {
    id: "contact",
    route: "/[lang]/contact",
    file: "src/app/[lang]/contact/page.tsx",
  },
  {
    id: "knowledge",
    route: "/[lang]/knowledge",
    file: "src/app/[lang]/knowledge/page.tsx",
  },
  {
    id: "loading-boundary",
    route: "/[lang] (loading)",
    file: "src/app/[lang]/loading.tsx",
  },
  {
    id: "error-boundary",
    route: "/[lang] (error)",
    file: "src/app/[lang]/error.tsx",
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

function requireIn(file, needle, selector) {
  const src = read(file);
  assert.ok(
    src.includes(needle),
    `${file} selector:${selector} missing ${JSON.stringify(needle)}`,
  );
}

check("a11y:core route inventory files exist", () => {
  for (const route of CORE_ROUTES) {
    assert.ok(
      existsSync(resolve(root, route.file)),
      `route:${route.route} file:${route.file}`,
    );
  }
  assert.equal(CORE_ROUTES.length, 13, "expected 13 core routes");
});

check("a11y:route:/[lang] selector:skip-link+main landmark", () => {
  const layout = "src/app/[lang]/layout.tsx";
  requireIn(layout, 'href="#main-content"', "a[href='#main-content']");
  requireIn(layout, "dict.nav.skipToContent", "skip link label");
  requireIn(layout, 'id="main-content"', "main#main-content");
  requireIn(layout, "<main", "main landmark");
  requireIn(layout, "sr-only", "visually hidden until focus");
});

check("a11y:route:shell selector:header/footer landmarks", () => {
  requireIn(
    "src/components/layout/site-header.tsx",
    'aria-label="Primary"',
    "nav[aria-label=Primary]",
  );
  requireIn(
    "src/components/layout/site-header.tsx",
    "aria-expanded={open}",
    "button[aria-expanded]",
  );
  requireIn(
    "src/components/layout/site-header.tsx",
    'aria-controls="mobile-nav"',
    "button[aria-controls=mobile-nav]",
  );
  requireIn(
    "src/components/layout/site-header.tsx",
    "focus-visible:ring-2",
    "nav link focus-visible",
  );
  requireIn(
    "src/components/layout/site-footer.tsx",
    "<footer",
    "footer landmark",
  );
});

check("a11y:keyboard/focus contracts documented in UI primitives", () => {
  requireIn(
    "src/components/ui/button.tsx",
    "focus-visible:ring-3",
    "button focus-visible ring",
  );
  requireIn(
    "src/components/ui/field.tsx",
    "focus-visible:ring-3",
    "field control focus-visible",
  );
  requireIn(
    "src/components/ui/breadcrumb.tsx",
    'aria-label="Breadcrumb"',
    "nav[aria-label=Breadcrumb]",
  );
  requireIn(
    "src/components/ui/breadcrumb.tsx",
    'aria-current={last ? "page" : undefined}',
    "[aria-current=page]",
  );
  requireIn(
    "src/components/ui/states.tsx",
    'role="status"',
    "LoadingState[role=status]",
  );
  requireIn(
    "src/components/ui/states.tsx",
    'aria-live="polite"',
    "LoadingState[aria-live=polite]",
  );
  requireIn(
    "src/components/ui/states.tsx",
    'role="alert"',
    "ErrorState[role=alert]",
  );
  requireIn(
    "src/components/ui/states.tsx",
    "focusTitle ? -1 : undefined",
    "ErrorState title tabIndex focus target",
  );
});

check("a11y:form-error contracts for marketplace kit", () => {
  requireIn(
    "src/components/ui/field.tsx",
    'role="alert"',
    "FieldError[role=alert]",
  );
  requireIn(
    "src/components/marketplace/form-kit.tsx",
    "htmlFor={htmlFor}",
    "FormField label[htmlFor]",
  );
  requireIn(
    "src/components/marketplace/form-kit.tsx",
    'role="alert"',
    "FormFailureBanner[role=alert]",
  );
  requireIn(
    "src/components/marketplace/form-kit.tsx",
    'role="status"',
    "FormSuccessState[role=status]",
  );
  requireIn(
    "src/components/marketplace/form-kit.tsx",
    'aria-live="polite"',
    "FormSuccessState[aria-live=polite]",
  );
  requireIn(
    "src/components/marketplace/form-kit.tsx",
    "aria-busy={pending}",
    "FormSubmitButton[aria-busy]",
  );
  requireIn(
    "src/components/marketplace/form-kit.tsx",
    "ConsentCheckbox",
    "ConsentCheckbox",
  );
});

check("a11y:route:/[lang]/find-my-home selector:labeled fields+errors", () => {
  const form = "src/components/marketplace/find-my-home-form.tsx";
  requireIn(form, 'htmlFor="name"', "label[for=name]");
  requireIn(form, 'id="name"', "input#name");
  requireIn(form, "ConsentCheckbox", "consent control");
  requireIn(form, "FormFailureBanner", "form failure alert");
  requireIn(form, "FormSubmitButton", "submit with aria-busy");
});

check("a11y:route:/[lang]/properties selector:filter keyboard disclosure", () => {
  const filters = "src/components/listings/listing-filters.tsx";
  requireIn(filters, "aria-expanded={open}", "filters[aria-expanded]");
  requireIn(
    filters,
    'aria-controls="listing-filter-drawer"',
    "filters[aria-controls]",
  );
  requireIn(filters, "htmlFor={`${idPrefix}-q`}", "keyword label association");
  requireIn(
    filters,
    "htmlFor={`${idPrefix}-min-price`}",
    "min price label association",
  );
  requireIn(
    filters,
    "htmlFor={`${idPrefix}-max-price`}",
    "max price label association",
  );
  requireIn(filters, 'role="dialog"', "mobile filter dialog");
  requireIn(filters, 'Escape', "escape closes drawer");
  requireIn(filters, "resolveDistrictForCity", "city/district dependency");
});

check("a11y:route:/[lang]/properties/[id] selector:gallery+sections", () => {
  requireIn(
    "src/components/property/listing-gallery.tsx",
    "aria-label={dict.property.gallery}",
    "section[aria-label=gallery]",
  );
  requireIn(
    "src/components/property/listing-gallery.tsx",
    "aria-current={i === index ? \"true\" : undefined}",
    "gallery thumb[aria-current]",
  );
  requireIn(
    "src/components/property/listing-gallery.tsx",
    "focus-visible:ring-3",
    "gallery thumb focus-visible",
  );
  requireIn(
    "src/components/property/property-card.tsx",
    "aria-label={viewLabel}",
    "card CTA unique accessible name",
  );
  requireIn(
    "src/components/property/property-card.tsx",
    "aria-label={helpLabel}",
    "card platform-help unique accessible name",
  );
  requireIn(
    "src/components/property/property-card.tsx",
    "alt={mediaAlt}",
    "card media unique alt",
  );
  requireIn(
    "src/app/[lang]/properties/[id]/page.tsx",
    'aria-labelledby="listing-facts-heading"',
    "section[aria-labelledby=listing-facts-heading]",
  );
});

check("a11y:route:loading/error boundaries live regions+focus", () => {
  requireIn(
    "src/app/[lang]/loading.tsx",
    "LoadingState",
    "loading uses LoadingState",
  );
  requireIn(
    "src/app/[lang]/error.tsx",
    "titleRef.current?.focus()",
    "error heading focus recovery",
  );
  requireIn(
    "src/app/[lang]/error.tsx",
    "unstable_retry()",
    "error retry control",
  );
  requireIn(
    "src/app/[lang]/error.tsx",
    "localePath(locale)",
    "error home recovery link",
  );
  requireIn(
    "src/components/leads/lead-result.tsx",
    'role="status"',
    "lead success[role=status]",
  );
  requireIn(
    "src/components/leads/lead-result.tsx",
    'role="alert"',
    "lead error[role=alert]",
  );
});

check("a11y:dictionary skipToContent en/zh/th", () => {
  for (const locale of ["en", "zh", "th"]) {
    const dict = JSON.parse(read(`src/dictionaries/${locale}.json`));
    assert.ok(
      typeof dict.nav?.skipToContent === "string" &&
        dict.nav.skipToContent.length > 0,
      `route:shell file:src/dictionaries/${locale}.json selector:nav.skipToContent`,
    );
  }
});

check("a11y:critical/serious selectors report route context", () => {
  // Meta-check: every CORE_ROUTES entry is referenced by at least one failure path above
  // via file existence; ensure property/project/developer/district files stay wired.
  for (const route of [
    "property-detail",
    "project-detail",
    "developer-detail",
    "district-detail",
    "marketplace",
    "contact",
    "knowledge",
  ]) {
    const entry = CORE_ROUTES.find((r) => r.id === route);
    assert.ok(entry, `missing core route id ${route}`);
    assert.ok(existsSync(resolve(root, entry.file)), entry.file);
  }
});

if (process.exitCode) {
  console.log(
    JSON.stringify({
      ok: false,
      coreRoutes: CORE_ROUTES.map((r) => r.route),
    }),
  );
  process.exit(1);
}
console.log(
  JSON.stringify({
    ok: true,
    coreRoutes: CORE_ROUTES.map((r) => r.route),
    checks: [
      "skip-link",
      "landmarks",
      "focus-visible",
      "form-errors",
      "live-regions",
      "gallery-names",
    ],
  }),
);
