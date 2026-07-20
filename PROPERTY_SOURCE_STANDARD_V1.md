# Property Source Standard V1

**Status:** Sprint 1 frozen source-governance standard; no source nominated or approved  
**Pilot boundary:** Maximum two sources for Bangkok new condominium projects

## Approved source requirements

A source is eligible only when all are true:

1. The owner/operator is identifiable.
2. Access is legal and does not require bypassing login, paywall, CAPTCHA, robots restrictions, API limits, or technical controls.
3. The exact access method is recorded and approved.
4. The source is stable enough to retain a canonical URL/access point and citeable location.
5. Project information is attributable and independently reviewable against retained evidence.
6. Collection, evidence retention, quotation, attribution, and intended publication rights are recorded.
7. Personal-data exposure is none or low and unnecessary personal data can be excluded.
8. The source can support immutable payload/snapshot/reference retention and SHA-256 integrity verification.
9. Update/freshness signals are available or capture time can be used with explicit limitations.
10. The Human Owner approves the completed source approval template before any access or collection.

No live source is approved by this standard itself.

## Preferred source classes

| Level | Description | V1 suitability |
| --- | --- | --- |
| Q1 — Primary authoritative | Official developer/operator source or owner-authorized structured file with clear rights and direct project facts | Preferred |
| Q2 — Corroborating authoritative | Official government/public authority source used for location or official-status corroboration | Allowed as second source when necessary |
| Q3 — Attributable publisher | Stable publisher with clear ownership, rights, evidence and direct verification path | Conditional; requires documented reason and Owner approval |
| Q4 — Unverified/restricted | Aggregator, user-generated, copied, unattributable, unstable, restricted, high-personal-data, or legally unclear source | Prohibited |

Source quality does not replace field-level evidence or human review.

## Attribution standard

Each source record must retain:

- approved source ID and name;
- owner/operator;
- canonical URL or access point;
- source type and approved access method;
- attribution wording/requirement;
- source-published and source-updated times when supplied;
- capture time;
- rights/terms snapshot or review reference;
- source approval result, approver reference, date, conditions, and expiry;
- takedown/contact path where available.

Every publication-ready field must resolve to an evidence object and source ID. Attribution must survive normalization, review, package creation, correction, and rollback.

## Evidence requirements

- Preserve the original payload or a permitted immutable screenshot/snapshot/reference.
- Compute and retain SHA-256 for retained payloads/snapshots.
- Record MIME/type, capture time, canonical URL/file reference, and exact page/section/row/cell/character location.
- Record the exact quote/value for price, currency, availability, completion status, and other high-risk fields.
- Retain prior evidence versions; do not overwrite changed evidence.
- Never store credentials or unnecessary personal data in evidence.

`PROPERTY_EVIDENCE_STANDARD_V1.md` is authoritative for evidence-object details.

## Legal review

The source approval form must record:

- terms-of-use review status and reviewed version/date;
- robots/API/access restriction status;
- copyright, retention, citation, attribution, and publication posture;
- authentication and rate-limit conditions;
- personal-data exposure and exclusion controls;
- jurisdiction/compliance concerns;
- approval expiry and re-review triggers.

Immediate rejection applies to unclear ownership, prohibited automated access, missing attribution path, unverifiable information, excessive personal data, unstable access, high unresolved legal risk, or no evidence-retention method.

The Human Owner may require legal/compliance review. AI cannot waive a legal or rights uncertainty.

## Refresh policy

- First pilot capture and verification are manual.
- Source approval must be active before every refresh.
- Capture source-published/updated times and a new capture time.
- Compare content hashes before normalization.
- Unchanged evidence records a no-change event; it must not create duplicate canonical records.
- Changed evidence creates a new evidence and record version and reopens human review.
- `fresh`: 0–30 days since last verification.
- `warning`: 31–90 days; not current for price/availability claims.
- `expired`: >90 days; blocked from current presentation and publication until re-verified.
- Any price/current-availability record older than 30 days without re-verification must not be represented as current.

## Re-review triggers

Re-review a source upon terms, ownership, URL/access method, robots/API restriction, authentication, rights, structure, data type, personal-data exposure, attribution, or takedown-policy change; on approval expiry; or after an incident.

## Source gate

Before G1 can pass:

- one completed approval form exists per source;
- no more than two sources are approved;
- all rejection criteria pass;
- conditions are testable;
- evidence capture/retention is feasible;
- the source appears in the signed pilot manifest.

This document authorizes no browsing, live connection, collection, collector, parser, credential, or publication.

