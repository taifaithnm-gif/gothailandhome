# Property Freshness Standard V1

**Status:** Sprint 1 frozen logical freshness rule; no scheduler or live refresh  
**Clock basis:** Elapsed calendar days from `last_verified_at` to evaluation time, using UTC

## Freshness states

| State | Age | Meaning | Allowed treatment |
| --- | --- | --- | --- |
| `fresh` | 0–30 days inclusive | A human verified the exact record version against approved evidence within 30 days | May be considered current only if review/approval and all other gates pass |
| `warning` | 31–90 days inclusive | Verification is older than the current-claim limit | May remain historical/contextual with visible “as of” date; must not present price or availability as current |
| `expired` | More than 90 days | Evidence is too old for active/current representation | Block from current presentation and publication until re-verified |

Future-dated or missing verification times are invalid, not fresh.

## Required freshness fields

- `capture_time`
- `last_verified_at`
- `freshness_status`
- `source_published_at` when supplied
- `source_updated_at` when supplied
- `price_as_of` when price is present
- record version and evidence IDs used in verification
- reviewer and decision reference

## Calculation

1. Initial `last_verified_at` is the time a human verifies the captured evidence, not merely collection time.
2. Compute age from `last_verified_at`; do not reset age because a record was viewed, exported, or republished.
3. A material source change creates a new evidence/record version and requires re-verification.
4. If source date and capture/verification date conflict, preserve all dates and route the record for review.
5. Status is deterministic and must be recalculated at evaluation/package time.

## Price and availability rule

- Price, currency/basis, and availability are time-sensitive high-risk facts.
- After 30 elapsed days without re-verification, they must not be labeled, implied, sorted, filtered, or presented as current.
- A warning record may retain historical price with explicit source and “as of” date only if the future publishing policy permits it and a human approves the exact presentation.
- An expired record cannot be included as current content.
- Unknown availability is not “available”; missing price is not zero or “contact for price” unless the approved source explicitly states that value.

## Refresh policy

- V1 refresh is manual; no unattended refresh is authorized.
- Confirm source approval is active before re-verification.
- Capture a new payload/snapshot/reference and hash when source content changed.
- Unchanged source content records a no-change verification event without creating a duplicate record.
- Changed content creates new evidence and record versions and reopens fact/duplicate/publish review as applicable.
- Preserve prior versions and publication/rollback references.

## Stop and failure conditions

Block current presentation/package approval if:

- `capture_time`, `last_verified_at`, or `freshness_status` is missing/invalid;
- freshness status does not match elapsed age;
- price/current availability is older than 30 days without re-verification;
- source approval expired or rights/access changed;
- evidence changed but record version/review did not;
- the record is `expired`;
- date conflict is unresolved.

## Verification cases

| Age since verification | Expected |
| --- | --- |
| 0 days | `fresh` |
| 30 days | `fresh` |
| 31 days | `warning`; no current price/availability |
| 90 days | `warning`; no current price/availability |
| 91 days | `expired`; block current publication |

This standard defines no runtime schedule, collector, database field, or Windows 01 job.

