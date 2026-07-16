# PROJECT_PROVENANCE_V2

**Milestone:** Phase 11 Project Factory Wave 2  
**Date:** 2026-07-16  
**Rule:** Every OFFICIAL field carries `field_evidence` with `provenance.url` (or explicit no-page note) and `verified_at: 2026-07-16`.

## Provenance classes used

| Class | Meaning |
|-------|---------|
| OFFICIAL | Fact taken from a dedicated official project / district page |
| UNVERIFIED | No official DETAIL evidence this wave (includes soft-lands) |

Portal / agency pages were **not** upgraded to OFFICIAL.

## OFFICIAL sources (Wave 2)

| Project | Provenance URL | Publisher |
|---------|----------------|-----------|
| modiz-rhyme-ramkhamhaeng | https://assetwise.co.th/en/condominium/modiz-rhyme/ | AssetWise |
| knightsbridge-prime-sathorn | https://en.origin.co.th/condominium/knightsbridge-prime-sathorn/ | Origin |
| knightbridge-collage-ramkhamhaeng | https://origin.co.th/condominium/knightsbridge-collage-ramkhamhaeng/ | Origin |
| the-esse-asoke | https://residential.singhaestate.co.th/en/condominium/the-esse/asoke | Singha Estate |
| the-esse-sukhumvit-36 | https://residential.singhaestate.co.th/en/condominium/the-esse/sukhumvit36 | Singha Estate |
| one-bangkok | https://www.onebangkok.com/en/ (+ Frasers One Bangkok page) | Frasers / TCC One Bangkok |

### Brochure PDFs (hotlink, not downloaded)

- Modiz: `cdn.assetwise.co.th/.../Page-Modiz-Rhyme-Brochure.pdf`
- KnightsBridge Prime: `en.origin.co.th/.../KNB-Prime-Sathorn-A4-.pdf`
- KnightsBridge Collage: `origin.co.th/.../E-Brochure-KNB-Collage-RamKhamhaeng-small.pdf`

## Explicit non-sources

| Rejected | Reason |
|----------|--------|
| https://theesseasoke.com/ | Agency resale site (Amazing Properties), not developer |
| PropertyHub / FazWaz / portal counts | Not official |
| KAVE Town Island / Colony pages | Different products — not substituted for KAVE Town Space |
| Origin Plug & Play Ramkhamhaeng | Different location — not substituted for Sukhumvit 101 |
| major.co.th/th/project/* (302 empty) | Not a usable DETAIL page |
| lh.co.th THE ROOM URLs (SSR shell) | Soft-land — no extractable DETAIL |

## Catalog vs publisher note

`the-esse-asoke` and `the-esse-sukhumvit-36` remain `developer.slug = sc-asset` in manifests. OFFICIAL facts cite **Singha Estate** residential URLs in provenance. Developer-slug correction is **out of scope** for this wave (no silent rewrite).

## Verification timestamp

All Wave 2 `field_evidence.*.verified_at` = **2026-07-16**.  
Machine snapshot: `pipelines/factory/content-factory/wave2_snapshot.json`.
