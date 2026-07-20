# M1 Business Contract Report

**Project:** GoThailandHome Data Factory  
**Milestone:** M1 — Business Contracts  
**Branch:** `cursor/data-factory-master-plan`  
**Date:** 2026-07-20  
**Depends on:** M0 Foundation (`6bd7f71`), Master Plan (`3a2454f`)  
**Status:** Documentation complete — no implementation

---

## 1. Summary

M1 defines the **business contract layer**: what the platform manages, who owns it, and how objects relate — not how systems are implemented. Twenty contracts cover Catalog entities, demand-side platform objects, intelligence behaviors, ops workflows, and Windows01 runtime boundaries.

No production code, SQL, migrations, APIs, CMS, frontend, backend, deploy, push, or merge were authored as implementation.

---

## 2. Documents generated

| # | Document |
| --- | --- |
| 01 | `01_PROPERTY_CONTRACT.md` |
| 02 | `02_PROJECT_CONTRACT.md` |
| 03 | `03_DEVELOPER_CONTRACT.md` |
| 04 | `04_DISTRICT_CONTRACT.md` |
| 05 | `05_LISTING_CONTRACT.md` |
| 06 | `06_MEDIA_CONTRACT.md` |
| 07 | `07_AGENT_CONTRACT.md` |
| 08 | `08_CUSTOMER_CONTRACT.md` |
| 09 | `09_INQUIRY_CONTRACT.md` |
| 10 | `10_FAVORITE_CONTRACT.md` |
| 11 | `11_SEARCH_CONTRACT.md` |
| 12 | `12_RECOMMENDATION_CONTRACT.md` |
| 13 | `13_KNOWLEDGE_CONTRACT.md` |
| 14 | `14_SEO_CONTRACT.md` |
| 15 | `15_IMPORT_JOB_CONTRACT.md` |
| 16 | `16_EXPORT_JOB_CONTRACT.md` |
| 17 | `17_REVIEW_WORKFLOW_CONTRACT.md` |
| 18 | `18_PUBLISH_WORKFLOW_CONTRACT.md` |
| 19 | `19_AUDIT_LOG_CONTRACT.md` |
| 20 | `20_WINDOWS01_RUNTIME_CONTRACT.md` |
| — | `M1_BUSINESS_CONTRACT_REPORT.md` |

Each document includes: Purpose, Business Responsibility, Entity Ownership, Inputs, Outputs, Required Attributes, Relationships, Business Rules, Validation Rules, Approval Rules, Lifecycle, Future Compatibility, Cross References.

---

## 3. Contract coverage matrix

| Business concern | Contract | Domain |
| --- | --- | --- |
| Property typology | 01 | Catalog (shared attrs) |
| Project hubs | 02 | Catalog |
| Developers | 03 | Catalog |
| Districts/Cities | 04 | Catalog |
| Listings/offers | 05 | Catalog |
| Media assets | 06 | Cross-cutting |
| Agents | 07 | Platform / Marketplace |
| Customers | 08 | Platform |
| Inquiries/leads | 09 | Platform |
| Favorites | 10 | Platform |
| Search / AI Search | 11 | Intelligence |
| Recommendations | 12 | Intelligence |
| Knowledge content | 13 | Knowledge |
| SEO data product | 14 | SEO Domain |
| Import to serving | 15 | Ops |
| Export / handoff | 16 | Ops |
| Human review | 17 | Ops |
| Owner publish | 18 | Ops / Owner |
| Audit trail | 19 | Ops |
| Windows01 runtime | 20 | Execution Plane |

---

## 4. Entity relationship review

```text
Developer ──DEVELOPS──► Project ──HAS_LISTING──► Listing
                │                      │
                └──── LOCATED_IN ──────┴──► District ──► City

Media ──attached_to──► (Developer|Project|Listing|Knowledge)
SEO ──describes──► parent entity
Knowledge ──ABOUT/CITES──► Catalog entities / Evidence

Customer ──Favorite/Inquiry──► Listing/Project (non-owning)
Agent ──assigns/handles──► Listing/Inquiry (non-owning Catalog)

Search/Recommend ──read──► published Catalog + Knowledge
Import/Export/Review/Publish/Audit ──govern──► packages & serving
Windows01 ──produces candidates/evidence──► Control Plane review
```

No ownership cycle: Platform demand objects reference Catalog keys; they do not become masters of inventory truth.

---

## 5. Ownership review

| Object | Owner | Non-owner clarification |
| --- | --- | --- |
| Listing/Project/Developer/District facts | Data Factory Catalog | Agent/Customer/Inquiry do not own |
| Knowledge facts | Data Factory Knowledge | Not a parallel property DB |
| SEO values | Parent entity; SEO rules by SEO Domain | Website only renders |
| Media gallery | Parent + Factory metadata | Evidence blobs ≠ gallery |
| Inquiry/Favorite/Customer/Agent | Platform | Cannot publish Catalog |
| Search/Recommend | Intelligence (read + rank) | Cannot create truth |
| Import apply (pilot) | Control Plane | Windows01 does not apply prod |
| Publish batch | Owner | AI cannot approve |
| Audit | Ops (append-only) | Cross-cutting |

**No ownership conflicts detected** under this split. Marketplace future links attach by reference (`07`, `03`).

---

## 6. Compatibility review

| Requirement | Status |
| --- | --- |
| Consistent terminology with M0 | Pass — shared spine, business keys, null-over-fabricate, AI assist |
| No duplicated responsibilities | Pass — Review vs Publish vs Import vs Export separated |
| M0 standards alignment | Pass — contracts reference M0 docs; do not redefine DQ/lifecycle enums |
| AI Search | Pass — `11` corpus policy published/versioned; abstain; no raw truth |
| Knowledge Graph | Pass — edges named consistently with M0 `02`; Knowledge `ABOUT`/`CITES` |
| Windows01 | Pass — `20` handoff, gates, no pilot prod writes, shared audit vocabulary |

---

## 7. Risk review

| ID | Risk | Severity | Mitigation |
| --- | --- | --- | --- |
| M1-R1 | Platform contracts (07–10) may outpace factory implementation | Low | Explicitly non-factory ownership; no blocking of M2 schema |
| M1-R2 | Confusion between Review approve and Owner publish | Medium | Contracts 17 vs 18 separation; G-PUBLISH |
| M1-R3 | Search vs Recommend overlap in product language | Low | Query-driven vs proactive; both read-only on corpus |
| M1-R4 | Live packages lack full M0 envelopes | Medium | Remains M2/M1-implementation alignment item |
| M1-R5 | Embedding Owner decision still open | Medium | `20` + `11` require explicit enablement |
| M1-R6 | Filename parallel to M0 (`01_` standards vs contracts) | Low | Distinct suffixes `_STANDARD` vs `_CONTRACT` |

---

## 8. Readiness for implementation

| Question | Answer |
| --- | --- |
| M1 documentation complete? | **YES** |
| Ready for M2 (schema/pipeline design docs)? | **YES** — business “what” is defined |
| Ready to write SQL/migrations/code? | **NO** — still documentation-only until Owner authorizes implementation |
| Windows01 deploy ready? | **NO** — G-WIN01 + P0s outstanding |
| CMS implementation ready? | **NO** — contracts exist; M3 IA still next for CMS |

**M2 expectation (design):** schema blueprint, package contract machine shapes, and pipeline job specs should implement *these* business responsibilities without changing ownership boundaries.

---

## 9. Git note

Committed on `cursor/data-factory-master-plan` as:

`feat(data-factory): complete M1 business contracts`

Push out of scope.
