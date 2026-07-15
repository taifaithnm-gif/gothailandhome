# CONTACT_COMPONENT_REPORT

**Date:** 2026-07-15  
**Milestone:** Phase 8 — Alpha UI Foundation

## Components

| Component | File | Role |
|-----------|------|------|
| `ListingContact` | `contact-blocks.tsx` | DB agent only; missing-contact copy when absent |
| `PlatformCustomerSuccess` | `contact-blocks.tsx` | Loads **only** `platform_customer_success` contacts (Apple + Khun ICE) |
| `AiConcierge` | `contact-blocks.tsx` | Assistive copy; explicitly **not** a listing agent |
| `ListingContactCard` | `listing-contact-card.tsx` | Composes the three + viewing form |

## Apple rule

- Apple appears **only** inside `PlatformCustomerSuccess`
- `ListingContact` does not call `getPlatformCustomerSuccessContacts`
- AI Concierge note states it is not a listing agent and does not replace CS or verified listing contact
- Invariant tests extended (`npm run test:contact-roles`)

## Runtime smoke

Listing detail HTML includes:

- `data-slot="listing-contact"`
- `data-slot="platform-customer-success"`
- `data-slot="ai-concierge"`
