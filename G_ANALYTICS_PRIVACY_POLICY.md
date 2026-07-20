# G-ANALYTICS — Privacy Policy (Measurement)

**Gate:** G-ANALYTICS  
**Document ID:** GAN-PRIVACY-V1  
**Status:** APPROVED  
**Approval date:** 2026-07-20

## 1. Purpose

Privacy rules for frontend measurement events.

## 2. PII prohibition

Events **must not** include:

- Name, email, phone, LINE, WhatsApp, postal address
- Free-text messages or notes
- Exact budget figures entered by users
- Authentication tokens or cookies as payload fields

## 3. Allowed identifiers

- Public slugs (`property_slug`, `project_slug`)
- Locale codes
- Pathnames without query PII
- Enumerated lead types and filter **keys** (not keyword values)

## 4. Retention

| Layer | Retention |
| --- | --- |
| Local consent preference | Until user changes or clears site data (localStorage key `gth_analytics_consent`) |
| Provider-side | Per provider DPA; Phase 1 default target ≤ 14 months for GA4 if enabled |

## 5. User control

- Deny consent → no measurement scripts, no event network calls
- Withdraw → clear consent to denied and stop adapter

## 6. Approval

**APPROVED** under decision **GAN-D-006**.
