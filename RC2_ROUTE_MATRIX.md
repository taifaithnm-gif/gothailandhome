# RC2_ROUTE_MATRIX

**Date:** 2026-07-16  
**Server:** `http://127.0.0.1:3040`  
**HEAD:** `e3a5a9a`

Status: **Live** = non-5xx as specified · **Redirect** = intentional · **Internal** = admin/auth

| Route | Purpose | Status | SEO notes | Contact |
|-------|---------|--------|-----------|---------|
| `/[lang]` | Homepage | Live 200 EN/ZH/TH | Title/canonical/OG; JSON-LD Org+WebSite | Platform CS; not listing agent |
| `/[lang]/properties` | Search results (canonical) | Live 200 | CollectionPage JSON-LD; filter canonical = base | N/A |
| `/[lang]/search` | Bookmark helper | Redirect 307 → `/properties?sort=newest_verified` | noindex metadata; removed from sitemap | N/A |
| `/[lang]/buy` | Buy landing | Live 200 | Meta OK | Trust: not listing agent |
| `/[lang]/rent` | Rent landing | Live 200 | Meta OK | Same |
| `/[lang]/properties/[id]` | Listing detail | Live (sample + extras) | RealEstateListing + BreadcrumbList; OG cover when present | Listing first; Platform CS escalation |
| `/[lang]/projects` | Project index | Live | Meta OK | N/A |
| `/[lang]/projects/[slug]` | Project detail | **50/50 Live** | ApartmentComplex + FAQ when present | Project lead + Platform CS |
| `/[lang]/developers` | Developer index | Live | Meta OK | N/A |
| `/[lang]/developers/[slug]` | Developer detail | **20/20 Live** (packaged) | Organization JSON-LD | Partnership CTA; not sales staff |
| `/[lang]/cities` | Cities hub | Live | Meta OK | N/A |
| `/[lang]/cities/[slug]` | City | Live (sample) | Meta OK | N/A |
| `/[lang]/districts/[slug]` | District Center | Live (sample EN/TH) | AdministrativeArea JSON-LD | Find My Home + Platform CS |
| `/[lang]/marketplace` | Marketplace hub | Live | Meta OK | Role paths |
| `/[lang]/find-my-home` | Demand lead | Live | In sitemap | Private demand |
| `/[lang]/list-your-property` | Owner intake | Live | In sitemap | Pending review |
| `/[lang]/partners/developers` | Developer partnership | Live | In sitemap | Pending |
| `/[lang]/partners/agencies` | Agency partnership | Live | In sitemap | Pending |
| `/[lang]/contact` | Platform CS | Live | Meta OK | Apple/ICE = Platform CS |
| `/[lang]/knowledge*` | Knowledge | Live | Meta OK | N/A |
| `/[lang]/leads/success` | Lead receipt | Live | **noindex** | No CRM email claim |
| `/[lang]/leads/error` | Lead error | Live | **noindex** | Same |
| `/[lang]/about` | About | Live | Meta OK | N/A |
| `/admin*` | Admin | Internal | robots Disallow + noindex | Auth |
| `/robots.txt` | Crawl rules | Live | Disallow `/admin` | — |
| `/sitemap.xml` | Sitemap | Live | Listing URLs capped ~1000/locale | — |
| Unknown `/[lang]/…` | 404 | 404 + noindex | Sample `/en/missing-xyz-rc2` | — |

## Route gate summary

| Gate | Result |
|------|--------|
| Project packages | 50/50 OK |
| Developer packages | 20/20 OK |
| Critical marketplace forms | Live |
| Search canonicalization | Redirect to Properties |
