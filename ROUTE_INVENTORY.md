# Route Inventory

**Date:** 2026-07-15  
**Server inspected:** `http://127.0.0.1:3456` (production `next start`)  
**Commit:** `8cd3595`

Status legend: **Live** = responds 200; **Broken** = 5xx on real data; **Filter** = not a dedicated IA route; **Missing** = product concept without page; **Internal** = auth/admin.

| Route | Purpose | Status | Data source | Mobile | SEO | Contact behavior | Major defect | Priority |
|-------|---------|--------|-------------|--------|-----|------------------|--------------|----------|
| `/[lang]` | Home discovery | Live | Supabase properties/projects/devs/cities + dict | OK hamburger | title/canonical/OG OK; no JSON-LD | CTA to Contact; no Apple-as-owner | Dense sections; placeholder project blurbs; nav overload | P1 |
| `/[lang]/properties` | Listing index (“Listings”) | Live | `properties` | Usable but heavy | meta OK; canonical ignores filters | N/A list | **~4.7MB HTML**, slow LCP | P0 |
| `/[lang]/properties/[id]` | Listing detail | Live | property + agents | Sidebar stacks | meta OK; no JSON-LD | Listing contact preferred; Apple only as platform CS escalation | Missing agent on most rows; no real images sampled | P0 |
| `/[lang]/search` | Search/results | Live | properties + filters | Heavy | meta OK | N/A | Duplicate of properties weight; overlaps IA | P0 |
| Buy (`?listingType=sale`) | Buy journey | **Filter** | properties | Same as index | Filter not in canonical | N/A | No dedicated Buy route/label in nav | P1 |
| Rent (`?listingType=rent`) | Rent journey | **Filter** | properties | Same | Same | N/A | No dedicated Rent route | P1 |
| `/[lang]/projects` | Project directory | Live | `property_projects` | OK | meta OK | N/A | Cards link into many 500 detail pages | P0 |
| `/[lang]/projects/[slug]` | Project detail | **Broken** for 33/50 | project content + DB | N/A when 500 | metadata aborts on crash | Project lead form on healthy pages | POI `name.en` TypeError → 500 | P0 |
| `/[lang]/developers` | Developer directory | Live | developers table (+ content profiles) | OK | meta OK | N/A | Lists 23 DB names incl. stubs vs 20 master | P2 |
| `/[lang]/developers/[slug]` | Developer detail | Live (20 content) | developer manifests | OK | meta OK | N/A | Stub developers thinner | P2 |
| `/[lang]/cities` | Cities hub | Live | cities | OK | meta OK | N/A | Text-card heavy | P2 |
| `/[lang]/cities/[slug]` | City market | Live | cities + properties | Heavy on Bangkok | meta OK | N/A | Can dump large listing sets | P0 |
| `/[lang]/districts/[slug]` | District detail | Live | districts + props | Variable | meta OK | N/A | No district index route | P2 |
| Knowledge / articles | Editorial hub | **Missing** | `content/glossary` unused in app routes | — | — | — | Glossary content unused by frontend | P2 |
| `/[lang]/contact` | Help / platform CS | Live | `config/contacts.json` | OK | meta OK | Apple+ICE as platform CS only | Correct role; no listing-owner claim | P1 polish |
| `/[lang]/find-my-home` | Buyer/tenant demand lead | Live | writes `marketplace_leads` | Form stacks well | meta OK; not in sitemap | Platform intake | Long form; success UX basic | P1 |
| `/[lang]/list-your-property` | Owner submission | Live | marketplace leads pending review | OK | not in sitemap | Owner contact fields | Review gate OK; sparse UX | P1 |
| `/[lang]/partners/developers` | Developer partnership | Live | marketplace leads | OK | not in sitemap | Representative contact | Pending-only OK | P1 |
| `/[lang]/partners/agencies` | Agency partnership | Live | marketplace leads | OK | not in sitemap | Agency contact | Footer-linked; weak header discoverability | P1 |
| `/[lang]/about` | About | Live | i18n | OK | meta OK | N/A | Thin content | P2 |
| `/admin` | Admin dashboard | Internal | Supabase auth | Basic | should be noindex | Admin only | robots allow-all; title generic | P1 |
| `/admin/login` | Admin auth | Internal | Supabase auth | OK | weak meta | — | Same | P1 |
| `/admin/properties/new` | Create listing | Internal | admin | — | — | — | Not audited depth (auth) | P2 |
| `/admin/properties/[id]/edit` | Edit listing | Internal | admin | — | — | — | Not audited depth | P2 |
| `/auth/callback` | OAuth/code exchange | Internal | Supabase | — | — | — | Operational only | P3 |
| `/robots.txt` | Crawl rules | Live | `src/app/robots.ts` | — | Allow all | — | No `/admin` disallow | P1 |
| `/sitemap.xml` | Sitemap | Live | dynamic lists | — | Large | — | Missing marketplace routes | P1 |
| `/_not-found` | 404 | Live | Next default | — | weak branded empty | — | No custom locale empty design | P2 |
| Loading states | Route pending UI | **Missing** | — | — | — | — | No `loading.tsx` | P1 |
| Error boundaries | Route error UI | **Missing** | — | — | — | — | Project 500 shows generic Next error | P0 |

## Home nav links (observed)

Home, Properties, Projects, Cities, Developers, Find My Home, List Property, Search, About, Contact (+ language).

## Footer extras

Partners (developer intake), Agency Partnership, Contact — not all mirrored in header.
