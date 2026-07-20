# G-CONTENT-PUBLIC — Inventory Status Vocabulary

**Gate:** G-CONTENT-PUBLIC  
**Document ID:** GCP-STATUS-V1  
**Status:** APPROVED  
**Approval date:** 2026-07-20

## 1. Purpose

Defines the only status values for Phase 1 public static content and which statuses may be routed to public visitors.

## 2. Vocabulary

| Status | Meaning | Publicly routable? | Indexable? |
| --- | --- | --- | --- |
| `draft` | Work in progress; incomplete review | **No** | No |
| `in_review` | Submitted for human editorial review | **No** | No |
| `approved` | Human-approved for public use; inventory membership required | **Yes** (if inventory + visibility rules pass) | Yes (unless visibility says noindex) |
| `archived` | Formerly public; retained for audit | **No** (404 or redirect only by explicit Owner decision) | No |
| `rejected` | Failed review; must not route | **No** | No |

## 3. Compatibility with existing article fields

Legacy Phase 12 article JSON may use `publish_ready: true|false`. Mapping for P1-22:

| Legacy | Maps to |
| --- | --- |
| `publish_ready: false` | `draft` (not routable) |
| `publish_ready: true` **and** slug listed as **Approved** in Article Inventory **and** editorial checks pass | `approved` |
| `publish_ready: true` but **not** inventory-approved | Treat as `in_review` / not routable |

P1-22 should prefer an explicit `status` field going forward. Until migrated, mapping above is binding and fail-closed.

## 4. Routability conjunction

A document is publicly routable **only if all** are true:

1. `status` resolves to `approved` (after mapping)
2. Slug appears in the type’s approved inventory with disposition **Approved**
3. Visibility Rules pass (locale, citations, review freshness)
4. For `investment_guide` / `legal_guide`: the corresponding G-INVESTMENT / G-LEGAL gate is CLEARED and the guide version is approved

Otherwise: **do not render** (404 for unknown/draft/rejected; never soft-publish).

## 5. Locale completeness statuses

`locale_status` per locale uses:

| Value | Meaning |
| --- | --- |
| `complete` | Required fields present for that locale |
| `partial` | Some required fields missing |
| `missing` | Locale not provided |

Interaction with fallback: see `G_CONTENT_PUBLIC_LOCALE_FALLBACK_POLICY.md`.

## 6. Approval

**APPROVED** under decision **GCP-D-002**.
