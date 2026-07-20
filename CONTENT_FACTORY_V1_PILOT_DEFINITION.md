# Content Factory V1 Pilot Definition

## Pilot objective

Demonstrate, with a deliberately small Thai property-project set, that GoThailandHome can produce human-approved, evidence-backed, versioned, duplicate-controlled publication packages and reverse them safely. The pilot tests governance and traceability, not volume.

No source or project is selected in this planning task. The Human Owner supplies and approves the final manifest after rights/method review; no live web research is authorized.

## Recommended source types

Choose 1–2 sources total, preferably:

1. an official developer website or owner-authorized structured project file for project identity and attributes; and
2. where necessary, a legally accessible official/government page or owner-authorized second source for location or official-status corroboration.

A single high-quality official source is acceptable if it covers the 5–10 projects and all required evidence. Prefer stable HTML, CSV/XLSX, or text-based PDF. Manual upload is preferred when it provides clearer permission and deterministic evidence.

## Source selection criteria

Every source must have:

- identifiable owner/publisher and stable canonical location;
- legal public access or documented owner authorization;
- an approved collection method that requires no bypass;
- terms/rights posture recorded for collection, retention, quotation, and publication;
- attributable evidence at page, section, row/cell, or character range;
- enough project coverage without broad crawling;
- stable structure or manually controlled files;
- relevant, current dates or an explicit “as of” date;
- predictable refresh and takedown contact/process;
- no need for personal data;
- owner approval before collection.

## Source exclusions

Exclude:

- login/paywall/CAPTCHA-protected or access-controlled sources;
- sources whose terms, robots policy, copyright, or publication rights are unresolved;
- aggregators, user-generated listings, social posts, forums, copied catalogs, or unattributable datasets;
- sources requiring evasion, high-rate crawling, discovery crawling, or unstable browser automation;
- bulk sources chosen merely for volume;
- sources dominated by personal agent/owner contact data;
- image-only/scanned sources unless OCR is justified and approved;
- sources with no stable evidence retention path;
- sources likely to create regulated investment, legal, or ownership claims beyond pilot review capacity.

## Target geography and project types

- **Geography:** One owner-approved Thai market area (one province or one coherent metro area) to reduce location ambiguity.
- **Project types:** New-development residential condominium or housing projects represented as project profiles. Do not mix resale listings, land, commercial, hotel, rental, or individual owner listings in V1.
- **Projects:** Minimum 5, maximum 10.
- **Records:** Maximum 100 combined canonical project/property records, including unit/property children if included. Recommended first run: project-level records only.

## Minimum required fields

No field may be fabricated. Unknown optional fields remain explicitly unknown.

| Field | Requirement | Evidence |
| --- | --- | --- |
| `record_id`, `record_version` | System-generated stable ID/version | Audit/version event |
| `record_type` | `project` (or approved `property` child) | Contract |
| `project_name_original` | Required | Exact source location/quote |
| `project_name_normalized` | Required | Original + rule version |
| `developer_name_original` | Required | Exact source location/quote |
| `developer_name_normalized` | Required | Original + rule version |
| `country_code` | Required, `TH` | Source/location evidence |
| `province` and approved locality | Required | Exact source location |
| `project_type` | Required controlled value | Source evidence |
| `source_id`, `canonical_url/file_ref` | Required | Source registry |
| `source_external_id` | Required when source supplies one; otherwise explicit null | Source location |
| `source_published_at/source_updated_at` | Required when supplied; otherwise null | Source metadata |
| `collected_at`, `content_hash`, `payload_uri/reference` | Required | Raw evidence manifest |
| `rights_snapshot` | Required | Approved source policy/version |
| `evidence_locations` | Required for every publishable fact | Page/section/row/cell/character reference and quote/value |
| `review_status`, `review_decision_id` | Required before package inclusion | Immutable human decision |

Price, currency, availability, completion date, unit count, tenure, and official status are optional pilot fields. If present, each is high-risk, time-stamped, source-backed, and explicitly human-approved; price must include currency and price basis.

