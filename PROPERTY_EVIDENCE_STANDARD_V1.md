# Property Evidence Standard V1

**Status:** Sprint 1 frozen logical evidence standard; no storage implementation  
**Rule:** A property record without complete, verifiable evidence is blocked.

## Mandatory evidence object

| Element | Requirement | Validation |
| --- | --- | --- |
| Evidence ID | Stable immutable identifier | Unique and non-blank |
| Source | Approved source ID and source name | Must resolve to active source approval |
| URL/access point | Canonical source URL or approved file/access reference | Must match approved source/method; no credential |
| Capture time | UTC ISO 8601 time evidence was obtained | Required; not future-dated |
| Screenshot/payload | Permitted immutable screenshot, source payload, or retained immutable reference | At least one required; storage/reference must be retrievable |
| Content hash | SHA-256 of each retained screenshot/payload | Must reproduce at intake, backup restore, and audit |
| Evidence location | Page, section, row/cell, character range, selector, and/or exact quote/value | Required for every publishable field; exact value required for high-risk fields |
| Rights snapshot | Terms/rights/attribution policy reference effective at capture | Must resolve to source approval version |
| Adapter version | Logical adapter contract/version associated with evidence intake | Required even for a future manual/fixture adapter |
| Parser version | Parser version when parsing is later authorized | Nullable only when no parser was used |
| Reviewer | Human reviewer reference | Required before reviewed/approved status; AI prohibited |
| Review decision | Immutable decision and reason reference | Required before record approval |
| Approval time | UTC timestamp for approval of exact record/evidence version | Required for approved/publish-ready records |
| Record version | Exact canonical record ID and version supported | Required |
| Publication batch | Exact batch/package reference | Null before publication; required after inclusion |
| Rollback reference | Prior approved package/state reference | Required before publication |

## Field-level evidence

Every original or source-derived field maps to one or more evidence IDs. Each link records:

- record ID/version;
- field name;
- evidence ID;
- exact quote/value;
- location within screenshot/payload/reference;
- source ID;
- capture time;
- reviewer status.

Project identity, developer, location, property type, price, currency, area, bedroom, bathroom, parking, and completion status cannot rely only on a record-level citation.

Price, currency, current availability, completion/construction status, official status, and conflicting values require exact field-level evidence and explicit human approval.

## Evidence capture rules

1. Capture the approved source only by its approved method.
2. Preserve the original bytes where rights permit; otherwise preserve the approved immutable screenshot/reference and explain the limitation.
3. Hash retained artifacts before any parsing/normalization.
4. Record timestamps, source approval version, rights snapshot, MIME/type, and size.
5. Segment evidence into citeable locations without altering the original.
6. Never treat generated summaries, normalized values, or AI output as source evidence.
7. Never store credentials or unnecessary personal data.
8. If evidence storage/reference fails, parsing, normalization, and review cannot proceed.

## Version and immutability rules

- Evidence is append-only for V1 governance: correction creates a new evidence version.
- Changed source payload creates a new hash/version and reopens affected record review.
- Rejection, supersession, expiry, takedown, and rollback preserve audit history and prior evidence subject to later approved legal/retention policy.
- Evidence links cannot be silently replaced.
- Every restored artifact must reproduce its recorded hash.

## Review requirements

The human reviewer must:

- view the retained evidence;
- verify exact values and location references;
- verify the source approval/rights status;
- mark unsupported values `null`/rejected rather than infer them;
- record reviewer reference, decision, reason, record/evidence version, and approval time.

One hundred percent of V1 records and publishable fields require manual review.

## Evidence completeness gate

A record fails P0 evidence acceptance if any applies:

- source approval is absent/expired;
- URL/access point or capture time is missing;
- screenshot/payload/reference is unavailable;
- hash is missing or mismatched;
- a publishable field has no evidence link;
- a high-risk field lacks exact quote/value/location;
- adapter/parser version is absent when applicable;
- reviewer, decision, approval time, or record version is missing at approval;
- prior evidence/version was overwritten;
- credentials or uncontrolled personal data are present.

## Retention and backup boundary

Evidence, manifests, review decisions, record versions, publication batches, and rollback references must be included in backup and restore verification. Exact retention duration, backup destination, legal hold, and takedown handling remain open under D-019 for later Owner approval. No evidence store or Windows directory is created by this standard.

