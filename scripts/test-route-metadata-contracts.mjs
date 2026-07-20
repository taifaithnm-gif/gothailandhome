#!/usr/bin/env node
/**
 * MM-P0-03 — Deterministic regression coverage for Alpha route + SEO contracts.
 *
 * Covers: home, property, project, developer, district, lead result,
 * metadata/canonical/OG, JSON-LD, robots, and sitemap inventory wiring.
 *
 * No live database or network. Failures name exact route/contract.
 *
 * Run:
 *   node --experimental-strip-types --no-warnings scripts/test-route-metadata-contracts.mjs
 */
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();

const siteMod = await import(
  pathToFileURL(resolve(root, "src/config/site.ts")).href
);
const localeMod = await import(
  pathToFileURL(resolve(root, "src/config/locales.ts")).href
);

const { siteConfig } = siteMod;
const { locales, localeOpenGraph, localeHtmlLang } = localeMod;

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

function localePath(locale, path = "") {
  const normalized = path.startsWith("/") ? path : path ? `/${path}` : "";
  return `/${locale}${normalized}`;
}

function absoluteUrl(locale, path = "") {
  return `${siteConfig.url}${localePath(locale, path)}`;
}

const ROUTES = {
  home: "src/app/[lang]/page.tsx",
  properties: "src/app/[lang]/properties/page.tsx",
  property: "src/app/[lang]/properties/[id]/page.tsx",
  projects: "src/app/[lang]/projects/page.tsx",
  project: "src/app/[lang]/projects/[slug]/page.tsx",
  developers: "src/app/[lang]/developers/page.tsx",
  developer: "src/app/[lang]/developers/[slug]/page.tsx",
  district: "src/app/[lang]/districts/[slug]/page.tsx",
  leadSuccess: "src/app/[lang]/leads/success/page.tsx",
  leadError: "src/app/[lang]/leads/error/page.tsx",
  search: "src/app/[lang]/search/page.tsx",
  admin: "src/app/admin/layout.tsx",
  robots: "src/app/robots.ts",
  sitemap: "src/app/sitemap.ts",
  metadata: "src/lib/i18n/metadata.ts",
  schema: "src/lib/seo/schema.ts",
  jsonLd: "src/components/seo/json-ld.tsx",
  leadResult: "src/components/leads/lead-result.tsx",
  localeLayout: "src/app/[lang]/layout.tsx",
  localeLoading: "src/app/[lang]/loading.tsx",
  localeError: "src/app/[lang]/error.tsx",
  routeStateCopy: "src/lib/i18n/route-state-copy.ts",
  uiStates: "src/components/ui/states.tsx",
  rootLayout: "src/app/layout.tsx",
  documentFonts: "src/lib/ui/document-fonts.ts",
  ogDefault: "public/og/default.svg",
  projectRouteCheck: "scripts/check-project-routes.mjs",
  developerRouteCheck: "scripts/check-developer-routes.mjs",
};

const SITEMAP_STATIC_PATHS = [
  "",
  "/buy",
  "/rent",
  "/properties",
  "/projects",
  "/cities",
  "/developers",
  "/about",
  "/contact",
  "/marketplace",
  "/find-my-home",
  "/list-your-property",
  "/partners/developers",
  "/partners/agencies",
  "/knowledge",
  "/knowledge/glossary",
  "/knowledge/bangkok-districts",
];

const META_KEYS = [
  "homeTitle",
  "homeDescription",
  "propertiesTitle",
  "propertyDetailTitle",
  "projectTitle",
  "developersTitle",
  "searchTitle",
  "leadSuccessTitle",
  "leadErrorTitle",
  "buyTitle",
  "rentTitle",
];

check("route:/assets contract:critical files exist", () => {
  for (const [id, rel] of Object.entries(ROUTES)) {
    if (id === "rootLayout") {
      assert.ok(
        !existsSync(resolve(root, rel)),
        "top-level app/layout.tsx must not hardcode html lang",
      );
      continue;
    }
    assert.ok(existsSync(resolve(root, rel)), `${id}: missing ${rel}`);
  }
});

check("route:/[lang] contract:metadata+jsonld home", () => {
  const src = read(ROUTES.home);
  assert.ok(src.includes("generateMetadata"), "generateMetadata");
  assert.ok(src.includes("buildPageMetadata"), "buildPageMetadata");
  assert.ok(src.includes("dict.meta.homeTitle"), "homeTitle");
  assert.ok(src.includes("JsonLd"), "JsonLd");
  assert.ok(src.includes("organizationSchema"), "organizationSchema");
  assert.ok(src.includes("websiteSchema"), "websiteSchema");
});

