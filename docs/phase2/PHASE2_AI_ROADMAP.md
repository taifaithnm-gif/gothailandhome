# Phase 2 — AI Roadmap

**Baseline:** `v1.0.0` (no production AI recommend / investment assistants)
**Status:** Planning only
**Date:** 2026-07-21
**Primary milestones:** M7 (build), M0/M2 (policy & events), Data Factory embeddings optional supply

---

## 1. Vision

Use AI to **assist** discovery and investment **decision framing** while preserving evidence honesty. AI never becomes the system of record for property facts.

---

## 2. Products in scope

| Product | User job | Milestone |
| --- | --- | --- |
| **P-REC** Property recommendation | “Show me similar / fit listings” | M7 |
| **P-INV** Investment analysis assist | “Help me compare scenarios / risks / assumptions” | M7 |
| **P-COPY** (optional later) Assistive copy for partner descriptions | Draft → human approve | Deferred unless Owner pulls forward |

Out of scope for Phase 2 AI: autonomous publish, legal advice chatbot as counsel, guaranteed yield bots, scraping agents.

---

## 3. Capability ladder

```text
L0  Rules / filters only (no LLM) — can ship early as “smart filters”
L1  Embedding similarity over approved catalog fields
L2  LLM re-rank + natural language explanation with citations to fields
L3  Multi-turn investment scenario coach with tool calculators
```

Phase 2 target: **L1–L2 for P-REC**; **L2–L3 (bounded) for P-INV**. L0 may ship mid-phase as progressive enhancement.

---

## 4. P-REC — Property recommendation

### 4.1 Inputs

- User context: viewed listings, favorites, saved searches, locale, budget filters
- Catalog features: price, type, beds, district, project, tenure (only if evidenced)
- Explicit exclusions: missing evidence fields treated as unknown

### 4.2 Outputs

- Ranked listing IDs with **reason codes** (e.g., same district, similar price band)
- Optional short explanation string (templated or LLM) citing reason codes
- “Why this?” expandable panel

### 4.3 Safety

- No invented amenities, prices, or availability
- If catalog field null → cannot claim it
- Diversity / anti-filter-bubble soft rules
- Logging of recommendation request IDs for audit

### 4.4 UX placements

- Property detail “Similar”
- Home personalized rail (auth or session)
- Account dashboard suggestions
- Post-lead “keep exploring”

---

## 5. P-INV — Investment analysis assist

### 5.1 Allowed

- Structure user assumptions (budget, hold period, rent estimate **user-provided**)
- Run/display calculator outputs from finance tools (M6 dependency)
- Summarize **public** knowledge-guide points with links
- Risk checklist prompts (currency, foreign ownership, fees) pointing to legal/investment guides

### 5.2 Forbidden

- Guaranteed ROI / rental yields presented as platform facts
- Specific tax/legal conclusions as advice
- Fabricating comparable sales
- Encouraging unlicensed financial advice framing

Inherit: `G_INVESTMENT_FORBIDDEN_CLAIMS.md`, `G_INVESTMENT_ROI_WORDING_POLICY.md`, `G_INVESTMENT_FORECAST_DISCLAIMER.md`.

### 5.3 UX

- Disclaimer ACK gate before first session
- Assumption editor + sensitivity toggles
- Export/share summary as non-authoritative PDF/HTML (optional later)
- Clear “Not financial advice” chrome

---

## 6. Model & infra strategy (planning)

| Layer | Approach |
| --- | --- |
| Retrieval | Prefer structured catalog + approved knowledge packages |
| Vectors | Optional; may consume Data Factory embeddings **if** Owner enables Factory W7 — not required to start L0/L1 rules |
| LLM provider | Owner choice at M7 kickoff; abstract behind provider adapter |
| Prompt governance | Versioned prompts; eval set; red-team forbidden claims |
| PII | Minimize; no raw CRM notes into prompts without scrubbing |

---

## 7. Evaluation & acceptance (AI)

| Gate | Requirement |
| --- | --- |
| Claim audit | Sampled outputs pass forbidden-claim scanner |
| Citation check | Explanations map to real fields / guide URLs |
| Latency budget | p95 within Owner-set SLA for recommend rail |
| Locale | EN/ZH/TH explanation quality reviewed |
| Fallback | Degrade to L0 filters if model/provider fails |
| Human override | Ops can disable AI surfaces via feature flag |

---

## 8. Analytics events (AI)

Proposed (finalize in M8 taxonomy):

- `ai_recommend_impression`
- `ai_recommend_click`
- `ai_recommend_dismiss`
- `ai_invest_session_start`
- `ai_invest_disclaimer_ack`
- `ai_invest_assumption_change`
- `ai_invest_fallback`

Consent-gated like Phase 1 analytics.

---

## 9. Dependencies

| Dependency | Notes |
| --- | --- |
| M1 account context | Better personalization |
| M5 map filters | Geo-aware recommend |
| M6 finance tools | P-INV calculators |
| Knowledge / investment / legal guides | Citation targets |
| Data Factory embeddings | Optional acceleration, not blocker |

---

## 10. Phased delivery inside M7

1. Policy pack + feature flags
2. L0 similar-by-rules on property detail
3. L1 similarity service (if vectors available) or enhanced rules
4. L2 explanations
5. P-INV coach MVP bound to finance tools
6. AI RC gate

---

## 11. Risks (summary)

See `PHASE2_RISK_REGISTER.md` — AI hallucination, compliance, cost, latency, over-trust. Control: disclaimers, flags, eval harness, human publish separation.
