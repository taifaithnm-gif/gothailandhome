# ALPHA_DECISION_BACKLOG

**Date:** 2026-07-15  
**Scope:** Decisions after contact reconciliation + product review. No implementation in this milestone.

| ID | Pri | User problem | Recommended change | Routes / components | Dep | Complexity | Acceptance | Work type |
|----|-----|--------------|--------------------|---------------------|-----|------------|------------|-----------|
| A1 | P0 | City/district/developer pages still dump full listing HTML | Apply same pagination/bounded query as `/properties` | `cities/[slug]`, `districts/[slug]`, `developers/[slug]`, `listPublishedProperties*` | P0 search pattern | M | HTML ≪ 1 MB; page URL state; counts correct | code |
| A2 | P0 | Visitors assume GTH is the brokerage | Homepage + contact honesty strip: index of public listings; not the listing agent | Home, Contact, ListingContactCard | Messaging | S | Copy QA EN/ZH/TH; Apple never agent | content + design |
| A3 | P0 | Almost no listing has a real agent | Do **not** republish seed demos; plan evidenced contact capture later | Listing detail | AGENT_ID report | L | Contact only with evidence; platform help separate | data + code |
| A4 | P1 | Homepage shows seed developers / unbounded lists | Cull demo developers from public home; limit sections | Home page | Developer publish flags | S | Only package developers on home; ≤6 cards/section | code + content |
| A5 | P1 | Homepage not credible | Hero budget: brand, 1 headline, search, real proof counts | Home | A2 | M | Pass brand test; no card collage in hero | design + code |
| A6 | P1 | Missing images kill conversion | Media collection pipeline (separate milestone) OR stronger source-link CTA | Cards, detail | Media standard | XL | % with real media measured; no fake photos | data |
| A7 | P1 | Dual search UIs confuse | Unify `/search` with `/properties` filters or redirect | Search, Properties | — | S | One filter model | code |
| A8 | P1 | Nav overload on mobile | Alpha IA: Browse / Projects / Find Home / List / Contact | Header | A5 | M | ≤5 primary mobile links | design + code |
| A9 | P1 | Fact provenance unclear on projects | Surface OFFICIAL vs portal-derived labels | Project detail | Standards | M | No unverified fact shown as official | code + content |
| A10 | P2 | Post-submit dead ends | Confirmation + “what happens next” + ticket id | Marketplace forms | Leads tables | M | User sees next step | code |
| A11 | P2 | ZH/TH see English listing bodies | Source-language badge + selective translation | Listing/project | i18n | L | Badge visible; chrome 100% localized | content |
| A12 | P2 | No knowledge/articles | Buyer guides (foreign ownership, fees) | New routes | Editorial | L | ≥3 guides EN+ZH | content |
| A13 | P2 | Docs said 12 agents / live published 0 | Update integrity wording to “12 draft seed relations” | DATA_INTEGRITY_* | This report | S | Docs match query semantics | content |
| A14 | P3 | Admin polish | Agent assignment UI with evidence URL required | Admin property form | A3 | M | Cannot save agent without evidence field | code |
| A15 | P3 | Investment section unclear | Define or remove Investment CTA | Home | Product | S | CTA maps to explicit filter | design |

## Explicit non-actions this milestone

- No homepage redesign implementation  
- No contact backfill writes  
- No deploy  
- No harvest
