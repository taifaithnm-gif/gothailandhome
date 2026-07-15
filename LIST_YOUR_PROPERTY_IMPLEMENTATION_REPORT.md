# LIST_YOUR_PROPERTY_IMPLEMENTATION_REPORT

## Route

`/[lang]/list-your-property`

## Required fields captured

owner_or_authorized_agent · project · property_type · sale_or_rent · price · bedrooms · bathrooms · area · floor · furnishing · availability · contact details · ownership/authorization · consent · notes

## Behavior

- Server action `submitListYourPropertyLead`
- Creates `marketplace_leads` with `lead_type=list_property`
- Forced `review_status=pending_review` (app + DB before-insert trigger)
- `auto_publish=false` in payload
- Does **not** insert into `properties` / listing packages

## Files

- `src/app/[lang]/list-your-property/page.tsx`
- `src/components/marketplace/list-your-property-form.tsx`
