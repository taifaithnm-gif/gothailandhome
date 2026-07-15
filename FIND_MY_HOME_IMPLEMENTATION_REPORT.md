# FIND_MY_HOME_IMPLEMENTATION_REPORT

## Route

`/[lang]/find-my-home`

## Required fields captured

buy_or_rent · property_type · preferred_areas · preferred_projects · BTS/MRT preference · budget_min/max · bedrooms · bathrooms · move_in_date · furnished · pet_friendly · nationality · preferred_language · name · phone · LINE · WhatsApp · email · consent · notes

## Behavior

- Server action `submitFindMyHomeLead`
- Creates private `marketplace_leads` row with `lead_type=find_home`
- Payload marked `private: true`, `publish: false`
- Not exposed as a public listing

## Files

- `src/app/[lang]/find-my-home/page.tsx`
- `src/components/marketplace/find-my-home-form.tsx`
- `src/app/[lang]/marketplace/actions.ts`