check("route:/[lang]/properties contract:metadata+jsonld collection", () => {
  const src = read(ROUTES.properties);
  assert.ok(src.includes("generateMetadata"), "generateMetadata");
  assert.ok(src.includes('path: "/properties"'), "canonical path");
  assert.ok(src.includes("JsonLd"), "JsonLd");
  assert.ok(src.includes("collectionPageSchema"), "collectionPageSchema");
});

check("route:/[lang]/properties/[id] contract:metadata+jsonld listing", () => {
  const src = read(ROUTES.property);
  assert.ok(src.includes("generateMetadata"), "generateMetadata");
  assert.ok(
    src.includes("path: `/properties/${property.slug}`"),
    "canonical path",
  );
  assert.ok(src.includes("JsonLd"), "JsonLd");
  assert.ok(src.includes("listingSchema"), "listingSchema");
  assert.ok(src.includes("breadcrumbListSchema"), "breadcrumbListSchema");
});

check("route:/[lang]/projects/[slug] contract:metadata+jsonld project", () => {
  const src = read(ROUTES.project);
  assert.ok(src.includes("generateMetadata"), "generateMetadata");
  assert.ok(src.includes("buildPageMetadata"), "buildPageMetadata");
  assert.ok(src.includes("JsonLd"), "JsonLd");
  assert.ok(src.includes("projectSchema"), "projectSchema");
  assert.ok(src.includes("breadcrumbListSchema"), "breadcrumbListSchema");
});

check("route:/[lang]/developers/[slug] contract:metadata+jsonld developer", () => {
  const src = read(ROUTES.developer);
  assert.ok(src.includes("generateMetadata"), "generateMetadata");
  assert.ok(
    src.includes("path: `/developers/${slug}`"),
    "canonical path",
  );
  assert.ok(src.includes("JsonLd"), "JsonLd");
  assert.ok(src.includes("developerSchema"), "developerSchema");
  assert.ok(src.includes("breadcrumbListSchema"), "breadcrumbListSchema");
});

check("route:/[lang]/districts/[slug] contract:metadata+jsonld district", () => {
  const src = read(ROUTES.district);
  assert.ok(src.includes("generateMetadata"), "generateMetadata");
  assert.ok(
    src.includes("path: `/districts/${slug}`"),
    "canonical path",
  );
  assert.ok(src.includes("JsonLd"), "JsonLd");
  assert.ok(src.includes("districtSchema"), "districtSchema");
  assert.ok(src.includes("breadcrumbListSchema"), "breadcrumbListSchema");
});

check("route:/[lang]/leads/success contract:noindex lead result", () => {
  const src = read(ROUTES.leadSuccess);
  assert.ok(src.includes("generateMetadata"), "generateMetadata");
  assert.ok(src.includes('path: "/leads/success"'), "canonical path");
  assert.ok(src.includes("index: false"), "robots noindex");
  assert.ok(src.includes("LeadSuccessPanel"), "LeadSuccessPanel");
});

check("route:/[lang]/leads/error contract:noindex lead result", () => {
  const src = read(ROUTES.leadError);
  assert.ok(src.includes("generateMetadata"), "generateMetadata");
  assert.ok(src.includes('path: "/leads/error"'), "canonical path");
  assert.ok(src.includes("index: false"), "robots noindex");
  assert.ok(src.includes("LeadErrorPanel"), "LeadErrorPanel");
});

check("route:/[lang]/search contract:noindex redirect", () => {
  const src = read(ROUTES.search);
  assert.ok(src.includes("index: false"), "robots noindex");
  assert.ok(src.includes("redirect"), "redirect");
  assert.ok(src.includes('path: "/search"'), "canonical path");
});

check("route:/admin contract:noindex", () => {
  const src = read(ROUTES.admin);
  assert.ok(src.includes("index: false"), "robots noindex");
});

