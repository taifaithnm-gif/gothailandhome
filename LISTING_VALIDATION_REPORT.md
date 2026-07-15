# LISTING_VALIDATION_REPORT

**Date:** 2026-07-15  
**Milestone:** Phase 8.4 — Listing Detail Alpha

## Baseline

| Check | Result |
|-------|--------|
| Root | `/Users/jun/AI-Workspace/Projects/GoThailandHome` |
| Branch | `main` |
| Pre-work HEAD | `685240c1d6f0a7e1f4183e65186f81a435d0d8e2` |
| Working tree | Clean before start |
| `origin/main` | Synced (0/0) |

## Gates

| Gate | Result |
|------|--------|
| TypeScript | PASS |
| Lint | PASS (0 errors; pre-existing pipeline warnings) |
| Tests | PASS (contact, integrity, project content, pagination, listing-search, ui-foundation) |
| Production build | PASS |
| Detail route smoke EN/ZH/TH | PASS HTTP 200 |
| Listing integrity n=1,315 | PASS |
| Contact-role / Apple invariants | PASS |
| Responsive sections present | PASS (gallery, summary, facts, project, map, nearby, contacts, similar, source) |
| Accessibility (Lighthouse mobile detail) | **1.00** |
| Performance (Lighthouse mobile detail) | **0.75** · LCP **5.1 s** · CLS **0** |
| Search performance maintained | **0.86** · a11y **0.98** · CLS **0** (prior Alpha ~0.80–0.87) |
| Harvest / listing data edits / deploy | None |

## Performance note

Removed `properties/loading.tsx` Suspense fallback. The thin loading shell was swapping into the full results/detail tree and producing CLS ≈ 0.62. Search performance recovered after removal. Loading-state primitives remain available for a future height-matched skeleton.

## Evidence

- `pipelines/factory/overnight/_runs/listing-detail-lighthouse.json`
- `pipelines/factory/overnight/_runs/listing-detail-lighthouse-summary.json`

## Overall

# PASS
