# Website Existing Capability Audit

**Audit date:** 2026-07-18  
**Device boundary:** Mac mini only  
**Mode:** Read-only repository audit  
**Repository:** `/Users/jun/AI-Workspace/Projects/GoThailandHome`

## Evidence limitations

- Required file `GO_THAILAND_HOME_CURRENT_STATUS.md` is absent. This is already acknowledged in `CONTENT_FACTORY_V1_SCOPE.md`.
- Alpha status is therefore evidenced from `PLATFORM_ALPHA_RC2_ACCEPTANCE.md`, `PLATFORM_ALPHA_RC2_RELEASE_NOTES.md`, Phase 12 reports, tags, and current Git history.
- No build was run because `next build` writes `.next/`, which would violate this audit's no-modification boundary.
- Typecheck, lint, and tests were run because they are non-mutating diagnostics.
- Completion is not inferred from plans. Every classification below cites repository code, configuration, tests, or accepted validation evidence.

## Repository verification

| Check | Verified result | Evidence |
| --- | --- | --- |
| Repository root | `/Users/jun/AI-Workspace/Projects/GoThailandHome` | `git rev-parse --show-toplevel` |
| Branch | `main` | `git branch --show-current` |
| Remote alignment | `HEAD`, `origin/main`, and `origin/HEAD` at `eedf3f7` | Git log/status |
| Current commit | `eedf3f7` — Phase 12 Design QA | Git log |
| Working tree | Tracked tree unchanged; many pre-existing untracked planning/audit Markdown files | `git status --short` |
| Framework | Next.js **16.2.10**, App Router; React **19.2.4**; TypeScript 5; Tailwind 4 | `package.json`, `src/app/` |
| Package version | `0.1.0` | `package.json` |
| Latest tagged website RC | `platform-alpha-rc2` — PASS WITH ACTIONS at `e3a5a9a` | RC2 acceptance/release notes |
| Current post-RC state | Phase 10–12 commits exist after RC2; current `eedf3f7` is not separately tagged/re-certified as a new RC | Git tags/log |
| Feature Freeze | Active for production/database/Content Factory changes | Sprint 0–4 and blocker documents |

## Build and test commands

| Command | Purpose | Current audit result |
| --- | --- | --- |
| `npm run dev` | Next development server | Defined; not run |
| `npm run build` | Production build | Defined; not run in read-only audit; RC2 recorded PASS at older commit |
| `npm run start` | Start production build | Defined; not run |
| `npm run typecheck` | `tsc --noEmit` | **PASS** at `eedf3f7` |
| `npm run lint` | ESLint | **PASS with 9 warnings**, 0 errors |
| `npm test` | Structural/integrity suite | **FAIL** at `test:developer-center`; prior tests before failure passed |
| `npm run format:check` | Prettier check | Defined; not run |
| Route checks | Project/developer HTTP checks | Defined separately; require a running server; not run |

### Current test failure

`scripts/test-developer-center.mjs` accepts only `placeholder` or `official_remote`. Current
`public/developers/ananda-development/logo.meta.json` uses `official_cached`, so the aggregate
test exits 1 before later test commands run. This is repository evidence of a stale invariant or
metadata-contract mismatch; the audit does not decide which side is authoritative.

## Deployment and URL evidence

| Area | Finding |
| --- | --- |
| Production URL reference | `https://www.gothailandhome.com` in `src/config/site.ts` |
| Canonical domain | `www.gothailandhome.com` |
| Local validation URL | `http://127.0.0.1:3040` in RC2 acceptance |
| Preview URL | No stable `*.vercel.app` preview URL found in source |
| Vercel project link | Present and gitignored: `.vercel/project.json` → project `gothailandhome` |
| Vercel/Netlify config | No `vercel.json`, `netlify.toml`, or deployment workflow found |
| CI deployment workflow | No `.github/workflows/*` deployment configuration found |
| Next deployment config | Only `next.config.ts` image remote pattern for Supabase storage |
| Deployment certification | RC2 acceptance used local `next start`; live host is referenced by ops/CEO docs, but HEAD is not a new CDN re-certification |
| Production deployment gate | BLOCKED BY BUSINESS DECISION / Feature Freeze; not blocked by Windows 01 |

## Capability classifications

Allowed status vocabulary:
`COMPLETE`, `PARTIAL`, `NOT BUILT`, `BLOCKED BY WINDOWS01`,
`BLOCKED BY BUSINESS DECISION`, `BLOCKED BY DATA SOURCE`,
`NOT REQUIRED FOR ALPHA RC`.

