#!/usr/bin/env node
/**
 * Phase 11 — Google Readiness audit (live + static).
 * No UI / feature / deploy changes — validation + reports only.
 */
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const OUT_DIR = resolve(ROOT, "pipelines/factory/google-readiness");
const SITE = "https://www.gothailandhome.com";
const TODAY = new Date().toISOString().slice(0, 10);
const UA = "GoThailandHome-GoogleReadiness/1.0 (+phase11)";

mkdirSync(OUT_DIR, { recursive: true });

const CONCURRENCY = Number(process.env.GREADINESS_CONCURRENCY || 14);
const PROPERTY_LIMIT = Number(process.env.GREADINESS_PROPERTY_LIMIT || 250);
const FETCH_TIMEOUT_MS = Number(process.env.GREADINESS_TIMEOUT_MS || 45000);

function sha256(text) {
  return createHash("sha256").update(text).digest("hex");
}

async function fetchText(url, { method = "GET", maxBytes = 2_500_000 } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  const started = Date.now();
  try {
    const res = await fetch(url, {
      method,
      redirect: "follow",
      signal: ctrl.signal,
      headers: { "user-agent": UA, accept: "text/html,application/xml,*/*" },
    });
    const buf = method === "HEAD" ? null : Buffer.from(await res.arrayBuffer());
    if (buf && buf.length > maxBytes) {
      return {
        ok: res.ok,
        status: res.status,
        finalUrl: res.url,
        ms: Date.now() - started,
        text: buf.subarray(0, maxBytes).toString("utf8"),
        bytes: buf.length,
        truncated: true,
      };
    }
    return {
      ok: res.ok,
      status: res.status,
      finalUrl: res.url,
      ms: Date.now() - started,
      text: buf ? buf.toString("utf8") : "",
      bytes: buf ? buf.length : 0,
      truncated: false,
    };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      finalUrl: url,
      ms: Date.now() - started,
      text: "",
      bytes: 0,
      error: String(err?.message || err),
    };
  } finally {
    clearTimeout(timer);
  }
}

async function mapPool(items, limit, fn) {
  const out = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => worker()),
  );
  return out;
}

function parseSitemap(xml) {
  const urls = [...xml.matchAll(/<url>\s*([\s\S]*?)\s*<\/url>/g)].map((m) => {
    const block = m[1];
    const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1]?.trim();
    const lastmod = block.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1]?.trim();
    const changefreq = block.match(
      /<changefreq>([^<]+)<\/changefreq>/,
    )?.[1]?.trim();
    const priority = block.match(/<priority>([^<]+)<\/priority>/)?.[1]?.trim();
    return { loc, lastmod, changefreq, priority };
  });
  return urls.filter((u) => u.loc);
}

function classifyUrl(loc) {
  try {
    const u = new URL(loc);
    const parts = u.pathname.replace(/\/$/, "").split("/").filter(Boolean);
    const locale = parts[0] || null;
    const kind = parts[1] || "home";
    const slug = parts[2] || null;
    return { locale, kind, slug, path: u.pathname };
  } catch {
    return { locale: null, kind: "invalid", slug: null, path: loc };
  }
}

function attr(tag, name) {
  const re = new RegExp(
    `${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`,
    "i",
  );
  const m = tag.match(re);
  return m ? m[1] || m[2] || "" : "";
}

function parseHtmlSeo(html, pageUrl) {
  const title = html.match(/<title>([^<]*)<\/title>/i)?.[1]?.trim() || null;
  const metaTags = [...html.matchAll(/<meta\b[^>]*>/gi)].map((m) => m[0]);
  let description = null;
  let robots = null;
  let ogImage = null;
  let ogTitle = null;
  let ogDescription = null;
  for (const tag of metaTags) {
    const name = (attr(tag, "name") || attr(tag, "property") || "").toLowerCase();
    const content = attr(tag, "content");
    if (name === "description") description = content;
    if (name === "robots") robots = content;
    if (name === "og:image") ogImage = content;
    if (name === "og:title") ogTitle = content;
    if (name === "og:description") ogDescription = content;
  }

  const links = [...html.matchAll(/<link\b[^>]*>/gi)].map((m) => m[0]);
  let canonical = null;
  const hreflang = [];
  for (const tag of links) {
    const rel = attr(tag, "rel").toLowerCase();
    if (rel === "canonical") canonical = attr(tag, "href");
    if (rel.split(/\s+/).includes("alternate") && attr(tag, "hreflang")) {
      hreflang.push({
        lang: attr(tag, "hreflang"),
        href: attr(tag, "href"),
      });
    }
  }

  const jsonLdBlocks = [];
  const jsonLdErrors = [];
  for (const m of html.matchAll(
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  )) {
    const raw = m[1].trim();
    try {
      jsonLdBlocks.push(JSON.parse(raw));
    } catch (e) {
      jsonLdErrors.push(String(e.message || e));
    }
  }

  const imgTags = [...html.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
  const images = imgTags.map((tag) => ({
    src: attr(tag, "src"),
    alt: attr(tag, "alt"),
    hasAlt: /\balt\s*=/i.test(tag),
  }));

  const anchors = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi)].map(
    (m) => m[1],
  );
  const internal = [];
  for (const href of anchors) {
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
      continue;
    }
    try {
      const abs = new URL(href, pageUrl);
      if (abs.hostname === "www.gothailandhome.com" || abs.hostname === "gothailandhome.com") {
        abs.hash = "";
        internal.push(abs.toString().replace(/\/$/, "") || abs.origin);
      }
    } catch {
      /* ignore */
    }
  }

  return {
    title,
    description,
    robots,
    canonical,
    hreflang,
    ogImage,
    ogTitle,
    ogDescription,
    jsonLdBlocks,
    jsonLdErrors,
    images,
    internalLinks: [...new Set(internal)],
  };
}

