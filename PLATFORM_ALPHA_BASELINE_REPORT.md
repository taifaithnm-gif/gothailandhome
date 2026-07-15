# Platform Alpha Baseline Report

**Date:** 2026-07-15  
**Repository:** `/Users/jun/AI-Workspace/Projects/GoThailandHome`  
**Freeze tag:** `platform-alpha-data-freeze-v1`  
**Tagged commit:** `8cd3595f98407ed49c566846e8f4ff02c4289bea`

## Identity verification

| Check | Value |
|--------|--------|
| Root | `/Users/jun/AI-Workspace/Projects/GoThailandHome` |
| Branch | `main` |
| HEAD | `8cd3595f98407ed49c566846e8f4ff02c4289bea` |
| Origin | `git@github.com:taifaithnm-gif/gothailandhome.git` |
| `origin/main` | identical to HEAD |
| Working tree | clean at freeze time |

## Gate results at freeze

| Gate | Result |
|------|--------|
| Tests (`npm test`) | PASS (contact-role + listing integrity) |
| TypeScript | PASS |
| ESLint | PASS (0 errors, 2 pre-existing warnings) |
| Production build | PASS |
| Listing integrity | PASS — n=1315, baseline match |
| Supabase reconciliation | PASS for source packages; layer deltas noted below |

## Verified data baseline (source packages)

| Source | Count | Expected | Status |
|--------|------:|---------:|--------|
| PropertyHub | 617 | 617 | MATCH |
| LivingInsider | 316 | 316 | MATCH |
| DotProperty | 192 | 192 | MATCH |
| FazWaz | 190 | 190 | MATCH |
| **Total source records** | **1,315** | **1,315** | **MATCH** |

Baseline fingerprint file: `pipelines/factory/project-master/listing_baseline.json`  
`baseline_sha256`: `f0eb4b0ab5381dd47bc60bff0f6fed68d98346cb85cc3993df11f9477d78872c`

## Project / developer baseline

| Layer | Developers | Projects | Notes |
|-------|----------:|---------:|-------|
| Content master | 20 | 50 | Matches expected freeze counts |
| Supabase | 23 developers | 52 `property_projects` | Includes 3 extra developer stubs + 2 extra project rows |
| Listing sources table | — | — | `property_listing_sources` = **1,315** |
| Published properties | — | — | `properties` = **1,331** (1,315+16 operational rows) |

**Decision:** Content Package Master counts (20 / 50 / 1,315) are the verified freeze authority. DB supersets are recorded, not treated as harvest drift.

## Marketplace / contact freeze status

- Contact role taxonomy live in `config/contacts.json` v2.
- Apple + Khun ICE = `platform_customer_success` only.
- Marketplace forms live: Find My Home, List Your Property, Developer/Agency Partnership, viewing request.
- Lead tables present: `marketplace_leads`, `marketplace_lead_activities` (empty at freeze).
- No billing / lead resale implemented (by design).

## Current public route surface (build)

Home, About, Contact, Properties (+ detail), Projects (+ detail), Developers (+ detail), Cities (+ detail), Districts (detail), Search, Find My Home, List Your Property, Partners (developers/agencies), Admin (+ login/edit), Auth callback, robots.txt, sitemap.xml.

**Missing vs product vocabulary:** dedicated Buy/Rent IA routes, Knowledge/article hub, end-user dashboards.

## Freeze statement

Verified source inventory and Project Master content baseline are frozen under tag `platform-alpha-data-freeze-v1` before Platform Alpha UI/UX work. No schema, harvest, deploy, or UI redesign was performed in this audit.
