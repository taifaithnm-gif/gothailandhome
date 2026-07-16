# DISTRICT_COMPLETENESS_V2

**Milestone:** Phase 10 Sprint 5 · **Date:** 2026-07-16

## Formula (ten fields)

```
score = mean(overview, map, bts, mrt, schools, hospitals, shopping, parks, lifestyle, office_areas)
```

Each dimension scores **1** if `OFFICIAL` or `OFFICIAL_ABSENCE`, else **0**.

## Platform average

| Version | Avg |
|---------|----:|
| S1 (six arrays) | 3.7% |
| S4 (six + rail absence) | 59.3% |
| S5 (ten-field KB) | **65.2%** |
| S5 six-field compat | 62% |

**Target 90%:** not met.

## Distribution

| Band | Districts |
|------|----------:|
| 100% | 4 |
| 90–99% | 6 |
| 70–89% | 12 |
| 50–69% | 17 |
| <50% | 11 |

## Strongest / weakest

**100%:** chatuchak, pathum-wan, sathon, watthana

**Bottom (40%):** bang-phlat, bangkok-yai, bueng-kum, chom-thong, khlong-sam-wa, nong-khaem, rat-burana, sai-mai, saphan-sung, thawi-watthana, thung-khru
