# G-CONTENT-PUBLIC — Locale Fallback Policy

**Gate:** G-CONTENT-PUBLIC  
**Document ID:** GCP-LOCALE-V1  
**Status:** APPROVED  
**Approval date:** 2026-07-20

## 1. Purpose

Defines how EN / ZH / TH are selected and when fallback must be disclosed. Silent fallback that implies a missing translation is native is **prohibited** for public static content.

## 2. Supported locales

Phase 1 public static content supports exactly: `en`, `zh`, `th` (site locales).

## 3. Completeness requirement for new approvals

For a document to enter inventory disposition **Approved**:

| Type | Minimum locale rule |
| --- | --- |
| `knowledge_article` | `locale_status` = `complete` for **en, zh, and th** for title, summary, and body |
| `blog_post` | `complete` for **en**; zh/th may be `partial` only if disclosure policy (§5) applies |
| `faq_entry` | `complete` for **en, zh, and th** for question and answer |
| `investment_guide` / `legal_guide` | Per G-INVESTMENT / G-LEGAL (default: all three complete) |

## 4. Runtime selection order

When rendering locale `L`:

1. Use locale `L` content if `locale_status[L] === complete`.
2. Else if policy allows fallback for that type (§5): use **en** if `complete`, else do not invent text.
3. Never invent, machine-fill, or copy incomplete strings silently into another locale at render time.

Forbidden silent chains (e.g. locale → en → zh → th without disclosure) for public static pages.

## 5. Disclosure (binding)

If the visitor’s locale is not `complete` and English is shown instead:

- Show a visible notice in the visitor’s UI language (dictionary keys), e.g.:
  - EN: “This article is shown in English. A full translation for this language is not yet available.”
  - ZH: “本文以英文显示。该语言的完整译文尚未提供。”
  - TH: “บทความนี้แสดงเป็นภาษาอังกฤษ ยังไม่มีคำแปลฉบับสมบูรณ์สำหรับภาษานี้”
- Mark the page with `data-locale-fallback="en"` for tests.
- Metadata `title`/`description` should prefer complete locale strings; if falling back, do not claim the translation is native.

If neither visitor locale nor English is `complete` → **do not route** (404). Fail closed.

## 6. Knowledge articles (Phase 1 pilot)

Phase 1 approved knowledge articles must ship with all three locales `complete`. Fallback disclosure is therefore a safety net for regressions, not an expected steady state.

## 7. Blog exception

Blog may publish EN-complete with zh/th partial **only** when:

- Inventory row records `locale_policy: en_required_fallback_disclosed`
- Disclosure UI is implemented on the blog detail route
- P1-28 fails the document if disclosure wiring is absent

## 8. FAQ

No partial FAQ answers. Incomplete FAQ locales → entry not routable / omitted from hub.

## 9. Approval

**APPROVED** under decision **GCP-D-004**.
