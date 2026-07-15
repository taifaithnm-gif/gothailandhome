# PARTNERSHIP_INTAKE_REPORT

## Routes

- Developer: `/[lang]/partners/developers`
- Agency: `/[lang]/partners/agencies`

## Developer fields

company · official website · representative · role · projects · cooperation interest · contact details · consent

## Agency fields

agency name · license/registration · representative · service areas · listing volume · languages · contact details · consent

## Behavior

- Lead types: `developer_partnership` / `agency_partnership`
- Status starts `new`
- Payload flags `pending_platform_review: true`
- No auto-activation

## Files

- `src/components/marketplace/developer-partnership-form.tsx`
- `src/components/marketplace/agency-partnership-form.tsx`
- partner pages under `src/app/[lang]/partners/`
