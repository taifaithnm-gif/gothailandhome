# DEVELOPER_REPORT

**Milestone:** Phase 6 — M2 Bangkok Property Factory
**Date:** 2026-07-14
**Packaged developers:** 20 · **Supabase `developers`:** 23

## Field coverage (of 20 packaged developers)

| Field | Coverage | Notes |
|-------|---------:|-------|
| `name` (EN/ZH/TH) | 20/20 | i18n triple |
| `website` (official) | 20/20 | Official developer domain |
| `logo_path` + `public/developers/<slug>/logo.svg` | 20/20 | SVG logo asset present |
| `verification_status` | 20/20 | e.g. `platform_verified` |
| `description` (EN/ZH/TH) | 20/20 | |
| `headquarters` | 20/20 | |
| `social_links` | 20/20 | incl. `facebook_url` |
| `major_projects` | 20/20 | |
| `project_slugs` (linkage) | 20/20 | Links developer → project packages |
| `seo` | 20/20 | Title/description |
| `established_year` | **5/20** | Populated **only where sourced**; left null otherwise (not inferred) |

`established_year` is intentionally sparse: it is filled only for developers whose
founding year was confirmed from the official source (Ananda 1999, AP 1984,
Land & Houses 1983, Origin 2009, Sansiri 1984). The remaining 15 are left null
rather than guessed — consistent with the M2 "never infer" rule.

## Developer directory

| Slug | Name | Established | Linked projects | Official site |
|------|------|:-----------:|:---------------:|---------------|
| ananda-development | Ananda Development | 1999 | 4 | https://www.ananda.co.th/ |
| ap-thailand | AP Thailand | 1984 | 5 | https://www.apthai.com/ |
| assetwise | AssetWise | — | 2 | https://www.assetwise.co.th/ |
| capitaland-thailand | CapitaLand Thailand | — | 1 | https://www.capitaland.com/th/en.html |
| frasers-property-thailand | Frasers Property Thailand | — | 2 | https://www.frasersproperty.co.th/ |
| land-and-houses | Land and Houses | 1983 | 2 | https://www.lh.co.th/ |
| lpn-development | LPN Development | — | 1 | https://www.lpn.co.th/ |
| major-development | Major Development | — | 3 | https://www.major.co.th/ |
| mqdc | MQDC | — | 2 | https://www.mqdc.com/ |
| noble-development | Noble Development | — | 3 | https://www.noblehome.com/ |
| origin-property | Origin Property | 2009 | 3 | https://www.origin.co.th/ |
| pruksa-holding | Pruksa Holding | — | 4 | https://www.pruksa.com/ |
| quality-houses | Quality Houses | — | 1 | https://www.qh.co.th/ |
| raimon-land | Raimon Land | — | 2 | https://www.raimonland.com/ |
| risland-thailand | RISLAND Thailand | — | 1 | https://www.livinram.com/en |
| sansiri | Sansiri | 1984 | 5 | https://www.sansiri.com/ |
| sc-asset | SC Asset | — | 3 | https://www.scasset.com/ |
| sena-development | Sena Development | — | 1 | https://www.sena.co.th/ |
| singha-estate | Singha Estate | — | 1 | https://www.singhaestate.co.th/ |
| supalai | Supalai | — | 4 | https://www.supalai.com/ |

## Index artifacts

- `content/developers/DEVELOPER_INDEX.json` — machine index
- `content/developers/DEVELOPER_DIRECTORY.md` — human directory
- Per developer: `manifest.json`, `profile.md`, `README.md`, `public/developers/<slug>/logo.svg`

## Validation

All 20 developer packages pass `validate --developers` (schema + required assets:
manifest, profile.md, README.md, public logo.svg). 0 failures.

## Supabase reconciliation

Live `developers` count = **23**. The +3 over packaged (20) are earlier-phase seeds
retained by incremental upsert. No developer row was overwritten this milestone.
