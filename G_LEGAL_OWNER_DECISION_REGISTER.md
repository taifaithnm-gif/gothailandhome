# G-LEGAL — Owner Decision Register

**Gate:** G-LEGAL  
**Document ID:** GLEG-REGISTER-V1  
**Status:** Owner Decision Freeze recorded — **GATE CLEARED**  
**Approval date:** 2026-07-20  
**Approved decisions:** 8  
**Conditional approvals:** 0  
**Deferred:** 0  
**Open decisions:** 0

## Instructions

- These decisions are authoritative governance boundaries for Phase 1 legal guide content.
- This register **clears G-LEGAL**.
- This register does **not** authorize deployment, Windows01, live collection, OCR, embeddings, production configuration changes, or commit/push.

## Decision table

| ID | Decision title | Decision | Blocking status | Owner decision | Approval date | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| GLEG-D-001 | Legal content scope | Single informational guide at `/knowledge/legal` | Unblocks P1-26 route scope | **APPROVED** | 2026-07-20 | See `G_LEGAL_CONTENT_SCOPE.md` |
| GLEG-D-002 | Allowed guidance | General Thailand property information; hedged language | Unblocks copy classes | **APPROVED** | 2026-07-20 | See `G_LEGAL_ALLOWED_GUIDANCE.md` |
| GLEG-D-003 | Forbidden advice | No personalized advice or unsigned copy | Unblocks P1-28 scan | **APPROVED** | 2026-07-20 | See `G_LEGAL_FORBIDDEN_ADVICE.md` |
| GLEG-D-004 | Required disclaimers | Mandatory non-advice + jurisdiction labels | Unblocks disclaimer render | **APPROVED** | 2026-07-20 | See `G_LEGAL_REQUIRED_DISCLAIMERS.md` |
| GLEG-D-005 | Source attribution | Government citations for factual legal statements | Unblocks citations | **APPROVED** | 2026-07-20 | See `G_LEGAL_SOURCE_ATTRIBUTION.md` |
| GLEG-D-006 | Evidence requirements | version, owner, jurisdiction, reviewed_at, sources | Unblocks loader validation | **APPROVED** | 2026-07-20 | 90-day review cadence |
| GLEG-D-007 | Editorial workflow | Qualified Legal Reviewer sign-off; AI cannot approve | Unblocks process | **APPROVED** | 2026-07-20 | See `G_LEGAL_EDITORIAL_WORKFLOW.md` |
| GLEG-D-008 | Guide inventory | Approve `thailand-foreign-ownership-guide` v LEG-GUIDE-1.0.0 | Unblocks P1-26 copy | **APPROVED** | 2026-07-20 | See `G_LEGAL_INVENTORY.md` |

## Gate clearance statement

All criteria required by `PHASE1_EXECUTION_READY_REPORT.md` and `PHASE1_MILESTONE_PLAN.md` for G-LEGAL are satisfied:

1. Legal content scope — **approved**
2. Allowed legal guidance — **approved**
3. Forbidden legal advice — **approved**
4. Required disclaimers — **approved**
5. Source attribution policy — **approved**
6. Evidence requirements — **approved**
7. Editorial workflow — **approved**
8. Approval record (this document) — **approved**
9. Guide inventory — **approved**

# G-LEGAL: CLEARED

**Cleared date:** 2026-07-20  
**Tasks unblocked:** P1-26, P1-28 (legal fields), P1-27 FAQ links to legal guide

## Owner sign-off

- **Package disposition:** **APPROVED — GATE CLEARED**
- **Human Owner:** Qualified Legal Reviewer (Authoritative Owner directive for Phase 1 legal guide; personal name not supplied in repository)
- **Decision date:** **2026-07-20**
- **Conditions:** None outstanding inside G-LEGAL.
- **Explicit non-authorization:** No deploy, commit, push, Windows01, live property source connection, OCR, collectors, embeddings, or production configuration change is authorized by this register.
