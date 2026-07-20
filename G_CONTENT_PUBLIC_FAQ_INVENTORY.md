# G-CONTENT-PUBLIC — FAQ Inventory

**Gate:** G-CONTENT-PUBLIC  
**Document ID:** GCP-INV-FAQ-V1  
**Status:** APPROVED  
**Approval date:** 2026-07-20  
**Updated at:** 2026-07-20

## 1. Purpose

Authoritative list of platform/process FAQ entries for the Phase 1 FAQ hub (P1-27).

## 2. Categories (approved)

| Category id | Label (EN) | Allowed answer scope |
| --- | --- | --- |
| `platform` | Platform & marketplace | How GoThailandHome works; not a listing agent |
| `process` | Buying / renting process | High-level process; no personalized advice |
| `listings` | Listings & verification | Verification, freshness, sources at product level |
| `contact` | Contact & roles | Listing contact vs Platform Customer Success |
| `guides` | Guides | Pointers to knowledge / investment / legal surfaces |

## 3. Approved entries (Phase 1 starter set)

Exact question/answer copy for implementation must live in `content/faq/` (created at P1-27) and match this inventory. Answers below are **approved** for public use.

| id | category | Question (EN) | Answer summary (EN) | source_class | Disposition |
| --- | --- | --- | --- | --- | --- |
| `faq-what-is-gth` | platform | What is GoThailandHome? | A Thailand property discovery marketplace that indexes verified public listings. It is not the listing agent. | platform_process | **Approved** |
| `faq-not-listing-agent` | platform | Is GoThailandHome the listing agent? | No. Listing contacts appear on each property when available. Platform Customer Success helps with escalation only. | platform_process | **Approved** |
| `faq-find-my-home` | process | How do I request help finding a home? | Use Find My Home from the Marketplace hub. Your request stays private and is not published as a listing. | platform_process | **Approved** |
| `faq-list-property` | process | How do I list a property? | Submit List Your Property from the Marketplace hub. Submissions enter review and are not auto-published. | platform_process | **Approved** |
| `faq-viewing` | listings | How do I request a viewing? | Open a verified listing and use the viewing request form. Listing contact is used first when available. | platform_process | **Approved** |
| `faq-verification` | listings | What does “verified” mean? | Verified listings carry source identity and provenance checks from the platform import pipeline. Prices can change; freshness is shown on the listing. | platform_process | **Approved** |
| `faq-languages` | platform | Which languages are supported? | The website is available in English, Chinese, and Thai. | platform_process | **Approved** |
| `faq-investment-questions` | guides | Where can I read investment guidance? | Use the Investment Guide when published. FAQ answers do not provide yield, ROI, or return forecasts. | platform_process | **Approved** |
| `faq-legal-questions` | guides | Where can I read legal / foreign-ownership information? | Use the Legal Guide when published. FAQ answers do not provide personalized legal advice. | platform_process | **Approved** |
| `faq-contact-pcs` | contact | How do I contact Platform Customer Success? | Use the Contact page. Platform support is separate from listing ownership. | platform_process | **Approved** |

ZH/TH question and answer strings must be complete before P1-27 routes go live (Locale Fallback Policy — FAQ requires all three locales). Engineering may store localized strings in FAQ content files; this inventory freezes ids, categories, and EN meaning.

## 4. Explicit prohibitions

- No FAQ answer may invent yields, guaranteed returns, or personalized legal conclusions.
- Unsupported legal/investment depth must **link** to approved guides (after G-LEGAL / G-INVESTMENT), not improvise.

## 5. Schema expectation (P1-27)

Visible questions on `/[lang]/faq` must equal FAQ JSON-LD Question set. Categories and anchors required. Keyboard-accessible disclosure controls required.

## 6. Approval

**APPROVED** under decision **GCP-D-012**.
