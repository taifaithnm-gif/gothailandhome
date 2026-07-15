# PLATFORM_ALPHA_RC1_RELEASE_NOTES

**Tag:** `platform-alpha-rc1`  
**Date:** 2026-07-16  
**Branch:** `main`

## What Platform Alpha RC1 is

A **release candidate** of the GoThailandHome Bangkok-first marketplace Alpha after UI Foundation and Alpha page surfaces:

- Homepage Alpha  
- Search Results Alpha  
- Listing Detail Alpha  
- Project Detail Alpha  
- Developer Detail Alpha  

RC1 freezes feature work for acceptance. It is **not** a production deploy tag.

## Completed in Alpha (through RC1)

- Design-system UI Foundation (tokens, cards, badges, contact blocks, states)
- Verified public listing browse/search with paging (no full-catalog HTML serialization on results)
- Listing detail with evidence labels, contact A/B split, bounded similar listings
- Project detail with evidence-aware facts, bounded listings, official vs portal facilities
- Developer detail with Official / Partial / Factory-linked presentation (no logo promotion)
- Multilingual surfaces EN / ZH / TH
- Contact-role freeze: Apple = Platform Customer Success only
- Factory package baseline: **20** developers · **50** projects · **1,315** source listings

## Explicit non-goals for RC1

- No harvesting in this gate  
- No schema changes  
- No District Detail redesign  
- No deployment  
- No “fix” of the known UI/DB count drift (1,318 vs 1,315)

## How to verify locally

```bash
npm run typecheck && npm run lint && npm test && npm run build
npm run start -- -p 3040 -H 127.0.0.1
BASE_URL=http://127.0.0.1:3040 npm run test:project-routes
BASE_URL=http://127.0.0.1:3040 npm run test:developer-routes
```

## Companion documents

- `PLATFORM_ALPHA_RC1_ACCEPTANCE.md` — full gate evidence  
- `KNOWN_LIMITATIONS.md` — intentional / known product limits  
- `TECHNICAL_DEBT.md` — engineering backlog  

## Overall

Platform Alpha RC1 is accepted for local production build quality and route integrity.
