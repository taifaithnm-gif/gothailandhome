# G-LEGAL — Evidence Requirements

**Gate:** G-LEGAL  
**Document ID:** GLEG-EVID-V1  
**Status:** APPROVED  
**Approval date:** 2026-07-20

## 1. Purpose

Minimum evidence for legal guide copy.

## 2. Required document fields

| Field | Rule |
| --- | --- |
| `slug` | Unique; URL-safe |
| `type` | `legal_guide` |
| `status` | `approved` for routability |
| `version` | Semver; visible (e.g., `LEG-GUIDE-1.0.0`) |
| `owner` | `Qualified Legal Reviewer` |
| `jurisdiction` | Localized jurisdiction label |
| `reviewed_at` | ISO date; max age **90 days** |
| `disclaimer` | Localized; matches Required Disclaimers |
| `title`, `summary`, `body` | Complete `en` / `zh` / `th` |
| `sources` | At least one `government` citation |
| `locale_status` | All `complete` |

## 3. Byte/version identifiability

P1-26 must render `version` visibly so reviewers can confirm exact approved copy.

## 4. P1-28 failures

Fail with file/field when:

- Missing disclaimer or jurisdiction
- Missing version or owner
- Forbidden advice tokens present
- No government source
- Stale `reviewed_at` (> 90 days)
- Incomplete locales

## 5. Approval

**APPROVED** under decision **GLEG-D-006**.
