# P2-053 — Geo SEO deep-link plan

- `/{lang}/map` — map hub (flag-gated)
- `/{lang}/map/districts/{slug}` — text-first district deep link
- Sitemap includes hub + district map URLs only when `FEATURE_P2_MAP` is on
- Canonicals via `buildPageMetadata`; hreflang preserved by localePath helpers
