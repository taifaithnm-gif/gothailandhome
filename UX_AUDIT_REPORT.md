# UX Audit Report

**Date:** 2026-07-15  
**Scope:** First-time and core marketplace journeys. Read-only.

## First-time user journey

1. Lands on brand-forward home with search.
2. Sees Featured projects — many blurbs say details are omitted; some cards link to **500** pages.
3. Latest listings may lack photos.
4. Nav offers too many peers (Properties vs Search; Find My Home vs Contact).

**Verdict:** First impression is branded but trust drains quickly on project crashes and photo voids.

## Buy journey

- Entry: home Buy chip / sale filter / Buy section teaser.
- No dedicated Buy IA page.
- Results page is slow/heavy.
- Detail: can request viewing; often no listing agent.

## Rent journey

- Same pattern as buy with rent filter.
- Rent teasers on home work as marketing entry, not structured journey.

## Project discovery

- Projects index works.
- **66% of project details fail (33/50)** — journey dead-ends.
- Healthy projects still show sparse official detail (by Phase 7 honesty rules) which users may misread as broken content.

## Listing discovery

- Properties + Search + city pages all surface inventory.
- Overlap confuses which tool to use.
- Unbounded result pages create decision fatigue.

## Search / filter journey

- Hero search supports keyword/city/listing type.
- Advanced filters (beds/budget/BTS) live mainly in Find My Home lead form, not browse filters — demand vs discovery split is unclear.

## Viewing request

- Present on listing detail with consent.
- Works without pretending Apple owns listing.
- Weak when agent missing: user must escalate to platform CS.

## Find My Home

- Clear private-demand messaging.
- Field coverage matches Phase 8 requirements.
- Success path is form-post only; no guided matching UI yet (acceptable for M1).

## List Your Property

- Ownership confirmation + review gate present.
- Expectation management OK (no auto-publish).
- Discoverability weaker than Find My Home in hierarchy.

## Partnerships

- Separate developer/agency forms exist.
- Header surfaces “Partners” weakly (footer stronger).
- Pending review messaging adequate.

## Contact routing & Apple positioning

**Confirmed on live listing page:**
- Heading “Listing contact”
- Explicit: no listing contact on file; Platform CS can escalate — **not** the listing owner.
- Support note: “Apple and platform staff never replace the listing owner or agent.”

**Pass:** Apple is **not** presented as listing owner/agent.

## Dead ends

- Project detail 500s.
- Missing Knowledge hub despite glossary content.
- Districts have no directory index (must arrive from city or deep link).
- Missing listing photos reduce “next step” confidence.

## Duplicate CTAs

- Properties vs Search.
- Contact vs Find My Home vs viewing request vs platform support.
- Buy/Rent chips plus later Buy/Rent sections.

## Confusing labels

- “List Property” (nav) vs page title “List Your Property”.
- “Partners” footer → developer partnership, while Agency Partnership is separate line.
- “Investment” chip maps to low-price sale sort — may oversell product depth.

## Navigation depth

- Mostly 1–2 levels: good.
- Problem is breadth, not depth.

## Mobile navigation

- Hamburger collapses primary links.
- Long menu list remains cognitively heavy once opened.
- Language switcher visibility inside mobile menu needs care (present in code path).
