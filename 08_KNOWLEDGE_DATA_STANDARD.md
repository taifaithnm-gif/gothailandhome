# 08 — Knowledge Data Standard

**Document ID:** `08_KNOWLEDGE_DATA_STANDARD`  
**Version:** 1.0.0  
**Status:** M0 Foundation — architecture only; no implementation  
**Date:** 2026-07-20

---

## 1. Purpose

Define **Knowledge Domain** objects: articles, FAQ, blog, investment/legal guides, facts, and their evidence/compliance constraints for governed publishing.

## 2. Scope

Filesystem packages today (`content/knowledge`, `content/blog`, `content/faq`, `content/guides/**`). Future Factory Work Store objects (`fact`, `content_item`) per master plan Option K1/K2 — serving choice deferred to M3; this standard is package-first.

## 3. Definitions

| Term | Definition |
| --- | --- |
| **Knowledge item** | Publishable content object (`knowledge_item`). |
| **Content type** | `article` \| `faq` \| `blog` \| `investment_guide` \| `legal_guide` |
| **Fact** | Atomic claim with `support_level` and evidence. |
| **Support level** | How strongly evidence backs a claim. |
| **High-risk content** | Investment and legal guides. |
| **Editorial override** | Human-approved text not directly quoted — must be flagged. |

## 4. Naming Convention

| Element | Convention |
| --- | --- |
| Business key | `content_type` + `slug` |
| Paths | `content/<family>/…` existing layout retained |
| Status | Shared review spine + editorial `draft` \| `in_review` \| `approved` mapping |
| Locale | Trinity via body/fields or `locale_status` |

## 5. Required Fields

| Field | Type | Notes |
| --- | --- | --- |
| `content_type` | enum | Controlled |
| `slug` | string | Stable |
| `title` | I18nString | EN required |
| `status` / `review_status` | enum | Mapped to lifecycle |
| `sources[]` | array | ≥ 1 for non-boilerplate |
| `schema_version` | string | |
| `package_version` | integer | |
| `updated_at` | datetime | |

High-risk types additionally require:

| Field | Notes |
| --- | --- |
| `disclaimers[]` or disclaimer flags | Per legal/investment governance |
| `compliance_checklist_id` | Reference to checklist version |

## 6. Optional Fields

| Field | Notes |
| --- | --- |
| `summary` / `body` | I18n structured content |
| `facts[]` | Linked fact ids |
| `evidence_ids[]` | |
| `about_entities[]` | Catalog business keys (`ABOUT` edges) |
| `seo` | Per `09` |
| `media` | Per `11` |
| `locale_status` | |
| `supersedes` | Prior slug/version |
| `model_assist` | AI draft metadata |
| `forbidden_claim_scan` | Result object |

### Fact object (logical)

| Field | Notes |
| --- | --- |
| `fact_id` | Stable |
| `statement` | Text |
| `support_level` | e.g. `direct_quote` \| `paraphrase` \| `editorial` \| `unknown` |
| `evidence_ids[]` | Required unless pure editorial flagged |
| `confidence` | Optional 0–1; cannot convert unknown → publishable |

## 7. Validation Rules

1. Unknown is not publishable as fact.  
2. Investment/legal items fail validation if required disclaimers missing.  
3. Forbidden claims (ROI guarantees, personalized legal advice, etc.) block `approved`.  
4. AI-drafted body remains non-approved until human review.  
5. `support_level = editorial` requires reviewer acknowledgment.  
6. Catalog entity references in `about_entities` must use valid business keys.  
7. Slug unique within `content_type`.

## 8. Quality Rules

| ID | Rule |
| --- | --- |
| KNOW-Q1 | Source-first; provenance through publish |
| KNOW-Q2 | Human throughput gates intake |
| KNOW-Q3 | No fabrication of statutes, fees, or returns |
| KNOW-Q4 | Cite sources on public knowledge where policy requires |
| KNOW-Q5 | Embeddings (future) only on approved versions |
| KNOW-Q6 | Align with `G_INVESTMENT_*` and `G_LEGAL_*` governance packages |

## 9. Lifecycle

Shared spine (`18`) with compliance sub-flags on `in_review`:

`intake → fact_check → language_check → compliance_check → approve → publish_package → site_ingest → supersede|archive`

Publication remains Owner-gated for factory-collected knowledge.

## 10. Examples

```json
{
  "entity_type": "knowledge_item",
  "content_type": "faq",
  "slug": "faq-what-is-gth",
  "schema_version": "1.0.0",
  "package_version": 1,
  "review_status": "approved",
  "title": {
    "en": "What is GoThailandHome?",
    "zh": "什么是 GoThailandHome？",
    "th": "GoThailandHome คืออะไร?"
  },
  "sources": [{ "type": "editorial_policy", "name": "GTH ownership policy" }],
  "locale_status": "complete"
}
```

Fact example:

```json
{
  "fact_id": "fact_foreign_ownership_condo_leasehold_note",
  "statement": "Foreign freehold condo ownership is subject to quota and legal conditions under Thai law.",
  "support_level": "paraphrase",
  "evidence_ids": ["ev_001"],
  "confidence": 0.7
}
```

## 11. Future Compatibility

- K1 (FS package-of-record) and K2 (Supabase knowledge tables) both consume this field model.  
- Second site: packages remain site-independent; site binding occurs at publish.  
- `cf_chunks` / embeddings attach to approved `package_version` only.  
- Knowledge Graph `CITES`, `ABOUT`, `SUPERSEDES` derived from these objects.

## 12. Cross References

| Topic | Document |
| --- | --- |
| Model / ER | `01`, `02` |
| SEO / metadata | `09`, `10` |
| Governance | `19_DATA_GOVERNANCE_STANDARD.md` |
| Master plan Knowledge Pipeline | `DATA_FACTORY_MASTER_PLAN.md` §8 |
| CF V2 | `CONTENT_FACTORY_ARCHITECTURE_V2.md` |
| Legal / investment policies | `G_LEGAL_*`, `G_INVESTMENT_*` |
| Public editorial | `G_CONTENT_PUBLIC_*` |
