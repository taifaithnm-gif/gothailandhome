# G-LEGAL — Source Attribution Policy

**Gate:** G-LEGAL  
**Document ID:** GLEG-ATTR-V1  
**Status:** APPROVED  
**Approval date:** 2026-07-20

## 1. Purpose

Source attribution rules for legal guide citations (stricter than general G-CONTENT-PUBLIC rules).

## 2. Allowed source types

| type | Use |
| --- | --- |
| `government` | Thai government, regulator, Land Department, BOI public pages |
| `platform_process` | Platform role boundaries only |

`editorial` may frame but not assert legal facts without `government` citation.

## 3. Required citation fields

| Field | Required |
| --- | --- |
| `type` | Yes |
| `name` | Yes — human-readable source title |
| `url` | Yes — HTTPS public URL |
| `verified_at` | Yes — ISO date |
| `note` | Optional — scope of what was verified |

## 4. Rules

- Every factual legal statement in body must have at least one visible `government` citation in the sources list.
- Citations must be visible on the page (same pattern as knowledge articles).
- Broken or placeholder URLs fail P1-28.

## 5. Approval

**APPROVED** under decision **GLEG-D-005**.
