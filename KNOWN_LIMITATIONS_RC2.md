# KNOWN_LIMITATIONS_RC2

**As of:** Platform Alpha RC2 (`platform-alpha-rc2`) — 2026-07-16  
**HEAD:** `e3a5a9a`

Supersedes operational reading of `KNOWN_LIMITATIONS.md` for RC2 decisions; historical RC1 file retained.

## Product / data

1. **Package vs UI/DB drift (+3)** — Packages = **1,315**; live published = **1,318**. Exact extras are three The Livin Ramkhamhaeng PropertyHub rents (`5329310`, `5813509`, `5886141`) with source casing `PropertyHub`, absent from packages. **Not modified in RC2.**
2. **Developer logos** — Master logos remain PLACEHOLDER / neutral marks unless OFFICIAL evidence.
3. **Factory-linked portfolios** — Platform subsets, not claimed complete official portfolios.
4. **Seed developers still published in DB** — `sathorn-living`, `andaman-homes`, `northern-estate` (homepage filters them out).
5. **Draft seed projects** — `river-horizon`, `lagoon-leaf` remain draft (+2 vs 50 packages).
6. **Marketplace** — Lead storage + success UX exist; **no CRM/email automation**.
7. **Evidence gaps** — Many fields PARTIAL / UNVERIFIED / unavailable by design.
8. **Sitemap listing coverage** — ~**1000** listing URLs per locale vs ~1318 published.
9. **Media** — Many honest “images unavailable” states; limited licence-clean heroes.
10. **Performance** — Lab LCP often multi-second; CLS historically 0 on samples; not a CWV claim.

## Representation

- Aggregator / discovery marketplace — not a brokerage.  
- Apple = **Platform Customer Success only**.  
- No official developer representation without verified partnership.

## Localization

- EN / ZH / TH routes ship.  
- Root `<html lang>` still defaults to `en` (wrapper + client patch mitigate).  
- Some listing copy remains source-language-heavy.

## Environment

- RC2 acceptance ran against **local** `next start`, not live CDN deploy certification.
