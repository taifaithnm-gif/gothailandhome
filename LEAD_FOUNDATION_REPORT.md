# LEAD_FOUNDATION_REPORT

## Migration

`supabase/migrations/20260715120000_marketplace_foundation_m1.sql`

Applied via `npm run db:migrate:phase8-m1`.

## Tables

- `marketplace_leads`
- `marketplace_lead_activities`

## Lead types

find_home · list_property · viewing_request · developer_partnership · agency_partnership · platform_support

## Lifecycle statuses

new · qualified · assigned · contacted · viewing_scheduled · negotiating · won · lost · spam · archived

## Recorded fields

source · status · assigned_to · created_at · updated_at · consent / consent_at · activity history

## Notes

- Existing `inquiries` table left intact for legacy project lead form
- No billing / automatic lead resale
- Anon may INSERT consented leads only; no public SELECT of demand