## Evidence requirements

- Preserve the original approved payload or an immutable retained snapshot/reference permitted by source policy.
- Compute SHA-256 at intake and on restore.
- Record source, collection job, canonical URL/file, capture time, MIME type, rights snapshot, parser/rule versions, and citeable location.
- Link each publishable field to evidence; record-level citations alone are insufficient for high-risk fields.
- Retain old evidence and object versions after refresh, correction, rejection, supersession, and rollback.
- Never store credentials or unnecessary personal data in evidence.

## Refresh policy

- No unattended broad refresh during the first run.
- Default pilot refresh: manual, once before review and once only if the owner requests a change test.
- Before refresh, revalidate source approval and compare content hashes.
- Unchanged payload: log no-change; do not create duplicate canonical content.
- Changed payload: create a raw version, reparse affected fields, reopen review, and preserve the prior approved package.
- Time-sensitive fields display/retain “as of” time and are never assumed current.

## Duplicate handling

1. Block exact duplicate payload hashes and duplicate source external IDs from creating new canonical records.
2. Match canonical URLs.
3. Flag deterministic candidates using normalized project name + developer + approved geography.
4. Require human resolution: merge, keep separate, or false positive.
5. Preserve all source evidence and aliases when merged.
6. Do not use embeddings in V1.

## Human reviewer role

The named reviewer:

- confirms source and method approval;
- compares every P0 field and every high-risk optional field to retained evidence;
- resolves duplicates and conflicts;
- marks unsupported values unknown/rejected;
- records immutable decisions with reason and target version;
- certifies package readiness.

The Human Owner separately approves sources, standard, Windows deployment, and pilot publication. One person may hold both roles, but both decision types must be recorded.

## Publication target

GoThailandHome is the sole target. V1 produces one versioned property-project package through a non-production adapter fixture during Feature Freeze. No direct database write, page modification, release operation, or automatic production publish is permitted.

## Rollback process

1. Record the prior approved package pointer/hash and visible baseline.
2. Build and validate a new immutable package.
3. In staging, atomically switch the package pointer.
4. Verify expected records/citations and logs.
5. Roll back to the previous pointer (or remove the pilot package).
6. Verify restored output/hash within the agreed recovery target.
7. Retain both versions and record actor, reason, timestamps, and result.
8. A failed rehearsal blocks publication.

## Pilot success metrics

- 1–2 approved sources only; 5–10 projects; <=100 records.
- 100% of collected items have source policy, rights snapshot, hash, timestamp, and immutable evidence/reference.
- 100% of published fields are traceable; 100% of high-risk fields have explicit human approval.
- 100% of package records have passed P0 validation and duplicate resolution.
- 0 unresolved critical conflicts, missing evidence items, or open mandatory reviews.
- 100% deterministic rebuild: unchanged approved inputs produce the same package hash.
- Parser success >=95% for in-scope records; failures are quarantined, never silently dropped.
- Collector/ingestion jobs are idempotent in the test suite.
- Backup restore reproduces all sampled evidence hashes.
- Rollback rehearsal restores the prior package within 15 minutes.
- 0 production website/database changes and 0 cross-project data/credential incidents.
- Reviewer workload and cycle time are measured for scale decision; no automatic threshold implies scale-up.

## Pilot failure conditions

Immediate NO-GO/HOLD if any occurs:

- unapproved or legally ambiguous source/method;
- source/project/record limit exceeded;
- evidence cannot be retained/referenced or hash verified;
- fabricated/inferred unsupported value;
- unresolved critical identity, duplicate, price, currency, availability, ownership, or status conflict;
- missing human approval or mutable/lost decision history;
- production website/database access during Feature Freeze;
- credential exposure, cross-project contamination, or uncontained personal data;
- failed backup restore or rollback rehearsal;
- Windows 01 cannot meet isolation, security, health, capacity, or removal requirements;
- any P0 acceptance criterion fails.

