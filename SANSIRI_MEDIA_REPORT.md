# SANSIRI_MEDIA_REPORT

**Milestone:** Phase 11 Batch 2 · Sansiri media provenance  
**Date:** 2026-07-16  
**Policy:** Register official URLs + copyright. Do not scrape unlicensed gallery/hero binaries.

## Developer media

| Asset | Status | Official URL |
|-------|--------|--------------|
| Logo | Cached (prior Sprint) | https://assets.sansiri.com/o77site/social/sansiri-corporate-share-1200x630.jpg |
| Favicon | Cached (prior Sprint) | https://resource.sansiri.com/sansiri-com-frontend/assets/img/favicon.ico |

## Project media

| Project | Gallery | Brochure | Floor plans | Hero |
|---------|---------|----------|-------------|------|
| xt-phayathai | 17 URLs registered · pending license | PDF registered · pending license | Section hotlink · pending license | Official page / project upload · pending |
| xt-huai-khwang | 14 URLs registered · pending license | PDF registered · pending license | Section hotlink · pending license | Official page · pending |
| the-line-sukhumvit-101 | 11 URLs registered · pending license | PDF registered · pending license | Section hotlink · pending license | Official page · pending |
| the-base-sukhumvit-77 | None on live page | None | Unverified (empty details) | Placeholder / press assets only — not upgraded |
| condo-u-sukhumvit-62-1 | No official page | No official page | No official page | Unverified |

## Brochure URLs (official)

- XT Phayathai: `https://www.sansiri.com/uploads/docs/2018/08/28/21361a5c-8176-49a4-b972-b4a245f1a6d2.pdf`
- XT Huaikhwang: `https://www.sansiri.com/uploads/docs/2018/09/20/b55832b2-8d6d-45a5-83e0-5136a85bf780.pdf`
- THE LINE Sukhumvit 101: `https://www.sansiri.com/uploads/docs/2017/01/24/e3f71a73-254d-4666-abd2-61cdf56ff82c.pdf`

## Provenance writes

- Project manifests: `media_library.{gallery,brochure,floor_plans,hero}`
- Media library assets updated under `content/media/library/projects/{slug}/`
- Copyright string: `© Sansiri Public Company Limited / {project}`

## Non-actions

- No binary gallery/hero scrape
- No portal screenshot ingestion
- Investor-guide PDF on pages ignored (not a project brochure)