function flattenJsonLd(blocks) {
  const nodes = [];
  const walk = (node) => {
    if (!node) return;
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (typeof node !== "object") return;
    nodes.push(node);
    if (node["@graph"]) walk(node["@graph"]);
  };
  walk(blocks);
  return nodes;
}

function typeList(node) {
  const t = node?.["@type"];
  if (!t) return [];
  return Array.isArray(t) ? t : [t];
}

function validateJsonLdNodes(nodes, pageKind) {
  const issues = [];
  const types = new Set();
  for (const node of nodes) {
    for (const t of typeList(node)) types.add(t);
    if (!node["@context"] && !node["@type"]) {
      issues.push("node_missing_type");
    }
    for (const t of typeList(node)) {
      if (
        t === "Organization" ||
        t === "WebSite" ||
        t === "CollectionPage" ||
        t === "ApartmentComplex" ||
        t === "AdministrativeArea"
      ) {
        if (!node.name) issues.push(`${t}_missing_name`);
        if (!node.url) issues.push(`${t}_missing_url`);
      }
      if (t === "BreadcrumbList") {
        const items = node.itemListElement;
        if (!Array.isArray(items) || items.length < 2) {
          issues.push("BreadcrumbList_too_short");
        }
      }
      if (
        t === "RealEstateListing" ||
        t === "Apartment" ||
        t === "House" ||
        t === "LandPlot" ||
        t === "Accommodation"
      ) {
        if (!node.name) issues.push("listing_missing_name");
        if (!node.offers) issues.push("listing_missing_offers");
        else if (node.offers && !node.offers.priceCurrency) {
          issues.push("listing_offer_missing_currency");
        }
      }
      if (t === "WebSite" && node.potentialAction) {
        const pa = node.potentialAction;
        if (pa["@type"] !== "SearchAction") issues.push("WebSite_SearchAction_type");
        if (!pa.target) issues.push("WebSite_SearchAction_missing_target");
      }
      if (t === "FAQPage") {
        const ents = node.mainEntity;
        if (!Array.isArray(ents) || !ents.length) issues.push("FAQPage_empty");
        for (const ent of ents || []) {
          if (!ent?.name) issues.push("FAQPage_question_missing_name");
          if (!ent?.acceptedAnswer?.text) issues.push("FAQPage_answer_missing_text");
        }
      }
    }
  }

  const expected = {
    home: ["Organization", "WebSite"],
    properties: ["CollectionPage"],
    projects: ["ApartmentComplex", "BreadcrumbList"],
    developers: ["Organization", "BreadcrumbList"],
    districts: ["AdministrativeArea", "BreadcrumbList"],
    properties_detail: ["RealEstateListing", "BreadcrumbList"],
  };
  const need = expected[pageKind];
  const missingExpected = [];
  if (need) {
    for (const t of need) {
      if (t === "RealEstateListing") {
        const hasListing = [...types].some((x) =>
          ["RealEstateListing", "Apartment", "House", "LandPlot", "Accommodation"].includes(x),
        );
        if (!hasListing) missingExpected.push(t);
      } else if (!types.has(t)) {
        missingExpected.push(t);
      }
    }
  }
  return { types: [...types], issues: [...new Set(issues)], missingExpected };
}

function richResultsForPage(seo, pageKind) {
  const nodes = flattenJsonLd(seo.jsonLdBlocks);
  const { types, issues, missingExpected } = validateJsonLdNodes(nodes, pageKind);
  const eligible = [];
  const warnings = [];

  if (types.includes("Organization")) eligible.push("Organization");
  if (types.includes("WebSite")) eligible.push("WebSite / Sitelinks search box (SearchAction)");
  if (types.includes("BreadcrumbList")) eligible.push("Breadcrumbs");
  if (types.includes("FAQPage")) eligible.push("FAQ");
  if (types.includes("CollectionPage")) eligible.push("CollectionPage (informational)");
  if (types.includes("ApartmentComplex")) eligible.push("ApartmentComplex (informational)");
  if (
    types.some((t) =>
      ["RealEstateListing", "Apartment", "House", "LandPlot", "Accommodation"].includes(t),
    )
  ) {
    eligible.push("RealEstateListing / lodging-style listing");
  }

  if (!seo.canonical) warnings.push("missing_canonical");
  if (!seo.title) warnings.push("missing_title");
  if (!seo.description) warnings.push("missing_description");
  if (!seo.ogImage) warnings.push("missing_og_image");
  if (seo.ogImage?.endsWith(".svg")) {
    warnings.push("og_image_svg_may_be_ignored_by_some_networks");
  }
  if (missingExpected.length) {
    warnings.push(`missing_expected_types:${missingExpected.join(",")}`);
  }
  for (const issue of issues) warnings.push(`jsonld:${issue}`);

  return {
    eligible,
    warnings,
    types,
    parseErrors: seo.jsonLdErrors,
    nodeCount: nodes.length,
  };
}

function validateHreflang(seo, pageUrl) {
  const issues = [];
  const langs = new Map(seo.hreflang.map((h) => [h.lang, h.href]));
  for (const required of ["en", "zh-CN", "th", "x-default"]) {
    if (!langs.has(required)) issues.push(`missing_${required}`);
  }
  const path = new URL(pageUrl).pathname.replace(/^\/(en|zh|th)/, "");
  for (const [lang, href] of langs) {
    try {
      const u = new URL(href);
      if (!u.hostname.includes("gothailandhome.com")) {
        issues.push(`offsite_${lang}`);
      }
      if (lang === "en" && !u.pathname.startsWith("/en")) issues.push("en_path_mismatch");
      if (lang === "zh-CN" && !u.pathname.startsWith("/zh")) issues.push("zh_path_mismatch");
      if (lang === "th" && !u.pathname.startsWith("/th")) issues.push("th_path_mismatch");
      if (lang === "x-default" && !u.pathname.startsWith("/en")) {
        issues.push("x-default_not_en");
      }
      const altPath = u.pathname.replace(/^\/(en|zh|th)/, "");
      if (altPath !== path && lang !== "x-default") {
        // allow exact match only for same entity path
        if (altPath !== path) issues.push(`path_drift_${lang}`);
      }
    } catch {
      issues.push(`invalid_href_${lang}`);
    }
  }
  return [...new Set(issues)];
}

