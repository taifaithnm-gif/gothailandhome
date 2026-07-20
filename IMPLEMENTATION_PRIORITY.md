# Implementation Priority

**Product:** GoThailandHome · **Baseline:** `eedf3f7` · **Prepared:** 2026-07-17
**Phase:** Production Fix Planning — **planning only, no code modified**
**Scope:** CRIT-01, CRIT-02, CRIT-03 only.

Severity definitions are the review's, not engineering's —
`CEO_PRODUCT_REVIEW_GUIDE.md` §6. Severity is assigned from the **customer's**
point of view, never from implementation cost.

---

## 1. Classification

| ID | Issue | Class | Blocks launch? | Eng time | External dependency |
| --- | --- | --- | --- | --- | --- |
| **CRIT-01** | A failed lead redirects to the success page; the customer is told "Request received" for an enquiry that was never stored. Applies to all 6 forms / 5 channels, plus phantom ad-conversion events. | **P0** | **YES — hard block** | ≈ 13 h | Product decision on failure UX |
| **CRIT-02** | No Privacy, Terms, Cookie Policy, or Disclaimer in any language; no footer legal links. Consent is recorded (`consent_at`) against a policy that does not exist. | **P1** | **YES — unless waived in writing by the CEO** | ≈ 12.5 h | **Legal counsel: 1–3 weeks (blocking)** |
| **CRIT-03** | No district index. 44 of 56 published district pages are unreachable by browsing; Google can reach pages a human cannot. | **P2** | No | ≈ 8.25 h | Product decision on scope |
| | | | | **≈ 34 h** | |

**P3:** none. All three findings are P2 or higher.

## 2. Why each landed where it did

**CRIT-01 → P0.** Meets the P0 bar on both clauses: the customer cannot complete
a core journey (their enquiry reaches no one), and trust is destroyed on
contact. It is also the verbatim NO-GO criterion in `CEO_PRODUCT_REVIEW_GUIDE.md`
§9 — *"a lead form loses data, submits silently."*

The prior audit hedged this as a "P0 candidate — unproven in production," because
a happy-path submission returns `mode=stored`. **That hedge does not survive
scrutiny.** `createMarketplaceLead` returns `{ ok: false }` on *any* Postgres
error, so the failure branch is live on every production submission and fires
whenever the database has a bad moment — not only when storage is unconfigured.
Combined with zero detectability (no alerting, and anon RLS blocks `select`, so
submitted-vs-stored cannot be reconciled), **the correct classification is P0
now, not P0-if-observed.** Confirming the mode on a live submission remains
worthwhile, but it is not a precondition for prioritising the fix.

**CRIT-02 → P1, not P0.** Nothing breaks and nothing misleads — the pages are
absent, not wrong. A determined buyer still completes every journey. It fails
"credible" and "international standard," and it gates paid acquisition and
partner diligence, which is squarely P1: *a real buyer would hesitate.* It is a
launch-gating **business decision**, and the CEO may waive it in writing per §9.

