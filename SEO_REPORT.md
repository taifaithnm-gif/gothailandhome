# SEO_REPORT

**Milestone:** Phase 6 — M2 Bangkok Property Factory
**Date:** 2026-07-14
**Policy:** SEO derived only from real, sourced facts (name, district, sourced specs)

## STEP 5 field status (honest audit)

| SEO field (STEP 5) | Status | Where |
|--------------------|--------|-------|
| Title (EN/ZH/TH) | ✅ | Project `seo.title`, district `seo.title`, app `generateMetadata` |
| Description (EN/ZH/TH) | ✅ | Project/district `seo.description`; app metadata |
| Slug | ✅ | Project/district/developer slugs (canonical, URL-safe) |
| OpenGraph | ✅ | Next.js `metadata.openGraph` in `src/app/layout.tsx` + project page; OG images via `projectOpenGraphImages()` |
| FAQ | ✅ (partial) | 33/50 project manifests carry sourced EN/ZH/TH FAQ |
| Internal Links | ✅ | developer→project (`project_slugs`), project→district (`location.district_slug`), district→nearby_projects |
| **Keywords** | ❌ gap | No `seo.keywords` field in project or district packages |
| **Schema.org JSON-LD** | ❌ gap | No `application/ld+json` emitted anywhere in `src/` |

## What is real and shipping

- **50/50 Bangkok district SEO packages** are `publish_ready` with complete EN/ZH/TH
  title + description (`content/areas/bangkok/districts/*.json`).
- **50/50 project manifests** carry `seo.title` + `seo.description` in EN/ZH/TH,
  derived from the real project name and district (no invented marketing copy).
- **OpenGraph** metadata is generated per route by the existing Next.js metadata
  layer; project OG cards fall back to `/og/projects/placeholder.svg` until a real
  hero image exists.
- **FAQ** entries (33 projects) are built strictly from sourced facts — completion
  year and total units from PropertyHub `projectInfo` — never invented Q&A.

## Honest gaps (STEP 5 not fully met)

1. **Schema.org JSON-LD is not implemented.** The brief requires JSON-LD; the app
   currently emits Open Graph and standard metadata but no `@context`/`@type`
   structured data. Recommended: add `RealEstateListing` / `Residence` +
   `BreadcrumbList` + `FAQPage` JSON-LD to the project route, sourced from the same
   manifest fields — no new data required, only serialization.
2. **No `keywords` field** in packages. Recommended: derive from real tokens
   (project name, district EN/ZH/TH, developer, transit tags) at generation time.

These are reported rather than back-filled with speculative keyword stuffing or
hand-written JSON-LD, to keep every SEO field traceable to a real source.

## Recommended next SEO actions

1. Implement a `<JsonLd>` server component fed by project/district manifests.
2. Add `seo.keywords` to the package generator from existing real tokens.
3. Generate real per-project OG images once licence-clean hero media lands (see
   `MEDIA_REPORT.md`).