function validateCanonical(seo, pageUrl) {
  const issues = [];
  if (!seo.canonical) return ["missing"];
  try {
    const page = new URL(pageUrl);
    const canon = new URL(seo.canonical);
    if (canon.origin !== SITE) issues.push("canonical_host_mismatch");
    // strip trailing slash for compare
    const a = page.pathname.replace(/\/$/, "") || "/";
    const b = canon.pathname.replace(/\/$/, "") || "/";
    if (a !== b) issues.push("canonical_path_mismatch");
    if (canon.search) issues.push("canonical_has_query");
  } catch {
    issues.push("canonical_invalid");
  }
  return issues;
}

function pageKindFromClass(cls) {
  if (cls.kind === "home") return "home";
  if (cls.kind === "properties" && cls.slug) return "properties_detail";
  if (cls.kind === "properties") return "properties";
  if (cls.kind === "projects" && cls.slug) return "projects";
  if (cls.kind === "projects") return "projects_index";
  if (cls.kind === "developers" && cls.slug) return "developers";
  if (cls.kind === "developers") return "developers_index";
  if (cls.kind === "districts" && cls.slug) return "districts";
  if (cls.kind === "cities" && cls.slug) return "cities";
  if (cls.kind === "cities") return "cities_index";
  return cls.kind;
}

function staticCodeChecks() {
  const checks = [];
  const files = {
    schema: "src/lib/seo/schema.ts",
    jsonLd: "src/components/seo/json-ld.tsx",
    metadata: "src/lib/i18n/metadata.ts",
    robots: "src/app/robots.ts",
    sitemap: "src/app/sitemap.ts",
    admin: "src/app/admin/layout.tsx",
  };
  for (const [key, rel] of Object.entries(files)) {
    const ok = existsSync(resolve(ROOT, rel));
    checks.push({ id: `file_${key}`, pass: ok, detail: rel });
  }
  const schema = readFileSync(resolve(ROOT, files.schema), "utf8");
  for (const name of [
    "organizationSchema",
    "websiteSchema",
    "listingSchema",
    "projectSchema",
    "developerSchema",
    "districtSchema",
    "breadcrumbListSchema",
    "collectionPageSchema",
    "projectFaqSchema",
  ]) {
    checks.push({
      id: `export_${name}`,
      pass: schema.includes(`export function ${name}`),
      detail: name,
    });
  }
  const meta = readFileSync(resolve(ROOT, files.metadata), "utf8");
  checks.push({
    id: "hreflang_languages_map",
    pass:
      meta.includes('"zh-CN"') &&
      meta.includes('"x-default"') &&
      meta.includes("canonical: url"),
    detail: "buildPageMetadata alternates",
  });
  const robots = readFileSync(resolve(ROOT, files.robots), "utf8");
  checks.push({
    id: "robots_disallow_admin",
    pass: robots.includes("/admin"),
    detail: "src/app/robots.ts",
  });
  const admin = readFileSync(resolve(ROOT, files.admin), "utf8");
  checks.push({
    id: "admin_noindex",
    pass: admin.includes("index: false"),
    detail: "admin layout metadata",
  });
  const sitemap = readFileSync(resolve(ROOT, files.sitemap), "utf8");
  for (const path of [
    "/find-my-home",
    "/list-your-property",
    "/partners/developers",
    "/partners/agencies",
    "/marketplace",
    "/buy",
    "/rent",
    "/knowledge",
  ]) {
    checks.push({
      id: `sitemap_static_${path}`,
      pass: sitemap.includes(`"${path}"`),
      detail: path,
    });
  }
  return checks;
}

function selectCrawlTargets(sitemapUrls) {
  const byLocale = { en: [], zh: [], th: [] };
  for (const u of sitemapUrls) {
    const cls = classifyUrl(u.loc);
    if (byLocale[cls.locale]) byLocale[cls.locale].push({ ...u, ...cls });
  }

  const pick = (list, pred, limit = Infinity) =>
    list.filter(pred).slice(0, limit);

  const targets = [];
  const seen = new Set();
  const add = (items) => {
    for (const item of items) {
      if (seen.has(item.loc)) continue;
      seen.add(item.loc);
      targets.push(item);
    }
  };

  // All non-property EN pages
  add(pick(byLocale.en, (x) => x.kind !== "properties" || !x.slug));
  add(
    pick(
      byLocale.en,
      (x) => x.kind === "properties" && x.slug,
      PROPERTY_LIMIT,
    ),
  );

  // Locale parity: all static-like + capped entities for zh/th
  for (const loc of ["zh", "th"]) {
    add(pick(byLocale[loc], (x) => !x.slug)); // indexes + static
    add(pick(byLocale[loc], (x) => x.kind === "projects" && x.slug, 25));
    add(pick(byLocale[loc], (x) => x.kind === "developers" && x.slug, 15));
    add(pick(byLocale[loc], (x) => x.kind === "districts" && x.slug, 20));
    add(pick(byLocale[loc], (x) => x.kind === "cities" && x.slug, 7));
    add(pick(byLocale[loc], (x) => x.kind === "properties" && x.slug, 40));
  }

  return targets;
}

function mdEscape(s) {
  return String(s ?? "").replace(/\|/g, "\\|");
}