| # | Capability | Status | Repository evidence and limits |
| ---: | --- | --- | --- |
| 1 | Home page | **COMPLETE** | `src/app/[lang]/page.tsx`; multilingual home sections, search, listings, projects, districts, guides, support; RC2 route PASS |
| 2 | Property/project listing pages | **COMPLETE** | `src/app/[lang]/properties/page.tsx`, `projects/page.tsx`; verified-only listing query, pagination, cards, project index |
| 3 | Property/project detail pages | **COMPLETE** | `properties/[id]/page.tsx`, `projects/[slug]/page.tsx`; gallery/contact/evidence/project sections; RC2 listing/project routes PASS |
| 4 | Developer pages | **COMPLETE** | Developer index/detail and `developer-center.tsx`; 20 packaged developer masters. Current developer-center test mismatch is build-health debt, not route absence |
| 5 | Area/location pages | **PARTIAL** | City index/detail and district detail exist; `PUBLIC_ALPHA_BACKLOG.md` still lists a district index route; content completeness is uneven |
| 6 | Search and filters | **COMPLETE** | Search redirect, `ListingFilters`, search-state parser, query/location/type/price/area/bedroom/developer/project/transit/sort/pagination |
| 7 | Property comparison | **NOT BUILT** | No comparison route, component, or state found |
| 8 | Favorites | **NOT BUILT** | No favorite/wishlist route, component, persistence, or state found |
| 9 | Map interface | **PARTIAL** | District packages retain coordinates and generate external Google Maps links; no embedded map UI/provider integration |
| 10 | Investment content | **PARTIAL** | Home investment browse CTA and evidence-controlled district investment summaries exist; no dedicated investment guide/analysis surface |
| 11 | Legal guidance content | **NOT BUILT** | No legal guidance route or legal-content module found; legal names and disclaimers are not a guidance center |
| 12 | Blog / knowledge content | **PARTIAL** | Knowledge hub, glossary, Bangkok district index and controlled content files exist; no routed article/blog detail system found |
| 13 | Multilingual support | **PARTIAL** | EN/ZH/TH dictionaries and locale routes exist; root `<html lang>` defaults to `en` and is patched client-side; some source copy remains untranslated |
| 14 | SEO metadata | **COMPLETE** | Root metadata plus route-level `generateMetadata` and shared metadata builder |
| 15 | Sitemap | **PARTIAL** | Dynamic localized sitemap covers static/city/district/developer/project/property routes; documented listing cap misses part of published inventory |
| 16 | `robots.txt` | **COMPLETE** | `src/app/robots.ts` allows public paths, disallows admin, supplies host and sitemap |
| 17 | Canonical URLs | **COMPLETE** | Absolute locale-aware canonical and language alternates from metadata helper using production site config |
| 18 | Open Graph | **COMPLETE** | Default OG/Twitter metadata and project/listing overrides; placeholder used where source media is unavailable |
| 19 | Structured data / JSON-LD | **COMPLETE** | `src/lib/seo/schema.ts` and `JsonLd`; Organization, WebSite, collection, listing, project, developer, district, breadcrumbs and FAQ schemas |
| 20 | Responsive mobile layout | **COMPLETE** | Responsive Tailwind layouts and mobile navigation; RC2 mobile PASS and Phase 12 responsive reports. No physical-device matrix |
| 21 | Image optimization | **PARTIAL** | Responsive `sizes`, lazy loading, and a Supabase remote allowlist exist; most media still uses raw `<img>`, and the limited `next/image` usage includes an explicit `unoptimized` project hero. CDN/media pipeline remains open |
| 22 | Accessibility | **PARTIAL** | Labels, focus styles, ARIA, alt text, keyboard-aware controls and prior Lighthouse evidence exist; no full WCAG/axe CI audit |
| 23 | CMS/content management | **PARTIAL** | Supabase-backed admin property create/edit/publish exists; no general developer/project/knowledge CMS and no approved Content Factory integration |
| 24 | Admin/review interface | **PARTIAL** | `/admin` authentication and property CRUD exist; Sprint 2 evidence/fact/duplicate/publish review workflow is not implemented |
| 25 | AI-related frontend placeholders | **COMPLETE** | `AiConcierge` presentation exists and tests enforce non-agent wording; intentionally no project-specific AI backend |
| 26 | Analytics configuration | **PARTIAL** | Ads/Meta placeholder bootstrap and conversion hooks exist; GA4 Measurement ID/bootstrap, GSC verification and operational monitoring are absent |
| 27 | Error pages | **PARTIAL** | Root and locale 404s plus lead success/error routes exist; branded route `error.tsx`/`loading.tsx` coverage remains backlog |
| 28 | Forms and lead generation | **COMPLETE** | Find My Home, List Property, developer/agency partnership, viewing, project lead and support forms; validation and shared success/error behavior tested |
| 29 | Build/test health | **PARTIAL** | Typecheck passes; lint has 0 errors/9 warnings; aggregate tests currently fail on developer logo status; build only certified at older RC2 commit |
| 30 | Deployment readiness | **BLOCKED BY BUSINESS DECISION** | Linked Vercel project and production host exist, but Feature Freeze and missing CI/re-certification of current HEAD block further production release work. Website deployment does not require Windows 01 |

## Existing website completion

Scoring is deliberately mechanical:

- `COMPLETE` = 1
- `PARTIAL` = 0.5
- all blocked/not-built/not-required statuses = 0

Result: **13 COMPLETE + 13 PARTIAL = 19.5 / 30 = 65%**.

This is capability completion, not production readiness. It does not credit planned work,
Windows runtime components, live-source collection, or Content Factory documents.

## Boundary conclusion

The existing website is a substantial Alpha RC frontend/application, not a shell waiting for
Windows 01. Frontend stabilization, test repair, accessibility, SEO, responsive QA, static
content structure, and mock/local route verification can proceed on the Mac mini after a
separate code-change authorization. Windows 01 is required only for the future isolated
Content Factory runtime and approved live collection flow.
