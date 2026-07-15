# CONTACT_ARCHITECTURE_IMPLEMENTATION_REPORT

## Roles implemented

| Role | Meaning |
|------|---------|
| `listing_contact` | Real listing agent/owner contact |
| `project_contact` | Project-desk contact |
| `developer_contact` | Developer sales contact |
| `agency_contact` | Agency desk contact |
| `platform_customer_success` | Platform help / escalation only |

## Apple invariant

- Config id `apple` → `contact_role: platform_customer_success`
- Display role: Platform Customer Success (not property consultant)
- Invariant script: `npm run test:contact-roles`
- `getPrimaryContact()` deprecated alias that returns platform support only
- Listing pages never use Apple as silent listing-owner fallback

## Surfaces

| Surface | Behavior |
|---------|----------|
| Property detail | Prefers DB `agents` row when `agent_id` present; otherwise states contact missing |
| Property detail | Platform Customer Success shown separately as help/escalation |
| `/contact` | Platform support form + platform CS contacts only |

## Files

- `config/contacts.json`
- `src/lib/config/contacts.ts`
- `src/components/property/listing-contact-card.tsx`
- `src/app/[lang]/contact/page.tsx`
- `scripts/test-contact-role-invariants.mjs`
