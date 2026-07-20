# G-ANALYTICS — Naming Convention

**Gate:** G-ANALYTICS  
**Document ID:** GAN-NAMING-V1  
**Status:** APPROVED  
**Approval date:** 2026-07-20

## 1. Event names

- `snake_case`
- Verb or noun phrase describing user outcome
- No vendor-prefixed names in the app taxonomy (`ga_`, `fb_` forbidden in app layer)

## 2. Property keys

- `snake_case`
- Prefer stable IDs: `property_slug`, `project_slug`, `lead_type`, `locale`, `path`
- Boolean-like actions use `action` enum strings

## 3. Lead types (approved enum)

`find_my_home` | `list_property` | `viewing` | `project` | `developer_partner` | `agency_partner` | `platform_support` | `contact`

## 4. Approval

**APPROVED** under decision **GAN-D-003**.
