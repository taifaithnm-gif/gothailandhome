# MVP Acceptance Report

**Target:** https://gothailandhome.com (live redirects to https://www.gothailandhome.com)  
**Repository:** local `main` @ `12af270`  
**Date:** 2026-07-14

## Final status

**PASS**

## Defects found and fixed

| Defect                                                                          | Evidence                                                     | Fix                                                      | Status                            |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------- | --------------------------------- |
| Duplicate document titles (`… \| GoThailandHome \| GoThailandHome`)             | Live `/en` title before fix                                  | Use absolute titles in `buildPageMetadata`               | Fixed in `12af270`, verified live |
| Canonical / OG / sitemap / robots used apex host while production prefers `www` | Apex → `www` 308; metadata used `https://gothailandhome.com` | Set `siteConfig.url` to `https://www.gothailandhome.com` | Fixed in `12af270`, verified live |
| `npm run format:check` failed (13 files)                                        | Local Prettier exit 1                                        | `prettier --write`                                       | Fixed in `12af270`                |

## Route audit

| Route                                    | HTTP        | Result |
| ---------------------------------------- | ----------- | ------ |
| `/en`                                    | 200         | PASS   |
| `/zh`                                    | 200         | PASS   |
| `/th`                                    | 200         | PASS   |
| `/en/properties`                         | 200         | PASS   |
| `/zh/properties`                         | 200         | PASS   |
| `/th/properties`                         | 200         | PASS   |
| `/en/properties/bangkok-riverside-condo` | 200         | PASS   |
| `/zh/properties/bangkok-riverside-condo` | 200         | PASS   |
| `/th/properties/bangkok-riverside-condo` | 200         | PASS   |
| `/en/search`                             | 200         | PASS   |
| `/zh/search`                             | 200         | PASS   |
| `/th/search`                             | 200         | PASS   |
| `/en/about`                              | 200         | PASS   |
| `/zh/about`                              | 200         | PASS   |
| `/th/about`                              | 200         | PASS   |
| `/en/contact`                            | 200         | PASS   |
| `/zh/contact`                            | 200         | PASS   |
| `/th/contact`                            | 200         | PASS   |
| unknown locale path (`/en/missing-xyz`)  | 404         | PASS   |
| `/`                                      | 307 → `/en` | PASS   |
| apex → www                               | 308         | PASS   |

## Verification matrix

| Check                  | Result | Notes                                                                                          |
| ---------------------- | ------ | ---------------------------------------------------------------------------------------------- |
| Locale routing         | PASS   | EN / 中文 / ไทย content confirmed on `/en`, `/zh`, `/th`                                       |
| Navigation links       | PASS   | Header + footer links to home/properties/search/about/contact; locale switcher present         |
| Mobile responsiveness  | PASS   | 390×844 viewport shows Menu control; expanded mobile nav includes all primary + language links |
| `sitemap.xml`          | PASS   | 200; URLs use `https://www.gothailandhome.com/...` after fix                                   |
| `robots.txt`           | PASS   | Allow `/`; Host + Sitemap point to www                                                         |
| Metadata               | PASS   | Title/description present; no duplicated brand suffix after fix                                |
| Open Graph             | PASS   | `og:title`, `og:description`, `og:url`, `og:site_name`, `og:locale` present                    |
| Canonical URLs         | PASS   | Canonical + hreflang use www host after fix                                                    |
| Broken assets          | PASS   | Sampled `/_next` CSS/JS/font assets returned 200; no broken images                             |
| Console errors         | PASS   | No Next.js error overlay; no hydration failure text observed                                   |
| Hydration errors       | PASS   | Only `suppressHydrationWarning` attribute present; no hydration mismatch                       |
| `npm run build`        | PASS   | Exit 0                                                                                         |
| `npm run lint`         | PASS   | Exit 0                                                                                         |
| `npm run format:check` | PASS   | Exit 0 after fix                                                                               |

## Git

- Commit: `12af270` — Fix MVP acceptance defects for SEO and formatting.
- Pushed to `origin/main`
- Working tree clean after push

## Out of scope (intentionally not built)

CMS, database, maps, login, AI — none present; no change made.
