# Page Type Audit Report

**Date:** 2026-07-15

## 1. Homepage

**Strengths:** Brand-first hero; search; multilingual; clear buy/rent teasers.  
**Defects:** Nav clutter; placeholder project copy; links to crashing project pages; limited imagery.  
**Recommended section order:** Brand/value → Search → Featured verified listings → Featured projects (healthy only) → Cities → Soft marketplace CTAs → Trust/contact.  
**Required components:** HeroSearch, listing cards w/ photos, project cards w/ status gating, city chips, CS CTA.  
**Dependencies:** properties, projects, cities, developers.  
**Mobile defects:** Long page; featured section empty-look when cards below fold.  
**Priority:** P1

## 2. Search / results

**Strengths:** Filtering exists; titles/meta present.  
**Defects:** Near-duplicate of Properties; unbounded HTML; slow.  
**Recommended order:** Filter bar → result count → paginated grid → empty state.  
**Required:** Pagination, applied-filter chips, sort.  
**Dependencies:** properties query API.  
**Mobile defects:** Heavy scroll/jank risk.  
**Priority:** P0

## 3. Listing detail

**Strengths:** Price sidebar; contact separation done right; viewing form + consent.  
**Defects:** Missing media; missing agents (~99%); truncated overview; no JSON-LD.  
**Recommended order:** Gallery → title/price → key facts → description → project link → map/transit → listing contact → platform support → similar.  
**Required:** Gallery, source badge, agent card or explicit missing state, CS escalation.  
**Dependencies:** properties, media, agents, projects.  
**Mobile defects:** Form length beside missing photo hurts trust.  
**Priority:** P0

## 4. Project detail

**Strengths:** When healthy, structured specs + lead form + OG image hooks.  
**Defects:** **33/50 HTTP 500** from undefined POI i18n names; sparse official copy.  
**Recommended order:** Hero/media → summary → specs → POIs → listings in project → lead → developer.  
**Required:** Crash-safe POI renderer; empty-state for unsourced fields.  
**Dependencies:** property_projects + content packs.  
**Mobile defects:** Error page not branded.  
**Priority:** P0

## 5. Developer detail

**Strengths:** 20 content profiles resolve; SET notes where verified.  
**Defects:** DB stubs dilute directory quality.  
**Recommended order:** Identity → verified facts → projects → contact/disclaimer.  
**Required:** Publish-ready gate in listings.  
**Dependencies:** developers manifests.  
**Mobile:** Acceptable.  
**Priority:** P2

## 6. District detail

**Strengths:** Resolves; lighter than city for sparse districts.  
**Defects:** No index; heavy when many listings.  
**Recommended order:** Intro → transit → listings → nearby projects.  
**Required:** Pagination; breadcrumb to city.  
**Dependencies:** districts + properties.  
**Mobile:** Variable by inventory size.  
**Priority:** P2

## 7. Knowledge / article

**Status:** **Not implemented** as routes despite `content/glossary`.  
**Recommended:** Topic hub → article → related districts/projects.  
**Priority:** P2 (after alpha stabilisation)

## 8. Find My Home

**Strengths:** Complete field set; privacy messaging; lead write path.  
**Defects:** Visually long; limited progress UX; not in sitemap.  
**Recommended order:** Promise → essentials → preferences → contact/consent → submit.  
**Required:** Stepper optional; success receipt.  
**Dependencies:** marketplace_leads.  
**Mobile:** Stacks well.  
**Priority:** P1

## 9. List Your Property

**Strengths:** Authorization + consent; pending review.  
**Defects:** Sparse guidance; weak media upload story.  
**Recommended order:** Eligibility → property facts → contact → legal confirms → submit.  
**Required:** Review status explainer.  
**Dependencies:** marketplace_leads.  
**Priority:** P1

## 10. Partnership pages

**Strengths:** Split developer vs agency correctly.  
**Defects:** Low discoverability; basic styling.  
**Recommended order:** Value → requirements → form → review note.  
**Priority:** P1

## 11. Contact / help

**Strengths:** Platform CS only; correct Apple role.  
**Defects:** Could clarify when to use Contact vs Find My Home vs listing form.  
**Recommended order:** How we help → CS contacts → support form → escalation note.  
**Priority:** P1

## 12. Auth / dashboard

**Present:** `/admin`, login, property CRUD for admins; `/auth/callback`.  
**Missing:** End-user buyer/owner dashboard.  
**Defects:** robots allow; generic titles; not noindexed.  
**Priority:** P1 (hardening) / P3 (consumer dashboards later)
