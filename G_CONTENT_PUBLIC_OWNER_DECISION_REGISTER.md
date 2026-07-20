# G-CONTENT-PUBLIC — Owner Decision Register

**Gate:** G-CONTENT-PUBLIC  
**Document ID:** GCP-REGISTER-V1  
**Status:** Owner Decision Freeze recorded — **GATE CLEARED**  
**Approval date:** 2026-07-20  
**Approved decisions:** 12  
**Conditional approvals:** 0  
**Deferred:** 0 (within this gate; investment/legal copy remain separate gates)  
**Open decisions:** 0

## Instructions

- These decisions are authoritative governance boundaries for Phase 1 website static public content.
- This register **clears G-CONTENT-PUBLIC**.
- This register does **not** authorize deployment, Windows01, live collection, OCR, embeddings, production configuration changes, or commit/push.
- This register does **not** clear G-INVESTMENT or G-LEGAL.
- Implementation of P1-22 may begin only after normal Phase 1 implementation authorization; this package alone is the content-policy prerequisite.

## Decision table

| ID | Decision title | Decision | Blocking status | Owner decision | Approval date | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| GCP-D-001 | Public content types | Five types: `knowledge_article`, `blog_post`, `faq_entry`, `investment_guide`, `legal_guide`; filesystem scope limited | Unblocks P1-22 type contract | **APPROVED** | 2026-07-20 | See `G_CONTENT_PUBLIC_CONTENT_TYPES.md` |
| GCP-D-002 | Status vocabulary | `draft` / `in_review` / `approved` / `archived` / `rejected`; only `approved`+inventory routable | Unblocks routability rules | **APPROVED** | 2026-07-20 | Legacy `publish_ready` mapping defined |
| GCP-D-003 | Ownership policy | Content Owner + Editorial Reviewer; AI cannot approve | Unblocks accountability | **APPROVED** | 2026-07-20 | Listing/PCS roles remain separate |
| GCP-D-004 | Locale fallback policy | Prefer complete visitor locale; EN fallback only with disclosure; FAQ/knowledge require complete triad for approval | Unblocks P1-22/P1-23/P1-28 | **APPROVED** | 2026-07-20 | Silent multi-locale chains prohibited |
| GCP-D-005 | Public visibility rules | Drafts 404; required citations/dates visible; no soft-publish | Unblocks P1-23+ | **APPROVED** | 2026-07-20 | |
| GCP-D-006 | Source attribution rules | Allowed source classes; required citation fields | Unblocks evidence-backed articles | **APPROVED** | 2026-07-20 | |
| GCP-D-007 | Evidence requirements | OFFICIAL/EDITORIAL/UNVERIFIED; review freshness maxima | Unblocks P1-28 checks | **APPROVED** | 2026-07-20 | |
| GCP-D-008 | Editorial approval workflow | draft→in_review→approved; AI cannot approve inventory | Unblocks human process | **APPROVED** | 2026-07-20 | |
| GCP-D-009 | Content lifecycle | Create/maintain/archive/rollback without Windows01 | Unblocks operations model | **APPROVED** | 2026-07-20 | |
| GCP-D-010 | Article inventory | Approve `bts-skytrain-overview` only | Unblocks P1-23 inventory | **APPROVED** | 2026-07-20 | Routable only after loader/routes + validation |
| GCP-D-011 | Blog inventory | Empty inventory approved | Unblocks P1-24 empty-state | **APPROVED** | 2026-07-20 | Intentional zero posts |
| GCP-D-012 | FAQ inventory | Ten platform/process entries + five categories | Unblocks P1-27 | **APPROVED** | 2026-07-20 | No improvised legal/investment answers |

## Gate clearance statement

All criteria required by `PHASE1_EXECUTION_READY_REPORT.md` and `PHASE1_MILESTONE_PLAN.md` for G-CONTENT-PUBLIC are satisfied:

1. Public content types — **approved**
2. Inventory status vocabulary — **approved**
3. Ownership policy — **approved**
4. Locale fallback policy — **approved**
5. Public visibility rules — **approved**
6. Source attribution rules — **approved**
7. Evidence requirements — **approved**
8. Editorial approval workflow — **approved**
9. Content lifecycle — **approved**
10. Approval record (this document) — **approved**
11. Public article / blog / FAQ inventories — **approved**

# G-CONTENT-PUBLIC: CLEARED

**Cleared date:** 2026-07-20  
**Tasks unblocked for implementation authorization:** P1-22, P1-23, P1-24, P1-27, and (after those surfaces) P1-28–P1-30 as sequenced.  
**Still blocked:** None from G-CONTENT-PUBLIC. Investment/legal copy gates cleared separately 2026-07-20 (G-INVESTMENT, G-LEGAL).

## Owner sign-off

- **Package disposition:** **APPROVED — GATE CLEARED**
- **Human Owner:** Content Owner (Authoritative Owner directive for Phase 1 website static content; personal name not supplied in repository)
- **Decision date:** **2026-07-20**
- **Conditions:** None outstanding inside G-CONTENT-PUBLIC. Investment and legal guide **copy** remain prohibited until G-INVESTMENT and G-LEGAL clear.
- **Explicit non-authorization:** No deploy, commit, push, Windows01, live property source connection, OCR, collectors, embeddings, or production configuration change is authorized by this register.