function writeReports(snapshot) {
  const {
    robots,
    sitemapStats,
    crawl,
    duplicates,
    orphans,
    missingImages,
    brokenLinks,
    jsonLdSummary,
    richResults,
    staticChecks,
    coverage,
  } = snapshot;

  const passFail = (ok) => (ok ? "PASS" : "FAIL");

  const googleIndex = `# GOOGLE_INDEX_READINESS

**Milestone:** Phase 11 — Google Readiness  
**Date:** ${TODAY}  
**Host:** ${SITE}  
**Method:** Live crawl + static code validation (\`scripts/phase11-google-readiness.mjs\`)  
**Snapshot:** \`pipelines/factory/google-readiness/wave1_google_readiness_snapshot.json\`

## Verdict: **${snapshot.verdict}**

Prepared for indexing validation. Operator Search Console verification/submit remains outside this repo audit.

## Task checklist

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Validate all JSON-LD | ${passFail(jsonLdSummary.fail === 0)} | ${jsonLdSummary.ok}/${jsonLdSummary.checked} pages parse OK; ${jsonLdSummary.fail} parse/structural fails |
| 2 | Validate Rich Results | ${passFail(richResults.blocking === 0)} | Structural eligibility; ${richResults.blocking} blocking issues |
| 3 | Validate sitemap | ${passFail(sitemapStats.valid)} | ${sitemapStats.urlCount} URLs · ${sitemapStats.bytes} bytes |
| 4 | Validate robots | ${passFail(robots.valid)} | Allow=/ · Disallow=/admin · Sitemap pointer |
| 5 | Check canonical | ${passFail(crawl.canonicalFail === 0)} | ${crawl.canonicalOk}/${crawl.pages} OK |
| 6 | Check hreflang | ${passFail(crawl.hreflangFail === 0)} | ${crawl.hreflangOk}/${crawl.pages} OK |
| 7 | Generate XML statistics | PASS | See SITE_AUDIT_REPORT |
| 8 | Generate crawl report | PASS | ${crawl.pages} pages fetched |
| 9 | Find orphan pages | PASS | ${orphans.linkedNotInSitemap.length} linked∉sitemap · ${orphans.inSitemapNotLinkedSample.length} sitemap∉hub-links (sample) |
| 10 | Find duplicate titles | PASS | ${duplicates.titles.length} duplicate title groups (crawled set) |
| 11 | Find duplicate descriptions | PASS | ${duplicates.descriptions.length} duplicate description groups |
| 12 | Find missing images | PASS | ${missingImages.length} pages with no img + placeholder/default OG only flags |
| 13 | Find broken internal links | ${passFail(brokenLinks.length === 0)} | ${brokenLinks.length} broken (from crawled hubs) |
| 14 | Generate reports | PASS | Four report files |

## Indexing blockers / actions

${snapshot.actions.map((a) => `- ${a}`).join("\n") || "- None identified beyond operator GSC submit."}

## Coverage

- Sitemap URLs: **${sitemapStats.urlCount}** (en/zh/th = ${sitemapStats.byLocale.en}/${sitemapStats.byLocale.zh}/${sitemapStats.byLocale.th})
- Crawled: **${crawl.pages}** (property detail cap EN=${PROPERTY_LIMIT})
- HTTP non-200 among crawled: **${crawl.httpFail}**
`;

  const searchConsole = `# SEARCH_CONSOLE_READY

**Milestone:** Phase 11 — Google Readiness  
**Date:** ${TODAY}  
**Property:** ${SITE}

## Repo readiness vs operator readiness

| Item | Repo status | Operator action |
|------|-------------|-----------------|
| Production host reachable | ${passFail(true)} | — |
| \`robots.txt\` allows public crawl | ${passFail(robots.valid)} | Confirm in GSC robots tester |
| \`sitemap.xml\` returns 200 + URL set | ${passFail(sitemapStats.valid)} | **Submit** ${SITE}/sitemap.xml |
| Canonical absolute www URLs | ${passFail(crawl.canonicalFail === 0)} | URL Inspection spot-check |
| hreflang en / zh-CN / th / x-default | ${passFail(crawl.hreflangFail === 0)} | International targeting review |
| JSON-LD present on core templates | ${passFail(jsonLdSummary.fail === 0)} | Rich Results / URL Inspection |
| Admin disallowed | ${passFail(robots.disallowAdmin)} | — |
| GSC property verified | **NOT EVIDENCED IN REPO** | Verify DNS/HTML/tag ownership |
| Sitemap coverage green | **NOT EVIDENCED** | Monitor 7–14 days post-submit |
| GA4 / Search Console linking | **NOT EVIDENCED** | Optional measurement |

## Submit package

1. Verify property: \`https://www.gothailandhome.com\` (include www).  
2. Submit sitemap: \`https://www.gothailandhome.com/sitemap.xml\`.  
3. Request indexing for homepage + 3–5 representative templates (project, developer, district, listing, properties index).  
4. Watch Coverage / Page indexing for soft-404 and excluded-by-robots.  
5. After Media Factory binaries deploy, re-check OG/hero images (SVG default OG may underperform in some previews).

## Sitemap snapshot (live)

- URLs: **${sitemapStats.urlCount}**
- Bytes: **${sitemapStats.bytes}**
- Properties/locale: **${sitemapStats.byKind.properties || 0}** (includes index; detail ≈ ${(sitemapStats.byKind.properties || 0) - 3} across 3 locales → ~${Math.round(((sitemapStats.byKind.properties || 0) - 3) / 3)} per locale)
- Projects/locale detail: ~${Math.round(((sitemapStats.byKind.projects || 0) - 3) / 3)}
- Known cap risk: listing generation historically PostgREST-capped (~1000/locale) — live count en properties paths = **${sitemapStats.enPropertyPaths}**

## Gate

**SEARCH_CONSOLE_READY (code/crawl): ${snapshot.consoleReady}**  
**SEARCH_CONSOLE_LIVE (ops): ACTION REQUIRED** — verification + sitemap submit not evidenced in repository.
`;

  const rich = `# RICH_RESULTS_REPORT

**Milestone:** Phase 11 — Google Readiness  
**Date:** ${TODAY}  
**Scope:** Structural JSON-LD validation on crawled pages (not Google Rich Results Test API bulk)

## Summary

| Metric | Value |
|--------|------:|
| Pages with JSON-LD checked | ${jsonLdSummary.checked} |
| Parse failures | ${jsonLdSummary.parseFail} |
| Structural issue pages | ${jsonLdSummary.fail} |
| Blocking rich-result issues | ${richResults.blocking} |
| Warning flags | ${richResults.warningCount} |

## Eligible types observed

${richResults.typeHistogram
  .map(([t, n]) => `- **${t}**: ${n} pages`)
  .join("\n") || "- None"}

## Template expectations

| Page kind | Expected types | Live result |
|-----------|----------------|-------------|
| Home | Organization, WebSite (+ SearchAction) | ${richResults.byKind.home || "n/a"} |
| Properties index | CollectionPage | ${richResults.byKind.properties || "n/a"} |
| Listing detail | RealEstateListing (+ subtype), BreadcrumbList | ${richResults.byKind.properties_detail || "n/a"} |
| Project detail | ApartmentComplex, BreadcrumbList (+ optional FAQPage) | ${richResults.byKind.projects || "n/a"} |
| Developer detail | Organization, BreadcrumbList | ${richResults.byKind.developers || "n/a"} |
| District detail | AdministrativeArea, BreadcrumbList | ${richResults.byKind.districts || "n/a"} |

## Notable warnings

${richResults.topWarnings.map((w) => `- \`${w.key}\` × ${w.count}`).join("\n") || "- None"}

