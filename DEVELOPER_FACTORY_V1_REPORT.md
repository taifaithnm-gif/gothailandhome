# Developer Factory V1 Report

**Date:** 2026-07-14  
**Phase:** 6 — M2 Developer Factory  
**Scope:** Official developer knowledge base (no UI redesign, Marketplace, or AI)

---

## Summary

Imported and structured **20** Thailand developers into the Developer Factory knowledge base with official website + SET factsheet citations only. Each package includes JSON, Markdown, README compliance metadata, SEO fields, slug, verification status, and a logo slot under `public/developers/`.

---

## Deliverables

| Artifact | Path |
| --- | --- |
| Machine index | `content/developers/DEVELOPER_INDEX.json` |
| Human directory | `content/developers/DEVELOPER_DIRECTORY.md` |
| Per-developer packages | `content/developers/<slug>/` |
| Logos | `public/developers/<slug>/logo.svg` (+ `logo.meta.json`) |
| Generator | `pipelines/factory/generate-developers-v1.mjs` |
| Catalog | `pipelines/factory/lib/developers-v1.mjs` |

### Per developer files

| File | Purpose |
| --- | --- |
| `manifest.json` | Structured package (names, profile, listing, brands, projects, social, contact, SEO, verification) |
| `profile.md` | Markdown knowledge base |
| `README.md` | Compliance metadata sheet |

---

## Field coverage

| Field | Status |
| --- | --- |
| Official English / Chinese / Thai names | PASS |
| Logo path under `public/developers/` | PASS (placeholder SVG + rights note until cleared export) |
| Official website | PASS |
| Company profile | PASS (sourced prose) |
| Established year | PASS when SET establish date known; otherwise `null` (not fabricated) |
| Headquarters | PASS (city / SET address note when available) |
| Listed company | PASS when SET ticker + factsheet URL present; else `null` |
| Major brands | PASS (official site brand families only) |
| Major Bangkok / Pattaya / Phuket projects | PASS — **factory inventory only** (no invented market portfolios) |
| Social links | PASS |
| Contact information | PASS (null unless sourced; RISLAND phone from Livin site) |
| SEO metadata | PASS (en/zh/th) |
| Slug + verification_status | PASS (`platform_verified`) |

---

## Developers (20)

Sansiri, AP Thailand, Land and Houses, Pruksa Holding, Origin Property, Ananda Development, Supalai, SC Asset, Quality Houses, LPN Development, Major Development, MQDC, AssetWise, Raimon Land, Noble Development, Frasers Property Thailand, Sena Development, CapitaLand Thailand, Singha Estate, RISLAND Thailand.

SET-listed packages cite `set.or.th` factsheet URLs. CapitaLand Thailand and MQDC / RISLAND do **not** assert SET listing without an applicable SET factsheet for the Thailand entity.

---

## Validation

```bash
npm run factory:developers
npm run factory:validate:developers
```

| Check | Result |
| --- | --- |
| `factory:validate:developers` | PASS — 20 developers, 0 failed |
| Index + directory present | PASS |
| README / profile.md / logo.svg present | PASS |

---

## Explicit exclusions

- No UI redesign  
- No Marketplace  
- No AI enrichment  
- No fabricated establish years, tickers, contacts, or city project portfolios  

---

## Logo note

`public/developers/<slug>/logo.svg` is an explicit **placeholder** pending a rights-cleared official logo export. `logo.meta.json` records the official website for replacement. This avoids publishing scraped trademark files without clearance.

---

## Commit

See git history on `main` for this change set.
