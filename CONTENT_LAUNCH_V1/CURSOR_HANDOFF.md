# CONTENT_LAUNCH_V1 — Cursor Integration Handoff

**Generated:** 2026-08-02
**Mode:** Content editing only — no application code, no Git, no migrations, no deploy performed.
**Location note:** The brief specified `/Volumes/AI_SHARE/GoThailandHome/CONTENT_LAUNCH_V1` as the output path and `/Volumes/AI_SHARE/KNOWLEDGE_DATABASE` as the source. Neither exists on this machine (no external/network volume named `AI_SHARE` is mounted — confirmed via `diskutil list`). Per user direction, this package was built entirely from the **local repo's own verified content** (`content/`, `public/`) and written to `CONTENT_LAUNCH_V1/` at the project root instead. If a real `AI_SHARE` knowledge base becomes available, re-run against it — it likely has richer developer/area intelligence than what's captured here.

## What's in this package

| File | Contents | Status |
| --- | --- | --- |
| `homepage_content.json` | Hero, featured projects/areas refs, why-buy, buyer journey, property categories, developer highlights, knowledge section, consultation CTA, footer trust text (EN/ZH/TH) | Ready |
| `featured_projects.json` | 12 selected Bangkok condominiums, full bilingual+ copy, real sale-price ranges from `listings.json` | Ready |
| `area_content.json` | Bangkok (full), Pattaya/Phuket/Chiang Mai (explicitly flagged, not fabricated) | Bangkok ready; other 3 blocked on data |
| `developer_content.json` | Top 10 developers by verified Bangkok project count | Ready |
| `knowledge_cards.json` | 21 cards pulled directly from existing `content/knowledge/articles/*.json` | Ready |
| `cta_content.json` | Reusable CTA copy blocks | Ready |
| `image_manifest.json` | 52 entries: homepage, 12 projects (hero/gallery/floor-plan), 10 developer logos | 33 approved / 18 placeholder-required |
| `content_validation.json` | 30/30 automated checks passed; full CRITICAL_GAPS list | Ready |

## Key deviations from the brief (read before integrating)

1. **12 projects, not part of a 65-project catalogue.** The local `content/projects/` corpus has exactly **50** verified Bangkok packages — all condominiums, all Bangkok. There is no Pattaya, Phuket, Chiang Mai, or villa inventory anywhere in this repo. The 12 selected are the highest-completeness packages (Sprint A `PROJECT_AUDIT.md` scores of 80–100%), chosen for developer/district diversity within that constraint.
2. **Area pages for Pattaya/Phuket/Chiang Mai are not production content.** `CONTENT_DRAFTS/AREAS/{pattaya,phuket,chiang-mai}.md` are literal blueprint scaffolds with `【ZH PLACEHOLDER】` text, not real content. Rather than launder those placeholders into "production-ready" copy, `area_content.json` marks all three `NOT_PRODUCTION_READY` with a short, defensible general-knowledge positioning line each and empty `featured_projects: []`. Do not present these as complete area pages.
3. **Price data is real**, pulled from `content/projects/*/listings.json`, filtered to `listing_type: "sale"` and `verification_status: "verified"` only (the raw listings mix sale and monthly-rent records — mixing them would have produced nonsense price bands).
4. **Image manifest reflects the actual `public/` tree**, not aspiration. 33/52 entries already have an approved local asset; 18 are `PLACEHOLDER_REQUIRED` — notably the homepage hero banner (`public/banners/` is empty except a README), all 4 area cards (`public/cities/` likewise empty), and every asset for `the-livin-ramkhamhaeng` (only an SVG hero placeholder exists on disk).

## Suggested Cursor integration order

1. Wire `homepage_content.json` sections into the homepage template — it references `featured_projects.json`, `developer_content.json`, and `knowledge_cards.json` by id/slug rather than duplicating their content.
2. Wire `featured_projects.json` into the "Featured Projects" homepage rail and confirm each `project_id` resolves via the existing `[lang]/projects/[slug]` route.
3. Publish `area_content.json`'s Bangkok entry; render the other three as "Coming soon" cards using their `overview` text only (see `homepage_content.featured_areas`).
4. Wire `developer_content.json` into the developer highlights rail.
5. Source real photography for the 18 `PLACEHOLDER_REQUIRED` image_manifest entries before those sections go live with anything other than a placeholder graphic.

## NEXT_ACTION

`CURSOR_CONTENT_INTEGRATION_AND_PRODUCTION_RELEASE` — with the scope caveat that Pattaya/Phuket/Chiang Mai area pages and the villa category should stay in "coming soon" state until verified source data exists.