## Sample failures

${richResults.samples
  .map((s) => `- ${s.url}: ${s.warnings.slice(0, 4).join("; ")}`)
  .join("\n") || "- None"}

## Notes

- Google does not guarantee rich appearance for RealEstateListing / ApartmentComplex; treat as structured-data completeness, not SERP enhancement commitment.
- Default OG image is SVG (\`/og/default.svg\`) — fine for site branding, weak for some social crawlers; not a JSON-LD blocker.
- FAQPage emitted only when project FAQ content exists.
`;

  const audit = `# SITE_AUDIT_REPORT

**Milestone:** Phase 11 — Google Readiness  
**Date:** ${TODAY}  
**Crawl set:** ${crawl.pages} URLs · concurrency ${CONCURRENCY} · property detail cap ${PROPERTY_LIMIT} (EN)

## 1. Robots

\`\`\`
${robots.body.trim()}
\`\`\`

| Check | Result |
|-------|--------|
| HTTP 200 | ${passFail(robots.status === 200)} |
| Allow / | ${passFail(robots.allowRoot)} |
| Disallow /admin | ${passFail(robots.disallowAdmin)} |
| Sitemap pointer | ${passFail(robots.hasSitemap)} |
| Host | ${passFail(robots.hasHost)} |

## 2. Sitemap XML statistics

| Metric | Value |
|--------|------:|
| HTTP status | ${sitemapStats.status} |
| Bytes | ${sitemapStats.bytes} |
| \`<url>\` count | ${sitemapStats.urlCount} |
| Unique locs | ${sitemapStats.unique} |
| Duplicate locs | ${sitemapStats.duplicateLocs} |
| Invalid locs | ${sitemapStats.invalidLocs} |
| en / zh / th | ${sitemapStats.byLocale.en} / ${sitemapStats.byLocale.zh} / ${sitemapStats.byLocale.th} |

### By path kind (all locales)

| Kind | Count |
|------|------:|
${Object.entries(sitemapStats.byKind)
  .sort((a, b) => b[1] - a[1])
  .map(([k, v]) => `| ${k} | ${v} |`)
  .join("\n")}

## 3. Crawl report

| Metric | Value |
|--------|------:|
| Fetched | ${crawl.pages} |
| HTTP 200 | ${crawl.httpOk} |
| HTTP non-200 / error | ${crawl.httpFail} |
| Mean TTFB-ish (ms) | ${crawl.meanMs} |
| Canonical OK | ${crawl.canonicalOk} |
| Hreflang OK | ${crawl.hreflangOk} |
| JSON-LD present | ${crawl.jsonLdPresent} |
| Missing meta description | ${crawl.missingDescription} |

### Non-200 / fetch errors (sample)

${crawl.failures
  .slice(0, 25)
  .map((f) => `- ${f.status || "ERR"} ${f.url}${f.error ? ` — ${f.error}` : ""}`)
  .join("\n") || "- None"}

## 4. Canonical

- Failures: **${crawl.canonicalFail}**
${crawl.canonicalIssues
  .slice(0, 20)
  .map((x) => `- ${x.url}: ${x.issues.join(", ")}`)
  .join("\n") || "- None in crawl set"}

## 5. Hreflang

- Failures: **${crawl.hreflangFail}**
${crawl.hreflangIssues
  .slice(0, 20)
  .map((x) => `- ${x.url}: ${x.issues.join(", ")}`)
  .join("\n") || "- None in crawl set"}

## 6. Orphan pages

### Linked from crawled pages but not in sitemap

${orphans.linkedNotInSitemap
  .slice(0, 40)
  .map((u) => `- ${u}`)
  .join("\n") || "- None"}

### In sitemap but not discovered via hub internal links (informational; not proof of orphan)

Count sample: **${orphans.inSitemapNotLinkedSample.length}** (of ${orphans.inSitemapNotLinkedTotal} candidates among EN non-property URLs)

${orphans.inSitemapNotLinkedSample
  .slice(0, 30)
  .map((u) => `- ${u}`)
  .join("\n") || "- None"}

## 7. Duplicate titles (crawled set)

Groups: **${duplicates.titles.length}**

${duplicates.titles
  .slice(0, 30)
  .map(
    (g) =>
      `- **${mdEscape(g.value)}** × ${g.urls.length}\n${g.urls
        .slice(0, 5)
        .map((u) => `  - ${u}`)
        .join("\n")}`,
  )
  .join("\n") || "- None"}

## 8. Duplicate descriptions (crawled set)

Groups: **${duplicates.descriptions.length}**

${duplicates.descriptions
  .slice(0, 30)
  .map(
    (g) =>
      `- **${mdEscape(g.value).slice(0, 120)}** × ${g.urls.length}\n${g.urls
        .slice(0, 5)
        .map((u) => `  - ${u}`)
        .join("\n")}`,
  )
  .join("\n") || "- None"}

## 9. Missing images

Pages with **zero \`<img>\`** and OG default/placeholder only: **${missingImages.length}**

${missingImages
  .slice(0, 40)
  .map((x) => `- ${x.url} (og=${x.ogImage || "none"})`)
  .join("\n") || "- None"}

## 10. Broken internal links

Checked unique internal targets from crawl: **${coverage.internalLinkTargetsChecked}**  
Broken: **${brokenLinks.length}**

${brokenLinks
  .slice(0, 40)
  .map((b) => `- ${b.status || "ERR"} ${b.url}${b.error ? ` — ${b.error}` : ""}`)
  .join("\n") || "- None"}

## 11. Static code checks

${staticChecks.map((c) => `- ${c.pass ? "PASS" : "FAIL"} \`${c.id}\` — ${c.detail}`).join("\n")}

