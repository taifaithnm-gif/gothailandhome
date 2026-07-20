# G-INVESTMENT — Evidence Requirements

**Gate:** G-INVESTMENT  
**Document ID:** GINV-EVID-V1  
**Status:** APPROVED  
**Approval date:** 2026-07-20

## 1. Purpose

Minimum evidence for investment guide copy to remain verifiable and fail-closed.

## 2. Required document fields

| Field | Rule |
| --- | --- |
| `slug` | Unique within type; URL-safe |
| `type` | `investment_guide` |
| `status` | `approved` for routability |
| `version` | Semver string; visible on page (e.g., `INV-GUIDE-1.0.0`) |
| `owner` | `Qualified Investment Reviewer` |
| `reviewed_at` | ISO date; max age **90 days** before re-review |
| `disclaimer` | Localized object; matches Forecast Disclaimer |
| `forecast_disclaimer` | Localized object; same semantic content as disclaimer |
| `title`, `summary`, `body` | Complete `en` / `zh` / `th` |
| `sources` | At least one `platform_process` or `government` citation |
| `locale_status` | All `complete` |

## 3. Evidence classes

| Class | Use |
| --- | --- |
| `platform_process` | Platform role, verification, Marketplace process |
| `government` | Only when citing public regulator pages (none required in Phase 1 body beyond platform facts) |
| `editorial` | Framing paragraphs without external numeric claims |

`UNVERIFIED` facts must not render.

## 4. P1-28 failures

Fail with file/field when:

- Missing disclaimer or forecast_disclaimer
- Missing version or owner
- Forbidden claim tokens present
- `reviewed_at` older than 90 days
- Incomplete locale set
- Missing sources

## 5. Approval

**APPROVED** under decision **GINV-D-006**.
