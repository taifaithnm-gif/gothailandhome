# G-ANALYTICS — Event Taxonomy

**Gate:** G-ANALYTICS  
**Document ID:** GAN-TAXONOMY-V1  
**Status:** APPROVED  
**Approval date:** 2026-07-20

## 1. Approved events (Phase 1)

| Event name | Category | When to fire | Required properties (non-PII) |
| --- | --- | --- | --- |
| `page_view` | discovery | After consent, once per route mount | `locale`, `path` |
| `listing_filter_apply` | discovery | User submits/applies listing filters | `locale`, `filter_keys` (sorted keys only) |
| `favorite_toggle` | engagement | Favorites add/remove succeeds locally | `locale`, `property_slug`, `action` (`add`\|`remove`) |
| `compare_toggle` | engagement | Compare add/remove succeeds locally | `locale`, `property_slug`, `action` (`add`\|`remove`) |
| `lead_intent_submit` | conversion | Form outcome confirmed success | `locale`, `lead_type`, `surface` |
| `generate_lead` | conversion | Alias for project lead success only | `locale`, `project_slug`, `surface=project` |

## 2. Explicitly not approved

- Search keyword free text
- Name, email, phone, LINE, WhatsApp, message body
- Raw price/budget values as event properties
- IP, device fingerprint custom properties
- Auto-fire on form focus or incomplete submit

## 3. Deduplication

- Same event + same property fingerprint within 2 seconds → drop
- Conversion events fire only after confirmed success outcome

## 4. Approval

**APPROVED** under decision **GAN-D-002**.
