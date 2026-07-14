# PROPERTY_FACTORY_REPORT

**Milestone:** Phase 6 — M2 Bangkok Property Factory
**Date:** 2026-07-14
**Data policy:** real, sourced, verifiable — no mock, no placeholder, no inferred fields

## What the factory is

A deterministic content pipeline that turns approved public sources into validated,
importable packages, then upserts them incrementally into Supabase. No source
architecture was changed for M2; this milestone operated the existing pipeline and
audited its output.

```
approved sources ──▶ harvest ──▶ content/ packages ──▶ validate ──▶ apply (upsert) ──▶ Supabase
 (PropertyHub etc.)   (.mjs)      developers/projects/    (AJV +      (import-engine)    (23/52/633)
                                  listings/areas         standards)
```

## Pipeline components (existing architecture, unchanged)

| Path | Role |
|------|------|
| `pipelines/factory/cli.mjs` | `validate` / `dry-run` / `apply` / `resume` / `rollback` / `generate` |
| `pipelines/factory/lib/validate.mjs` | Schema + DATA_STANDARD validation for every package kind |
| `pipelines/factory/lib/import-engine.mjs` | Incremental upsert to Supabase, batch tracking |
| `pipelines/factory/harvest-propertyhub-wave1.mjs` | PropertyHub public `__NEXT_DATA__` → DTOs (price-gated) |
| `pipelines/factory/import-all-listings.mjs` | Batch listing import across projects |
| `pipelines/factory/schemas/*.json` | JSON Schemas: developer, project, district, listing, media, source, i18n |

## Output inventory (packaged)

| Package kind | Count | Location |
|--------------|------:|----------|
| Developer packages | 20 | `content/developers/<slug>/` |
| Project packages | 50 | `content/projects/<slug>/manifest.json` |
| Listing packages | 33 | `content/projects/<slug>/listings.json` |
| Verified listings | 617 | (within listing packages) |
| District SEO packages | 50 | `content/areas/bangkok/districts/*.json` |

## Data provenance

Every listing carries: `source` (`propertyhub`), `listing_url`, `external_ref`,
`collected_at` / `source_captured_at`, `source_updated_at`,
`verification_status=verified`, `duplicate_fingerprint`. Only listings with a
published price on the source detail page were imported — the harvester drops any
record where `price_thb` is not `> 0`.

## Anti-fabrication controls exercised this milestone

1. **Spot re-verification against live source** — re-fetched a Wave-1 listing detail
   page; price, bedrooms, area and floor matched the stored package byte-for-value.
2. **Price gate** — no unpriced listing enters a package.
3. **No inferred slugs** — 17 projects with unresolved source slugs were left with
   zero listings rather than force-matched to a similarly-named PropertyHub project.
4. **Established-year discipline** — only 5/20 developers carry `established_year`,
   populated solely where the value was sourced; the rest are left null, not guessed.

## Factory KPIs vs. M2 brief

| KPI | Target | Result | Verdict |
|-----|--------|--------|---------|
| Developer packages | (breadth) | 20 packaged / 23 in DB | ✅ |
| Bangkok projects | 50 | 50 packaged / 52 in DB | ✅ |
| Verified listings | real, priced only | 617 packaged / 620 in DB | ✅ |
| Validation | zero-defect | 153/153 pass | ✅ |
| Import | incremental, non-destructive | 120/120 ok, 0 error | ✅ |

## Known limitations (carried forward)

- Sathon khet (`sathon`) has 0 verified listings — needs a priced source.
- Media galleries per project are not yet harvested (licence-clean sourcing pending).
- 17 gap projects await a resolvable priced source.

See companion reports for entity-level detail.