check("contract:metadata helper canonical+OG+twitter", () => {
  const src = read(ROUTES.metadata);
  assert.ok(src.includes('DEFAULT_OG_IMAGE = "/og/default.svg"'), "default OG");
  assert.ok(src.includes("canonical: url"), "canonical");
  assert.ok(src.includes('"zh-CN": absoluteUrl("zh", path)'), "hreflang zh-CN");
  assert.ok(src.includes("th: absoluteUrl(\"th\", path)"), "hreflang th");
  assert.ok(
    src.includes('"x-default": absoluteUrl("en", path)'),
    "hreflang x-default",
  );
  assert.ok(src.includes("images: [ogImage]"), "openGraph images");
  assert.ok(src.includes('card: "summary_large_image"'), "twitter card");
  assert.ok(src.includes("localeOpenGraph[locale]"), "openGraph locale");

  for (const locale of locales) {
    const home = absoluteUrl(locale);
    assert.equal(home, `${siteConfig.url}/${locale}`);
    assert.equal(
      absoluteUrl(locale, "/properties/sample"),
      `${siteConfig.url}/${locale}/properties/sample`,
    );
    assert.ok(localeOpenGraph[locale], `localeOpenGraph.${locale}`);
  }
});

check("contract:json-ld emitter is server-safe", () => {
  const src = read(ROUTES.jsonLd);
  assert.ok(src.includes('type="application/ld+json"'), "ld+json type");
  assert.ok(src.includes("dangerouslySetInnerHTML"), "inline JSON");
  assert.ok(src.includes("JSON.stringify"), "stringify");
});

check("contract:schema builders export Alpha types", () => {
  const src = read(ROUTES.schema);
  for (const name of [
    "organizationSchema",
    "websiteSchema",
    "listingSchema",
    "projectSchema",
    "developerSchema",
    "districtSchema",
    "breadcrumbListSchema",
    "collectionPageSchema",
  ]) {
    assert.ok(src.includes(`export function ${name}`), name);
  }
  assert.ok(src.includes('"@type": "Organization"'), "Organization");
  assert.ok(src.includes('"@type": "WebSite"'), "WebSite");
  assert.ok(src.includes('"@type": "ApartmentComplex"'), "ApartmentComplex");
  assert.ok(src.includes('"@type": "AdministrativeArea"'), "AdministrativeArea");
  assert.ok(src.includes("RealEstateListing"), "RealEstateListing");
  assert.ok(src.includes('"@type": "BreadcrumbList"'), "BreadcrumbList");
});

check("contract:robots disallow admin + sitemap host", () => {
  const src = read(ROUTES.robots);
  assert.ok(src.includes('disallow: ["/admin", "/admin/"]'), "disallow admin");
  assert.ok(src.includes("allow: \"/\""), "allow root");
  assert.ok(
    src.includes("sitemap: `${siteConfig.url}/sitemap.xml`"),
    "sitemap url",
  );
  assert.ok(src.includes("host: siteConfig.domain"), "host");
  assert.equal(siteConfig.domain, "www.gothailandhome.com");
  assert.equal(siteConfig.url, "https://www.gothailandhome.com");
});

check("contract:sitemap static inventory + dynamic families", () => {
  const src = read(ROUTES.sitemap);
  for (const path of SITEMAP_STATIC_PATHS) {
    const needle = path === "" ? '""' : `"${path}"`;
    assert.ok(src.includes(needle), `staticPath ${path || "(home)"}`);
  }
  assert.ok(
    src.includes("listPublishedPropertySlugsForSitemap"),
    "paged property slug inventory",
  );
  assert.ok(
    src.includes("buildLocalizedPropertySitemapEntries"),
    "localized property URL expansion",
  );
  assert.ok(
    !src.includes("listPublishedProperties("),
    "no uncapped listPublishedProperties",
  );
  assert.ok(src.includes("listPublishedProjects"), "projects source");
  assert.ok(src.includes("listPublishedDevelopers"), "developers source");
  assert.ok(src.includes("listDistricts"), "districts source");
  assert.ok(src.includes("/projects/${project.slug}"), "project URLs");
  assert.ok(src.includes("/developers/${developer.slug}"), "developer URLs");
  assert.ok(src.includes("/districts/${district.slug}"), "district URLs");
  assert.ok(!src.includes("/admin"), "no admin URLs");
  assert.ok(!src.includes("/leads/"), "no lead result URLs");
  assert.ok(!src.includes('"/search"'), "no search URLs");
});

check("contract:content fixtures for project/developer routes", () => {
  const projectRoot = resolve(root, "content/projects");
  const developerRoot = resolve(root, "content/developers");
  const projects = readdirSync(projectRoot).filter((name) =>
    existsSync(join(projectRoot, name, "manifest.json")),
  );
  const developers = readdirSync(developerRoot).filter((name) =>
    existsSync(join(developerRoot, name, "manifest.json")),
  );
  assert.equal(projects.length, 50, `expected 50 projects, got ${projects.length}`);
  assert.equal(
    developers.length,
    20,
    `expected 20 developers, got ${developers.length}`,
  );
});

