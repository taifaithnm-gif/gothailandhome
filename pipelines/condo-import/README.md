# Condo import pipeline

Reusable workflow for importing a real condominium project into GoThailandHome / Supabase.

## Folder layout

```text
content/projects/<project-slug>/
  manifest.json   # developer + project profile + SEO (EN/ZH/TH)
  listings.json   # real sale/rent listings with provenance
pipelines/condo-import/
  import.mjs      # upserts manifest + listings into live schema
  README.md       # this file
```

## Allowed sources only

1. Official developer / project website
2. Official Facebook page
3. Google Maps
4. Public property portals
5. Public listing websites

Do **not** fabricate prices, availability, distances, or coordinates.

## Workflow (same for every future condo)

1. Create `content/projects/<slug>/`.
2. Fill `manifest.json` from allowed sources (include a `sources` array on every factual block).
3. Collect real sale + rent listings into `listings.json`.
   - Required per listing: `source`, `listing_url`, `source_updated_at`
   - If the portal shows no update date, set `source_updated_at` to the capture date and set `source_update_note`.
4. Dry-run:
   ```bash
   node pipelines/condo-import/import.mjs content/projects/<slug> --dry-run
   ```
5. Apply schema (once per environment):
   ```bash
   NODE_TLS_REJECT_UNAUTHORIZED=0 node scripts/apply-supabase-sql.mjs --migration-only 20260714183000_project_content_system.sql
   ```
6. Import:
   ```bash
   npm run content:import -- content/projects/<slug>
   ```
7. Verify public landing `/[lang]/projects/<slug>` and linked unit listings.

## Manifest contract

Top-level keys:

- `slug`
- `developer`
- `location`
- `project` (profile, specs, unit_types, facilities, transportation, nearby_*, faq, seo, coordinates)
- `ads` (Meta/Google placeholder config)

Localized fields use `en` / `zh` / `th`.

## Listing contract

Each listing object must include:

| Field               | Purpose                                 |
| ------------------- | --------------------------------------- |
| `listing_type`      | `sale` or `rent`                        |
| `price_thb`         | Exact portal price (no invented values) |
| `source`            | Portal / site name                      |
| `listing_url`       | Canonical public URL                    |
| `source_updated_at` | ISO date from portal or capture date    |
| `external_ref`      | Stable portal id / ref for upserts      |

## Notes

- Upserts use `developers.slug`, `property_projects.slug`, and `properties.external_ref` / `listing_url`.
- Enquiry conversion placeholders store UTM / `gclid` / `fbclid` on `inquiries`.
