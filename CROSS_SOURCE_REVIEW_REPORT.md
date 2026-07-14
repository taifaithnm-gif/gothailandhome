# CROSS_SOURCE_REVIEW_REPORT

**Date:** 2026-07-14  
**Candidates reviewed:** 19  
**Policy:** Classify only · **do not merge or delete**

**Evidence:** `pipelines/factory/livinginsider/_runs/post-import-cross-source-review.json`

## Classification rules (read-only)

| Class | Criteria |
|-------|----------|
| `probable_same_unit` | Same project + type + beds + area(±0.5) + floor, and price ratio ≥ 0.90 |
| `possible_same_unit` | Same project + type + beds + area, floor or price ratio ≥ 0.85 |
| `different_unit` | Project/type mismatch or beds+area diverge |
| `insufficient_evidence` | Partial overlap only |

Soft fingerprints exclude title/price; classifications remain candidates until human confirm.

## Counts

| Classification | Count |
|----------------|------:|
| probable_same_unit | **18** |
| possible_same_unit | **1** |
| different_unit | 0 |
| insufficient_evidence | 0 |

## Notable patterns (not merged)

- One LI listing can soft-match multiple PH refs (shared typology), e.g. `livinginsider-3019477` → two PH sale IDs.
- Multiple LI listings can soft-match the same PH ref (e.g. three LI rents → `propertyhub-4539442` at 2BR / 54 sqm / floor 15). Treat as **candidate clusters**, not automatic merges.

## Possible same unit (1)

| LivingInsider | PropertyHub | Prices (THB) | Notes |
|---------------|-------------|--------------|-------|
| `livinginsider-2563481` | `propertyhub-5429067` | 2,390,000 vs 2,690,000 | Same beds/area/floor; price ratio 0.888 |

## Probable same unit (18)

All remaining pairs share project, listing type, bedrooms, area, and floor with price ratio ≥ 0.90 (many exact price matches). Full table in evidence JSON.

## Ops next step (out of scope)

Human review of probable clusters before any future merge tooling — sources stay independent.
