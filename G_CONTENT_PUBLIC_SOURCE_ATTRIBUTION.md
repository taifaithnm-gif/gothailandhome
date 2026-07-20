# G-CONTENT-PUBLIC — Source Attribution Rules

**Gate:** G-CONTENT-PUBLIC  
**Document ID:** GCP-ATTR-V1  
**Status:** APPROVED  
**Approval date:** 2026-07-20

## 1. Purpose

Requires honest, visible attribution for facts asserted in public static content.

## 2. Allowed source classes

| Class | Examples | Allowed for |
| --- | --- | --- |
| `official_operator` | Transit operator, developer corporate site | Knowledge facts |
| `government` | Thai government / regulator pages | Knowledge, legal citations (under G-LEGAL) |
| `official_developer` | Named developer official materials | Project-adjacent knowledge (not invented inventory) |
| `platform_process` | GoThailandHome documented product behavior | FAQ process answers only |
| `editorial` | Platform editorial voice without external fact claims | Blog narrative only; no fabricated statistics |

## 3. Required citation fields

Each citation/source object must include:

| Field | Rule |
| --- | --- |
| `type` or `source_type` | From allowed classes |
| `name` | Human-readable source name |
| `url` | Stable public URL when the source is web-accessible |
| `verified_at` | ISO date of human verification |

Optional: `note` for section/context. Missing required fields → P1-28 fail.

## 4. On-page attribution

- Knowledge articles: citations section visible on detail; verification date visible.
- Blog: factual claims that are not common knowledge require citations; opinion must be labeled as editorial.
- FAQ: external facts need citations; pure platform-process answers label `source: platform_process`.
- Investment / legal: attribution rules of G-INVESTMENT / G-LEGAL supersede and are stricter.

## 5. Prohibited attribution practices

- Fabricating sources or URLs
- Citing competitor listing portals as “official” for operator facts
- Hiding AI authorship behind official sources
- Using Platform Customer Success contact identity as a content source

## 6. Alignment with existing article shape

Phase 12 `sources[]` + `field_evidence` on knowledge articles remain acceptable evidence carriers if they satisfy §3 and Evidence Requirements.

## 7. Approval

**APPROVED** under decision **GCP-D-006**.
