# G-CONTENT-PUBLIC — Public Visibility Rules

**Gate:** G-CONTENT-PUBLIC  
**Document ID:** GCP-VIS-V1  
**Status:** APPROVED  
**Approval date:** 2026-07-20

## 1. Purpose

Defines what public visitors may see, what must be omitted, and how drafts fail closed.

## 2. Visible only when approved

Public routes may render a document **only** when Status Vocabulary routability conjunction passes.

| Condition | Visitor experience |
| --- | --- |
| Unknown slug | 404 |
| `draft` / `in_review` / `rejected` | 404 |
| `archived` | 404 unless Owner records an explicit redirect |
| Approved but missing required citations | 404 (fail validation) |
| Approved but stale beyond lifecycle max without re-review | Not routable until re-reviewed |

## 3. Must display on public pages

| Element | knowledge_article | blog_post | faq_entry |
| --- | --- | --- | --- |
| Title | Required | Required | Question required |
| Body / answer | Required | Required | Required |
| Citations / sources | Required, visible | Required when claims are factual | Required when answer asserts external facts; else “platform process” label |
| Verification / review date | Required | Required (`published_at` + `updated_at`) | Required (`reviewed_at`) |
| Owner / author label | Owner or editorial credit | Author + date | Platform FAQ (no personal author required) |
| Locale fallback notice | When fallback applies | When fallback applies | N/A (no partial) |

## 4. Must never display

- Internal review comments, rejection reasons, raw harvest payloads
- Private marketplace lead data
- Unsupported yield, ROI, guaranteed return, or personalized legal advice
- Draft watermarks as a substitute for 404 (drafts are not soft-published)
- Apple / Platform Customer Success presented as content author or listing agent

## 5. Index vs detail

| Surface | Rule |
| --- | --- |
| Knowledge index | Lists only inventory-Approved + routable articles |
| Blog index | Lists only Approved posts; empty-state allowed when inventory empty |
| FAQ hub | Lists only Approved entries by category; anchors required |
| Sitemap | Include only routable Approved URLs (P1-29) |

## 6. robots / noindex

Default: Approved public content is indexable.  
Exceptions (noindex): preview query modes (if any), error/success lead pages (unchanged), compare/favorites state pages (unchanged).

## 7. Approval

**APPROVED** under decision **GCP-D-005**.
