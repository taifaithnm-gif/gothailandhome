# PROJECT_DETAIL_IMPLEMENTATION_REPORT

**Date:** 2026-07-16  
**Milestone:** Phase 8.5 — Project Detail Alpha  
**Repository:** `/Users/jun/AI-Workspace/Projects/GoThailandHome`  
**Branch:** `main`  
**Pre-work HEAD:** `0e09644f81cf05031675b426f83c492921c43f5f`

## Scope

Redesign `/[lang]/projects/[slug]` only. No Developer / District redesign. No harvest. No verified listing mutations. No evidence classification rewrites. No schema changes. No deploy.

## Page structure delivered

| # | Section | Behavior |
|---|---------|----------|
| 1 | Project hero | Evidence-backed name, Thai name, developer, district, status, completion, verification label; official gallery media or neutral `ListingMediaFrame` |
| 2 | Key project facts | Type / buildings / floors / units / unit types / completion / status / address with per-field evidence badges; unknown stays unavailable |
| 3 | Available listings | Sale and rent separated; counts; ≤3 cards each via `listPublishedPropertiesPaged`; link to filtered search |
| 4 | Price summary | Min/max only when ≥3 verified published listings; labeled as current listing data, not developer pricing |
| 5 | Location | Verified coordinates only (OFFICIAL / VERIFIED_PORTAL); district / subdistrict / address / BTS·MRT |
| 6 | Facilities | Official group vs portal-verified group — not merged |
| 7 | Nearby places | Normalized POIs only; tolerates null / missing names / incomplete records |
| 8 | Developer | Verified identity, website, short profile, other projects, partnership CTA + non-representation disclaimer |
| 9 | Evidence disclosure | User-facing Official / Portal / Derived / Unavailable labels |
| 10 | Similar projects | Same district or same developer from published projects — not investment similarity |
| 11 | Find My Home | Platform assistance CTA |
| 12 | Project support | A official developer/project contact · B Platform CS (Apple = Platform CS only) |

## Data safety

- Completeness matrix is **read-only** (`src/lib/projects/evidence.ts`)
- Package facts (`project_status`, `facilities_official`) read for presentation only
- Removed unbounded `listPublishedPropertiesForProject` from first HTML
- District slug join added to `ProjectView` mapping (read-only FK expand)

## Related files

- `src/app/[lang]/projects/[slug]/page.tsx`
- `src/lib/projects/evidence.ts`
- `src/lib/projects/package-facts.ts`
- `src/lib/projects/normalize-project-content.ts`
- `src/lib/data/projects.ts`
- `src/dictionaries/{en,zh,th}.json`
- `scripts/test-project-evidence-labels.mjs`

## Overall

# PASS — Project Detail Alpha implemented
