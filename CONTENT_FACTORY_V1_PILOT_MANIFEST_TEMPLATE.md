# Content Factory V1 Pilot Manifest Template

**Purpose:** Controlled G5 manifest. Do not populate source or project names until their approvals exist.  
**Status:** Template only; not authorization to collect, deploy, or publish.

## Pilot control

| Field | Approved value |
| --- | --- |
| Pilot ID | |
| Pilot name | |
| Manifest version | |
| Manifest status | _DRAFT / APPROVED / SUSPENDED / CLOSED_ |
| Approved geography | |
| Approved source list | _Reference Source Table A_ |
| Approved project types | |
| Maximum project count | _Recommended: 5–10; Owner-approved value required_ |
| Maximum record count | _Recommended maximum: 100; Owner-approved value required_ |
| Start date | _YYYY-MM-DD_ |
| End date | _YYYY-MM-DD_ |
| Human reviewers | _Reference Table E_ |
| Final approver | |
| Runtime environment | _Not approved during Sprint 0_ |
| Storage location | _Owner-approved isolated location required before runtime_ |
| Evidence location | _Owner-approved immutable path/reference required before collection_ |
| Publication target | _Recommended: GoThailandHome only_ |
| Rollback owner | |
| Success metrics | _Reference approved D-024 and acceptance scorecard_ |
| Failure conditions | _Reference approved D-025_ |
| Stop conditions | _P0 failure; boundary breach; incident; approval expiry/revocation; Owner stop_ |

## Gate references

| Gate | Approval/reference | Status |
| --- | --- | --- |
| G0 Planning baseline | | _OPEN_ |
| G1 Sources | | _OPEN_ |
| G2 Data/evidence standard | | _OPEN_ |
| G3 Technical boundary | | _OPEN_ |
| G4 Windows 01 (if used) | | _NO-GO / OPEN_ |
| G5 Pilot manifest | | _OPEN_ |

## A. Approved sources

Maximum rows must not exceed the Owner-approved source limit (recommended maximum 2).

| Source ID | Source name | Source approval record | Owner/operator | Type | Access method | Geography | Rights/attribution conditions | Review expiry | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| | | | | | | | | | |
| | | | | | | | | | |

## B. Approved projects

Do not add invented or merely proposed projects. Every row must trace to an approved source before collection.

| Manifest project ID | Project name | Project type | Geography | Approved source ID(s) | Expected record count | Inclusion reason | Owner approval/status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| | | | | | | | |

**Count control**

- Approved projects: ____ / approved maximum ____
- Expected records: ____ / approved maximum ____
- Count checked by/date: ____________________

## C. Data-field standard

| Field ID/name | Required/optional | Type/controlled values | Original value retained | Normalization rule/version | High-risk | Freshness rule | Null/unknown rule | Owner approval reference |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| | | | | | | | | |

At minimum, reconcile this table with the fields listed in `CONTENT_FACTORY_V1_PILOT_DEFINITION.md`. Price, currency, availability, completion date, unit count, tenure, and official status remain optional unless approved; if included, they require source evidence, “as of” handling, and explicit human approval.

## D. Evidence requirements

| Evidence element | Required | Capture/location method | Integrity/version method | Retention rule | Access control | Verification owner |
| --- | --- | --- | --- | --- | --- | --- |
| Source approval and rights snapshot | Yes | | | | | |
| Original payload or permitted immutable snapshot/reference | Yes | | SHA-256 | | | |
| Canonical URL/file reference and capture time | Yes | | Manifest version | | | |
| Citeable field location and exact quote/value | Yes for publishable fields | | Section/row/cell/range hash where applicable | | | |
| Parser/normalizer versions and original/normalized values | Yes | | Immutable object version | | | |
| Human review decisions and evidence viewed | Yes | | Immutable decision version | | | |
| Package and rollback versions/hashes | Yes before handoff | | SHA-256 + event audit | | | |

## E. Reviewer assignments

| Assignment ID | Person | Role | Scope | Decision authority | Backup reviewer | Start/end | Owner approval |
| --- | --- | --- | --- | --- | --- | --- | --- |
| | | Intake/Fact/Duplicate Reviewer | | | | | |
| | | Final Publisher/Approver | | | | | |
| | | Rollback Owner/Witness | | | | | |

One person may hold multiple roles only if each decision type remains separately recorded.

## F. Publication batches

During Feature Freeze, only non-production simulation entries are allowed.

| Batch ID | Package version/hash | Record count | Review completion reference | Target/environment | Final approval reference | Handoff result/time | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| | | | | _STAGING/LOCAL ONLY_ | | | |

## G. Rollback records

| Rollback ID | Batch/package | Trigger/reason | Prior version/hash | Rollback owner | Start/end | Result | Verification | Incident link |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| | | | | | | | | |

## H. Pilot incidents

| Incident ID | Date/time | Stage | Severity | Description | Affected source/project/record | Containment | Release-blocking | Owner | Resolution/decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| | | | | | | | | | |

## Manifest stop conditions

Stop new work and set status to `SUSPENDED` if:

- a source approval is missing, expires, changes, or is revoked;
- project/source/record limits would be exceeded;
- evidence cannot be retained, located, or hash-verified;
- a P0 criterion fails or a release-blocking risk opens;
- critical identity, duplicate, price, currency, availability, ownership, or status conflict remains unresolved;
- human review or exact package approval is missing;
- backup restore or rollback rehearsal fails;
- credential exposure, cross-project contamination, or production access occurs;
- the Human Owner directs a stop.

## Owner approval

- **Manifest decision:** _APPROVED / APPROVED WITH CONDITIONS / REJECTED / DEFERRED_
- **Human Owner:** ____________________
- **Approval date:** ____________________
- **Approved manifest version:** ____________________
- **Conditions:** _________________________________________________________

Approval of the manifest does not by itself approve Windows 01 deployment, live collection, or publication; the corresponding gates must also be complete.

