# PUBLIC_ALPHA_CHECKLIST

**Date:** 2026-07-16  
**Decision:** **PASS WITH ACTIONS**  
**Rule:** Check items before announcing Public Alpha / paid traffic. Do not invent content to close boxes.

## Must-do before broad Public Alpha (P1)

- [ ] **GA4** — create property, set Measurement ID, wire gtag (or GTM), verify realtime
- [ ] **Google Search Console** — verify `www.gothailandhome.com`, submit `/sitemap.xml`, confirm coverage
- [ ] **Bing Webmaster** — verify site + import sitemap (or GSC sync)
- [ ] **IndexNow** — generate key, publish `.well-known` key file, ping on publish/update
- [ ] **Sitemap pagination** — cover all published listing URLs per locale (R1)
- [ ] **Fresh Lighthouse** — home / properties / project; record dated scores
- [ ] **Marketplace leads RLS** — re-verify `marketplace_leads` + consent logging (R3)
- [ ] **Content honesty banner/ops note** — projects/media still incomplete; do not overclaim inventory depth
- [ ] **+3 Livin DB drift rows** — explicit keep/package/unpublish decision (R4)
- [ ] **Seed developer quarantine** — align DB with 20-master (R5)

## Already acceptable for soft Alpha

- [x] Public routes build and render (RC2 matrix)
- [x] robots.txt allow public / disallow admin
- [x] JSON-LD on home, listings, project, developer, district
- [x] Default OG image + canonical absolute URLs
- [x] Verified-only listing filter for public catalog
- [x] Lead forms (Find My Home, List Property, Viewing, Partnerships)
- [x] Developer logos official-cached (20/20)
- [x] District overview + map for 50/50 Bangkok districts
- [x] Contact role invariants (Apple = Platform CS)

## Explicitly out of Public Alpha

- [ ] CRM automation
- [ ] Auth expansion
- [ ] Multi-city mass import
- [ ] Licensed mass hero/gallery binary scrape without permission
