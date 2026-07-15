# PROJECT_OFFICIAL_DETAIL_PASS_REPORT

**Phase:** 7 — Official Detail Pass (Ananda / AP / Sansiri / Supalai priority)  
**Date:** 2026-07-15  

## Scope

Verify facts only when explicit on **project-specific** official pages. Never infer. Never equate differently named sister projects.

## Enrichments applied (Tier 1 accessible)

- `ashton-asoke` — official_url, name_en, name_th, status, building_count, total_units, floor_count, bts, mrt, gallery ← https://www.ananda.co.th/en/condominium/ashton-asoke
- `ideo-q-sukhumvit-36` — official_url, name_en, name_th, status, building_count, total_units, bts, unit_types, gallery ← https://www.ananda.co.th/en/condominium/ideo-q-sukhumvit-36
- `life-asoke-rama-9` — official_url, name_en, name_th, status, gallery ← https://www.apthai.com/en/condominium/life-asoke-rama-9
- `life-ladprao` — official_url, name_en, name_th, status, gallery ← https://www.apthai.com/en/condominium/life-ladprao
- `one-bangkok` — retain_prior_official ← https://www.onebangkok.com/en/
- `the-forestias` — retain_prior_official ← https://www.theforestias.com/
- `the-livin-ramkhamhaeng` — official_url, name_en, name_th, status, mrt, unit_types, gallery, brochure_pointer, floor_plan_pointer ← https://www.livinram.com/en

### Fact highlights

| Project | Upgrades |
|---------|----------|
| `ashton-asoke` | Name EN/TH, URL, status READY TO MOVE IN, buildings 1, units 783, floors 50, BTS Asoke 230m, MRT Sukhumvit 20m, gallery source |
| `ideo-q-sukhumvit-36` | Name EN/TH, URL, status, buildings 2, units 449, unit types (1BR / Spacious / Plus), BTS Thong Lor 450m, gallery; floor_count left UNVERIFIED (A47/B24) |
| `life-asoke-rama-9` | Project URL, EN/TH names, developer AP, status SOLD OUT→completed, gallery source |
| `life-ladprao` | Project URL, EN/TH names, developer AP, status SOLD OUT→completed, gallery source |
| `the-livin-ramkhamhaeng` | Unit types, MRT Orange/Yellow Lamsali distances, facilities pointers, brochure/floor-plan **source pointers only**, status 100% progress→completed |
| `one-bangkok` / `the-forestias` | Prior official address/transit/facilities retained; classifications hygiene-aligned |

## BLOCKED / not upgraded

- `life-one-wireless` — Official AP page returns maintenance / Coming back soon
- `aspire-sathorn-taksin` — Official AP page returns maintenance / Coming back soon
- `rhythm-ekkamai` — Official AP /rhythm-ekkamai unavailable; live page is rhythm-ekkamai-estate (name mismatch — not applied)
- `ideo-rama-9` — Candidate Ananda page is Ideo Rama 9 - Asoke (ideo-rama9-asoke); package name IDEO Rama 9 — identity not equated
- `ideo-mobi-sukhumvit-66` — No Ananda /condominium/ DETAIL page found (blog only) — not used for OFFICIAL DETAIL upgrades
- `supalai-oriental-sukhumvit-39` — supalai.com project page fetch timed out this pass
- `supalai-elite-phayathai` — No confirmed accessible project-specific DETAIL page this pass
- `supalai-lite-sathorn-charoenrat` — No confirmed accessible project-specific DETAIL page this pass
- `supalai-veranda-rama-9` — No confirmed accessible project-specific DETAIL page this pass
- `the-base-sukhumvit-77` — No Sansiri project-specific condo URL confirmed
- `the-line-sukhumvit-101` — No Sansiri project-specific condo URL confirmed
- `xt-phayathai` — No Sansiri project-specific condo URL confirmed
- `xt-huai-khwang` — No Sansiri project-specific condo URL confirmed
- `condo-u-sukhumvit-62-1` — No Sansiri project-specific condo URL confirmed

## Identity non-equivalences (important)

- Package `ideo-rama-9` (**IDEO Rama 9**) ≠ Ananda page **Ideo Rama 9 - Asoke**
- Package `rhythm-ekkamai` ≠ AP page **RHYTHM Ekkamai Estate**

## Integrity

- Listing files unchanged: **198/198**
- Source counts unchanged: PH 617 / LI 316 / DP 192 / FZ 190 / n=1315
- No media binaries downloaded
- No schema changes

## Result

**PASS WITH ACTIONS** — hygiene complete; official depth expanded only where project-specific pages were accessible and identity-matched.