**CRIT-03 → P2, not P1.** The audit left this open ("P1 if districts are core,
else P2"). Recommend **P2**: no customer is misled and no journey breaks — a
buyer browses by city instead, which works. That fails the P1 bar ("a real buyer
would hesitate, get confused, or go to a competitor"). It is opportunity cost —
44 authored district packages left invisible — not damage.

**Escalate to P1 only if** the CEO judges at checklist item **1.9.3** that
district-first browsing is central to the buyer journey. Note the escalation is
nearly academic: the fix is ~1 day either way, because `listDistricts()` already
exists.

## 3. Execution order

**The order is not the severity order.** CRIT-02's engineering is trivial but sits
behind 1–3 weeks of external legal drafting. If the content track starts when its
P1 rank comes up, launch slips by weeks for ~1.5 days of work.

```
Day 0    ┌─ STEP 1: Commission legal content (CRIT-02 Track A) ──────────┐
         │  Owner: CEO + counsel · NOT engineering · 1–3 weeks           │
         │  ═══ THE BINDING CONSTRAINT — START TODAY ═══                 │
         └──────────────────────────────────────────────────────────────┘
                          ↓ (runs in background — blocks nothing below)
Day 0    STEP 2: Product decisions — 30 min, unblocks all eng work
                          ↓
Day 1-2  STEP 3: CRIT-01 — P0 lead-loss fix        (≈13 h)  ← ship first
                          ↓
Day 3    STEP 4: CRIT-03 — district index          (≈8.25 h) ← while waiting
                          ↓
Week 2-4 STEP 5: CRIT-02 Track B — legal routes    (≈12.5 h) ← when copy lands
                          ↓
         STEP 6: CEO re-review → GO / NO-GO
```

| Step | Work | Owner | Duration | Starts when |
| --- | --- | --- | --- | --- |
| **1** | **Commission legal drafting + certified zh/th translation** | CEO + counsel | **1–3 weeks (external)** | **Immediately — today** |
| **2** | Resolve 3 product decisions (§4) | CEO | 30 min | Immediately |
| **3** | **CRIT-01 — P0 lead-loss fix** | Engineering | 1.5–2 days | After decision 1 |
| **4** | **CRIT-03 — district index** | Engineering | 1 day | After Step 3 (or parallel if capacity) |
| **5** | **CRIT-02 Track B — routes, footer, sitemap** | Engineering | 1.5 days | When counsel's copy + translations land |
| **6** | CEO re-review of the affected checklist items | CEO | 1 h | After Step 5 |

## 4. Rationale for the order

**Step 1 first, despite CRIT-02 being P1.** Longest lead time, external owner,
gates launch, and costs the engineering team nothing to start. Delaying it is the
single most expensive scheduling mistake available here.

**Step 2 before any code.** Three decisions gate implementation (§5). Answering
them costs 30 minutes; discovering them mid-implementation costs rework.

**Step 3 (P0) before Step 4 (P2)** — severity order, and it is the only finding
actively losing revenue. Every day it ships later is another day of silently
dropped leads with no way to know how many.

**Step 4 before Step 5** because Step 5 is *blocked on external input* and Step 4
is not. Sequencing a ready 1-day task behind a 3-week wait would idle the team.
CRIT-03 is deliberately the "while we wait" work.

**Step 5 last** by necessity, not by priority. Engineering cannot start until
counsel delivers. **This step is on the launch critical path** — Step 6 cannot
produce a GO until it lands or the CEO waives CRIT-02.

**Parallelism:** Steps 3 and 4 touch disjoint files (`marketplace/actions.ts` +
lead surfaces vs a new `districts/page.tsx`) and can run concurrently with two
developers. With one developer, keep them sequential — do not interleave the P0.

## 5. Decisions required before engineering starts

| # | Decision | Blocks | Plan's assumption |
| --- | --- | --- | --- |
| **1** | On storage failure, what does the customer see: **(a)** the honest error page with an alternative contact route, **(b)** a retry, or **(c)** accept-and-queue? | **CRIT-01 (P0)** | **(a)** — (b)/(c) are larger changes, out of P0 scope |
| **2** | Ship without legal pages (waive CRIT-02), or block launch on them? | Launch verdict | Blocks launch unless waived in writing |
| **3** | District index scope: **all 6 cities** (56 districts, grouped by city) or **Bangkok only**? | CRIT-03 | **All cities**, grouped by city |

Decision 1 is the only one blocking the P0. **It can be answered in one sentence
today.**

## 6. Definition of done

| ID | Done when |
| --- | --- |
| **CRIT-01** | A forced insert failure lands the customer on `/leads/error` with an alternative contact route — never `/leads/success`. A 10-lead reconciliation shows rows stored == leads submitted. No conversion event fires for an unstored lead. Production can never reach the placeholder branch. |
| **CRIT-02** | 12 URLs live (4 documents × 3 locales), rendered text byte-identical to counsel's approved source, footer Legal column on every page, consent checkboxes link the Privacy Policy, sitemap updated. Checklist item 1.2.9 passes. |
| **CRIT-03** | `/{lang}/districts` returns 200 in all 3 locales; all 56 districts browsable and grouped by city; a non-Bangkok district reachable from `/en` by clicking only; **Districts NOT added to the primary nav** (guards MED-05). Checklist item 1.9.3 retired. |

## 7. Effect on the launch verdict

Entering the review, `CEO_PRODUCT_REVIEW_PACKAGE.md` §8 records **one P0
candidate and two P1s open**. This plan reclassifies to **one P0 (CRIT-01), one
P1 (CRIT-02), one P2 (CRIT-03)**.

Per `CEO_PRODUCT_REVIEW_GUIDE.md` §9:

- **CRIT-01 (P0) must be fixed.** Not waivable. Any open P0 is an automatic NO-GO.
- **CRIT-02 (P1) must be fixed or waived in writing**, with a named reason and fix wave.
- **CRIT-03 (P2) does not block.** Ship and fix — though at ~1 day it is cheaper to fix than to track.

**Earliest realistic GO: ~2–4 weeks**, set entirely by CRIT-02's legal drafting.
**If CRIT-02 is waived: ~3 days**, once CRIT-01 ships and is verified.

Detail: `PRODUCTION_FIX_PLAN.md`. Tasks: `DEVELOPMENT_TASKS.md`.
