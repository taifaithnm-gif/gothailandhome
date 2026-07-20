# G-ANALYTICS — Conversion Definitions

**Gate:** G-ANALYTICS  
**Document ID:** GAN-CONV-V1  
**Status:** APPROVED  
**Approval date:** 2026-07-20

## 1. Primary conversion

**Lead intent confirmed:** visitor successfully submits an approved marketplace or project lead form and the app records a confirmed success outcome (redirect to success or `state.ok === true`).

Counted events: `lead_intent_submit` and (for project form only) `generate_lead`.

## 2. Secondary conversions / engagement

| Signal | Event |
| --- | --- |
| Save listing | `favorite_toggle` with `action=add` |
| Compare listing | `compare_toggle` with `action=add` |
| Apply filters | `listing_filter_apply` |

These are **not** primary conversions for Phase 1 KPIs.

## 3. Non-conversions

- Form open / focus
- Validation failure
- Consent denial
- Duplicate submit blocked by pending state

## 4. Approval

**APPROVED** under decision **GAN-D-004**.