check("contract:dictionary meta keys en/zh/th", () => {
  for (const locale of locales) {
    const dict = JSON.parse(read(`src/dictionaries/${locale}.json`));
    for (const key of META_KEYS) {
      assert.ok(
        typeof dict.meta?.[key] === "string" && dict.meta[key].length > 0,
        `${locale}.meta.${key}`,
      );
    }
  }
});

check("contract:local route smoke scripts target Alpha URL shapes", () => {
  const projectCheck = read(ROUTES.projectRouteCheck);
  const developerCheck = read(ROUTES.developerRouteCheck);
  assert.ok(
    projectCheck.includes("${BASE}/${LANG}/projects/${slug}"),
    "project URL shape",
  );
  assert.ok(
    developerCheck.includes("${BASE}/${LANG}/developers/${slug}"),
    "developer URL shape",
  );
  assert.ok(projectCheck.includes("Expected 50 project"), "project inventory");
  assert.ok(
    developerCheck.includes("Expected 20 developer"),
    "developer inventory",
  );
});

check("contract:lead result panels exist", () => {
  const src = read(ROUTES.leadResult);
  assert.ok(src.includes("LeadSuccessPanel"), "LeadSuccessPanel");
  assert.ok(src.includes("LeadErrorPanel"), "LeadErrorPanel");
});

check("contract:localized loading/error route boundaries", () => {
  const loading = read(ROUTES.localeLoading);
  const error = read(ROUTES.localeError);
  const copy = read(ROUTES.routeStateCopy);
  const states = read(ROUTES.uiStates);

  assert.ok(loading.includes('"use client"'), "loading can read route locale");
  assert.ok(loading.includes("LoadingState"), "shared loading state");
  assert.ok(error.includes('"use client"'), "error boundary is a Client Component");
  assert.ok(error.includes("unstable_retry()"), "documented retry recovery");
  assert.ok(error.includes("localePath(locale)"), "localized home recovery");
  assert.ok(error.includes("titleRef.current?.focus()"), "focus recovery");
  assert.ok(!error.includes("error.message"), "no internal error message rendered");
  assert.ok(!error.includes("error.digest"), "no error digest rendered");
  assert.ok(states.includes('role="status"'), "loading live status");
  assert.ok(states.includes('role="alert"'), "error live alert");
  assert.ok(states.includes("focusTitle ? -1 : undefined"), "focusable error title");

  for (const locale of locales) {
    assert.ok(
      copy.includes(`${locale}: {`),
      `route-state copy includes ${locale}`,
    );
  }
});

check("contract:html lang server-rendered per locale (no client patch)", () => {
  const layout = read(ROUTES.localeLayout);
  assert.ok(layout.includes("<html"), "owns html element");
  assert.ok(layout.includes("lang={htmlLang}"), "binds html lang");
  assert.ok(layout.includes("localeHtmlLang[lang]"), "uses BCP 47 map");
  assert.ok(
    !layout.includes("document.documentElement.lang"),
    "no client hydration lang patch",
  );
  assert.ok(
    !layout.includes("dangerouslySetInnerHTML"),
    "no inline documentElement script",
  );
  assert.equal(localeHtmlLang.en, "en");
  assert.equal(localeHtmlLang.zh, "zh-CN");
  assert.equal(localeHtmlLang.th, "th");
});

check("contract:locale switch preserves SEO metadata helper", () => {
  const src = read(ROUTES.metadata);
  assert.ok(src.includes("canonical: url"), "canonical");
  assert.ok(src.includes('"zh-CN": absoluteUrl("zh", path)'), "hreflang zh-CN");
  assert.ok(src.includes("th: absoluteUrl(\"th\", path)"), "hreflang th");
  assert.ok(
    src.includes('"x-default": absoluteUrl("en", path)'),
    "hreflang x-default",
  );
  assert.ok(src.includes("localeOpenGraph[locale]"), "openGraph locale");
  for (const locale of locales) {
    assert.equal(
      absoluteUrl(locale, "/about"),
      `${siteConfig.url}/${locale}/about`,
    );
  }
});

if (process.exitCode) {
  console.log(JSON.stringify({ ok: false }));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true, locales: [...locales], site: siteConfig.url }));
