# Property Adapter Contract V1

**Status:** Sprint 1 logical contract only  
**Authorization:** No adapter, collector, parser, live connection, database write, or deployment is authorized

## Purpose and boundary

Define the deterministic handoff from one approved source payload/evidence item to a candidate normalized property-project record. The adapter does not approve facts, merge uncertain duplicates, publish content, or write to the production database.

## Contract version

- Contract ID: `property-adapter-contract-v1`
- Every request and result carries the contract version and a source-specific adapter version.
- A breaking field/meaning change requires a new contract version and G2/G3 review.

## Input

| Input | Required | Rule |
| --- | --- | --- |
| `request_id` | Yes | Unique correlation ID |
| `source_id` | Yes | Must resolve to approved, unexpired source |
| `source_approval_version` | Yes | Exact approval/rights policy version |
| `source_external_id` | No | Preserve exactly when supplied |
| `source_url_or_access_point` | Yes | Must match approved source/method |
| `capture_time` | Yes | UTC ISO 8601 |
| `raw_payload_reference` | Yes | Immutable payload/snapshot/reference; no embedded credential |
| `raw_payload_hash` | Yes | SHA-256 |
| `evidence_reference` | Yes | Evidence object and citeable location capability |
| `content_type` | Yes | Approved source format/MIME |
| `adapter_version` | Yes | Pinned source-specific adapter version |
| `contract_version` | Yes | Exactly `property-adapter-contract-v1` |
| `attempt_number` | Yes | Integer >=1 |
| `idempotency_key` | Yes | Stable for same source, payload hash, adapter version, and requested operation |

Inputs outside the approved source, method, format, geography, project type, or pilot limits fail validation before transformation.

## Output

One request returns one result envelope:

| Output | Required | Rule |
| --- | --- | --- |
| `request_id` | Yes | Echo input correlation |
| `result_status` | Yes | `success`, `validation_failed`, `processing_failed`, `quarantined`, or `no_change` |
| `contract_version` / `adapter_version` | Yes | Exact versions used |
| `source_id` / `raw_payload_reference` / `raw_payload_hash` | Yes | Preserve input lineage |
| `evidence_references` | Yes | Field-addressable evidence IDs/locations |
| `normalized_output` | Conditional | Candidate record conforming to frozen dictionary on success |
| `validation_result` | Yes | Per-rule pass/fail and errors |
| `error_result` | Conditional | Required for any non-success except `no_change` |
| `idempotency_key` | Yes | Echo stable key |
| `output_hash` | Conditional | Required for normalized output |
| `started_at` / `finished_at` | Yes | UTC timestamps |

The normalized output preserves original and normalized values. It is a candidate, never an approval.

## Validation

Validation occurs in this order:

1. Contract envelope and version.
2. Source approval, allowed access method, and rights snapshot.
3. Pilot boundary: Bangkok, new condominium projects, <=2 sources, <=10 projects, <=100 records.
4. Payload reference, SHA-256 integrity, capture time, and evidence availability.
5. Required field presence/types and null/status pairing.
6. Price/currency/as-of/evidence invariants.
7. Completion, area/unit, and geography controlled rules.
8. Freshness calculation.
9. Duplicate signals; uncertain candidates route to manual review.
10. Output lineage and deterministic output hash.

A P0 failure prevents success and downstream approval.

## Error contract

Every error includes:

- stable error code;
- severity: `blocking` or `warning`;
- stage and field when applicable;
- human-readable message without credentials/payload leakage;
- retryability: `retryable` or `non_retryable`;
- source/request/evidence correlation IDs;
- adapter and contract versions;
- timestamp;
- quarantine/reference status.

Minimum error classes:

- `SOURCE_NOT_APPROVED`
- `ACCESS_METHOD_NOT_APPROVED`
- `PAYLOAD_UNAVAILABLE`
- `PAYLOAD_HASH_MISMATCH`
- `EVIDENCE_MISSING`
- `CONTRACT_VERSION_UNSUPPORTED`
- `INPUT_VALIDATION_FAILED`
- `NORMALIZATION_FAILED`
- `PRICE_CURRENCY_INVALID`
- `FRESHNESS_INVALID`
- `DUPLICATE_REVIEW_REQUIRED`
- `PILOT_LIMIT_EXCEEDED`
- `INTERNAL_PROCESSING_FAILED`

Errors never expose secrets and never silently drop a record.

## Retry safety

- Retry only errors explicitly marked `retryable`.
- Use the same idempotency key for the same logical input and adapter version.
- Retries cannot overwrite evidence, output, review decisions, or prior errors.
- Enforce a future approved bounded attempt count; the exact runtime count is not frozen here.
- Non-retryable policy, rights, evidence, validation, duplicate-review, and pilot-limit failures require human action.
- A changed payload or adapter version is a new logical operation and version, not a retry.

## Idempotency

Recommended logical key inputs:

`source_id + source_external_id/canonical access point + raw_payload_hash + adapter_version + contract_version`

For identical valid input:

- repeated processing produces byte-equivalent canonical normalized output and the same output hash;
- no second canonical project is created;
- the result is returned/referenced as existing or `no_change`;
- attempt/audit events may append without changing the canonical result.

Idempotency does not merge uncertain duplicates across different sources or identities.

## Evidence reference

Every normalized source-derived field must map to:

- evidence ID;
- source ID;
- raw payload reference/hash;
- exact quote/value and citeable location;
- capture time;
- adapter version.

Missing evidence is a blocking error. AI output is not evidence.

## Review and publication boundary

- Adapter output enters `candidate`.
- One hundred percent manual review remains mandatory.
- Only a human can approve the exact record version.
- A separate human approval tied to an exact package version/hash is required before publication.
- GoThailandHome is the sole future target; no live adapter implementation or publication is authorized.