## Limits

- Property detail crawl capped at **${PROPERTY_LIMIT}** EN URLs (+ smaller zh/th samples); duplicate title/description findings for listings are therefore **partial**.
- Rich Results validated structurally, not via Google’s live testing API.
- Orphan “not linked from hubs” is approximate (hub-link discovery only).
`;

  writeFileSync(resolve(ROOT, "GOOGLE_INDEX_READINESS.md"), googleIndex);
  writeFileSync(resolve(ROOT, "SEARCH_CONSOLE_READY.md"), searchConsole);
  writeFileSync(resolve(ROOT, "RICH_RESULTS_REPORT.md"), rich);
  writeFileSync(resolve(ROOT, "SITE_AUDIT_REPORT.md"), audit);
}

async function main() {
  console.log("Phase 11 Google Readiness — starting");
  const staticChecks = staticCodeChecks();

  const robotsRes = await fetchText(`${SITE}/robots.txt`);
  writeFileSync(resolve(OUT_DIR, "robots.live.txt"), robotsRes.text || "");
  const robotsBody = robotsRes.text || "";
  const robots = {
    status: robotsRes.status,
    body: robotsBody,
    allowRoot: /Allow:\s*\/\s*$/m.test(robotsBody) || /Allow:\s*\//.test(robotsBody),
    disallowAdmin:
      /Disallow:\s*\/admin\/?/i.test(robotsBody),
    hasSitemap: /Sitemap:\s*https:\/\/www\.gothailandhome\.com\/sitemap\.xml/i.test(
      robotsBody,
    ),
    hasHost: /Host:\s*www\.gothailandhome\.com/i.test(robotsBody),
    valid: false,
  };
  robots.valid =
    robots.status === 200 &&
    robots.allowRoot &&
    robots.disallowAdmin &&
    robots.hasSitemap;

  const smRes = await fetchText(`${SITE}/sitemap.xml`, { maxBytes: 5_000_000 });
  writeFileSync(resolve(OUT_DIR, "sitemap.live.xml"), smRes.text || "");
  const entries = parseSitemap(smRes.text || "");
  const locs = entries.map((e) => e.loc);
  const unique = new Set(locs);
  const byLocale = { en: 0, zh: 0, th: 0 };
  const byKind = {};
  let invalidLocs = 0;
  let enPropertyPaths = 0;
  for (const loc of locs) {
    const cls = classifyUrl(loc);
    if (!cls.locale || !["en", "zh", "th"].includes(cls.locale)) invalidLocs++;
    if (byLocale[cls.locale] != null) byLocale[cls.locale]++;
    byKind[cls.kind] = (byKind[cls.kind] || 0) + 1;
    if (cls.locale === "en" && cls.kind === "properties") enPropertyPaths++;
  }
  const sitemapStats = {
    status: smRes.status,
    bytes: smRes.bytes,
    urlCount: entries.length,
    unique: unique.size,
    duplicateLocs: entries.length - unique.size,
    invalidLocs,
    byLocale,
    byKind,
    enPropertyPaths,
    valid:
      smRes.status === 200 &&
      entries.length > 0 &&
      byLocale.en === byLocale.zh &&
      byLocale.zh === byLocale.th,
  };

  const targets = selectCrawlTargets(entries);
  console.log(`Crawl targets: ${targets.length}`);

  const pages = await mapPool(targets, CONCURRENCY, async (t, idx) => {
    if (idx % 50 === 0) console.log(`  fetch ${idx}/${targets.length}`);
    const res = await fetchText(t.loc);
    const cls = classifyUrl(t.loc);
    const kind = pageKindFromClass(cls);
    if (!res.ok || res.status !== 200) {
      return {
        url: t.loc,
        status: res.status,
        error: res.error,
        ms: res.ms,
        kind,
        locale: cls.locale,
        ok: false,
      };
    }
    const seo = parseHtmlSeo(res.text, t.loc);
    const canonicalIssues = validateCanonical(seo, t.loc);
    const hreflangIssues = validateHreflang(seo, t.loc);
    const rich = richResultsForPage(seo, kind);
    return {
      url: t.loc,
      status: res.status,
      ms: res.ms,
      bytes: res.bytes,
      kind,
      locale: cls.locale,
      ok: true,
      title: seo.title,
      description: seo.description,
      canonical: seo.canonical,
      hreflangCount: seo.hreflang.length,
      canonicalIssues,
      hreflangIssues,
      jsonLdPresent: seo.jsonLdBlocks.length > 0,
      jsonLdErrors: seo.jsonLdErrors,
      rich,
      imageCount: seo.images.length,
      ogImage: seo.ogImage,
      internalLinks: seo.internalLinks,
    };
  });

  const okPages = pages.filter((p) => p.ok);
  const failures = pages
    .filter((p) => !p.ok)
    .map((p) => ({ url: p.url, status: p.status, error: p.error }));

  const titleMap = new Map();
  const descMap = new Map();
  for (const p of okPages) {
    if (p.title) {
      if (!titleMap.has(p.title)) titleMap.set(p.title, []);
      titleMap.get(p.title).push(p.url);
    }
    if (p.description) {
      if (!descMap.has(p.description)) descMap.set(p.description, []);
      descMap.get(p.description).push(p.url);
    }
  }
  const duplicates = {
    titles: [...titleMap.entries()]
      .filter(([, urls]) => urls.length > 1)
      .map(([value, urls]) => ({ value, urls }))
      .sort((a, b) => b.urls.length - a.urls.length),
    descriptions: [...descMap.entries()]
      .filter(([, urls]) => urls.length > 1)
      .map(([value, urls]) => ({ value, urls }))
      .sort((a, b) => b.urls.length - a.urls.length),
  };

  // Locale variants of same entity sharing the same EN title template across locales
  // is expected for zh/th if titles are localized — duplicates across locales with
  // identical strings are still reported (real issue if zh page has English title).

  const sitemapSet = new Set(
    [...unique].map((u) => u.replace(/\/$/, "")),
  );
  const linked = new Set();
  for (const p of okPages) {
    for (const href of p.internalLinks || []) {
      linked.add(href.replace(/\/$/, ""));
    }
  }
  const linkedNotInSitemap = [...linked]
    .map((u) => u.replaceAll("&amp;", "&"))
    .filter((u) => {
      if (!u.startsWith(SITE)) return false;
      let parsed;
      try {
        parsed = new URL(u);
      } catch {
        return false;
      }
      const path = parsed.pathname;
      if (parsed.search) return false; // filter/facet URLs intentionally off sitemap
      if (path.startsWith("/admin")) return false;
      if (path.includes("/search")) return false;
      if (path.includes("/leads/")) return false;
      const clean = `${parsed.origin}${path}`.replace(/\/$/, "");
      if (path.match(/\/(en|zh|th)\/properties\/.+/) && !sitemapSet.has(clean)) {
        // listing may be beyond sitemap cap / unpublished in sitemap window
        return true;
      }
      return !sitemapSet.has(clean) && !sitemapSet.has(`${clean}/`);
    })
    .sort();

  const enNonPropertySitemap = [...unique].filter((u) => {
    const c = classifyUrl(u);
    return c.locale === "en" && !(c.kind === "properties" && c.slug);
  });
  const inSitemapNotLinked = enNonPropertySitemap
    .map((u) => u.replace(/\/$/, ""))
    .filter((u) => !linked.has(u));

  const missingImages = okPages
    .filter((p) => {
      const placeholder =
        !p.ogImage ||
        p.ogImage.includes("/og/default") ||
        p.ogImage.includes("placeholder");
      return p.imageCount === 0 && placeholder;
    })
    .map((p) => ({ url: p.url, ogImage: p.ogImage, kind: p.kind }));

  // Broken internal links — check unique targets (cap)
  const linkTargets = [...linked].filter((u) => u.startsWith(SITE)).slice(0, 400);
  console.log(`HEAD-check internal links: ${linkTargets.length}`);
  const linkResults = await mapPool(linkTargets, CONCURRENCY, async (url) => {
    const res = await fetchText(url, { method: "HEAD" });
    // some hosts dislike HEAD — fallback GET if 405/403/0
    if (res.status === 405 || res.status === 403 || res.status === 0) {
      const get = await fetchText(url);
      return { url, status: get.status, error: get.error, ok: get.status >= 200 && get.status < 400 };
    }
    return {
      url,
      status: res.status,
      error: res.error,
      ok: res.status >= 200 && res.status < 400,
    };
  });
  const brokenLinks = linkResults.filter((r) => !r.ok);

  const jsonLdSummary = {
    checked: okPages.length,
    ok: okPages.filter(
      (p) =>
        p.jsonLdPresent &&
        (!p.jsonLdErrors || p.jsonLdErrors.length === 0) &&
        (p.rich?.warnings || []).every(
          (w) => !w.startsWith("jsonld:") && !w.startsWith("missing_expected"),
        ),
    ).length,
    fail: okPages.filter(
      (p) =>
        (p.jsonLdErrors && p.jsonLdErrors.length) ||
        (p.rich?.warnings || []).some(
          (w) => w.startsWith("jsonld:") || w.startsWith("missing_expected"),
        ) ||
        (!p.jsonLdPresent &&
          ["home", "properties", "properties_detail", "projects", "developers", "districts"].includes(
            p.kind,
          )),
    ).length,
    parseFail: okPages.filter((p) => p.jsonLdErrors?.length).length,
  };

  const warnCount = new Map();
  const typeCount = new Map();
  const richByKind = {};
  const samples = [];
  let blocking = 0;
  for (const p of okPages) {
    if (!p.rich) continue;
    for (const t of p.rich.types || []) {
      typeCount.set(t, (typeCount.get(t) || 0) + 1);
    }
    for (const w of p.rich.warnings || []) {
      warnCount.set(w, (warnCount.get(w) || 0) + 1);
    }
    const hard =
      (p.jsonLdErrors && p.jsonLdErrors.length > 0) ||
      (p.rich.warnings || []).some(
        (w) => w.startsWith("missing_expected") || w.startsWith("jsonld:"),
      );
    if (hard) {
      blocking++;
      if (samples.length < 20) {
        samples.push({ url: p.url, warnings: p.rich.warnings || [] });
      }
    }
    if (!richByKind[p.kind]) {
      richByKind[p.kind] = p.rich.types?.join(", ") || "(none)";
    }
  }

  const richResults = {
    blocking,
    warningCount: [...warnCount.values()].reduce((a, b) => a + b, 0),
    typeHistogram: [...typeCount.entries()].sort((a, b) => b[1] - a[1]),
    topWarnings: [...warnCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([key, count]) => ({ key, count })),
    byKind: richByKind,
    samples,
  };

  const crawl = {
    pages: pages.length,
    httpOk: okPages.length,
    httpFail: failures.length,
    meanMs: okPages.length
      ? Math.round(okPages.reduce((s, p) => s + (p.ms || 0), 0) / okPages.length)
      : 0,
    canonicalOk: okPages.filter((p) => (p.canonicalIssues || []).length === 0).length,
    canonicalFail: okPages.filter((p) => (p.canonicalIssues || []).length > 0).length,
    hreflangOk: okPages.filter((p) => (p.hreflangIssues || []).length === 0).length,
    hreflangFail: okPages.filter((p) => (p.hreflangIssues || []).length > 0).length,
    jsonLdPresent: okPages.filter((p) => p.jsonLdPresent).length,
    missingDescription: okPages.filter((p) => !p.description).length,
    failures,
    canonicalIssues: okPages
      .filter((p) => p.canonicalIssues?.length)
      .map((p) => ({ url: p.url, issues: p.canonicalIssues })),
    hreflangIssues: okPages
      .filter((p) => p.hreflangIssues?.length)
      .map((p) => ({ url: p.url, issues: p.hreflangIssues })),
  };

  const actions = [];
  if (!robots.valid) actions.push("Fix robots.txt before claiming crawl readiness.");
  if (!sitemapStats.valid) actions.push("Fix sitemap locale balance or availability.");
  if (crawl.httpFail > 0) {
    actions.push(
      `Investigate ${crawl.httpFail} non-200 crawl targets (soft-404/5xx burn crawl budget).`,
    );
  }
  if (crawl.missingDescription > 0) {
    actions.push(
      `Add meta descriptions on ${crawl.missingDescription} crawled pages missing description.`,
    );
  }
  if (jsonLdSummary.fail > 0) {
    actions.push(`Repair JSON-LD structural gaps on ${jsonLdSummary.fail} pages.`);
  }
  if (brokenLinks.length > 0) {
    actions.push(`Fix ${brokenLinks.length} broken internal links discovered from hubs.`);
  }
  if (duplicates.titles.some((g) => g.urls.length > 3)) {
    actions.push("Review high-frequency duplicate titles in crawled set.");
  }
  actions.push(
    "Operator: verify Google Search Console property and submit sitemap.xml (not evidenced in repo).",
  );
  if (sitemapStats.enPropertyPaths >= 1000) {
    actions.push(
      "Confirm listing sitemap pagination — live EN property paths ≈ cap territory (~1000 including index).",
    );
  }

  const staticFail = staticChecks.filter((c) => !c.pass).length;
  const verdict =
    robots.valid &&
    sitemapStats.valid &&
    crawl.httpFail === 0 &&
    crawl.canonicalFail === 0 &&
    crawl.hreflangFail === 0 &&
    jsonLdSummary.fail === 0 &&
    brokenLinks.length === 0 &&
    staticFail === 0
      ? "PASS WITH ACTIONS"
      : "ACTION REQUIRED";

  const consoleReady =
    robots.valid && sitemapStats.valid && crawl.canonicalFail === 0
      ? "YES (technical)"
      : "NO";

  const snapshot = {
    generated_at: new Date().toISOString(),
    site: SITE,
    verdict,
    consoleReady,
    actions,
    robots,
    sitemapStats,
    crawl,
    duplicates: {
      titles: duplicates.titles.slice(0, 100),
      descriptions: duplicates.descriptions.slice(0, 100),
      titleGroupCount: duplicates.titles.length,
      descriptionGroupCount: duplicates.descriptions.length,
    },
    orphans: {
      linkedNotInSitemap: linkedNotInSitemap.slice(0, 200),
      linkedNotInSitemapTotal: linkedNotInSitemap.length,
      inSitemapNotLinkedSample: inSitemapNotLinked.slice(0, 80),
      inSitemapNotLinkedTotal: inSitemapNotLinked.length,
    },
    missingImages: missingImages.slice(0, 200),
    brokenLinks: brokenLinks.slice(0, 100),
    jsonLdSummary,
    richResults,
    staticChecks,
    coverage: {
      sitemapUrls: sitemapStats.urlCount,
      crawled: pages.length,
      propertyLimit: PROPERTY_LIMIT,
      internalLinkTargetsChecked: linkTargets.length,
    },
    pageDigest: okPages.map((p) => ({
      url: p.url,
      kind: p.kind,
      title: p.title,
      description: p.description ? sha256(p.description).slice(0, 12) : null,
      types: p.rich?.types || [],
      warnings: p.rich?.warnings || [],
      imageCount: p.imageCount,
      ms: p.ms,
    })),
  };

  writeFileSync(
    resolve(OUT_DIR, "wave1_google_readiness_snapshot.json"),
    JSON.stringify(snapshot, null, 2),
  );
  writeReports(snapshot);
  console.log(JSON.stringify({
    verdict,
    crawled: pages.length,
    sitemap: sitemapStats.urlCount,
    jsonLdFail: jsonLdSummary.fail,
    brokenLinks: brokenLinks.length,
    dupTitles: duplicates.titles.length,
    missingDesc: crawl.missingDescription,
  }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
