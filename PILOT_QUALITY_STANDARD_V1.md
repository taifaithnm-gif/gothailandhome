# Pilot Quality Standard V1

**Status:** Sprint 4 planning only  
**Purpose:** Freeze quality dimensions that every pilot record and package must satisfy

## Quality principles

1. Evidence before approval
2. No fabrication
3. Deterministic validation
4. 100% human review
5. Append-only versions and decisions
6. Fail closed on P0 defects

## Required fields

Minimum quality coverage follows `PROPERTY_DATA_STANDARD_V1.md` and `PROPERTY_FIELD_DICTIONARY_V1.md`.

Required categories for every pilot record:

| Category | Quality rule |
| --- | --- |
| Project identity | Original + normalized names present and evidence-linked |
| Developer | Original + normalized names present and evidence-linked |
| Location | `TH` + Bangkok; locality only when source-backed |
| Property type | Exactly `new_condominium_project` |
| Price / currency | If present: value/basis/currency/as-of/evidence/human approval; currency never inferred |
| Area / bedroom / bathroom / parking | Present as value or explicit `not_provided` status |
| Completion status | Controlled status + source-backed original text |
| Source | Approved source ID, name, access point |
| Evidence | Non-empty evidence IDs for every publishable field |
| Capture / verification time | Valid UTC; drives freshness |
| Review status / version | Exact state and monotonic version |

A missing required category or invalid null handling is a P0 quality failure.

## Evidence integrity

| Check | Pass condition |
| --- | --- |
| Retention | Payload/snapshot/reference retrievable |
| Hash | SHA-256 matches at capture, restore, and audit sampling |
| Rights | Rights/approval snapshot present and unexpired |
| Location | High-risk fields have exact quote/value and citeable location |
| Immutability | Corrections create new evidence/version; no silent overwrite |
| Secrets | No credentials or uncontrolled personal data in evidence |

Any hash mismatch, missing evidence, or rights uncertainty quarantines the record.

## Traceability

Every publishable field must reconstruct:

```text
field value
  -> evidence ID / location / quote
  -> source ID / access point / capture time
  -> adapter/parser/rule version
  -> record version
  -> human decision ID / reviewer / timestamp
  -> package/batch ID (when packaged)
  -> rollback reference (before release)
```

Traceability threshold: **100%**. Record-level citation alone is insufficient for high-risk fields.

## Consistency

| Domain | Consistency rule |
| --- | --- |
| Geography | Bangkok only; no inferred district/subdistrict |
| Type | New condominium only; excluded types fail |
| Price | Currency, basis, and as-of context agree |
| Freshness | Status matches elapsed age from `last_verified_at` |
| Versions | Prior version retained when `record_version > 1` |
| Duplicates | Identity keys and human resolutions agree across members |
| Package | Included records are exact approved versions only |

Internal contradictions (`conflicted` price/status, mismatched freshness, unresolved duplicates) block approval.

## Completeness

Completeness is measured at three layers:

1. **Record completeness** — all required categories present with valid null/status pairing  
2. **Evidence completeness** — every publishable field linked to retained evidence  
3. **Workflow completeness** — intake, fact, freshness, duplicate, and publish reviews complete for the exact version

Package completeness additionally requires:

- ≤2 sources, 5–10 projects, ≤100 records
- Deterministic package hash
- Attribution / citations
- Human package approval
- Rollback readiness

## Quality grades (informational)

| Grade | Meaning | Package eligibility |
| --- | --- | --- |
| Q-PASS | All P0 quality checks pass | Eligible for publication approval workflow |
| Q-HOLD | Remediable P0 defect or open review | Not eligible |
| Q-FAIL | Material incorrectness, rights failure, integrity failure, or limit breach | Reject / quarantine / stop |

Grades do not replace formal review decisions.

## Non-waivable quality stops

- Fabricated or inferred unsupported values
- Missing evidence or hash failure
- Uncertain automatic duplicate merge
- Current price/availability presented after 30 days without re-verification
- Approval without human decision
- Cross-project contamination or credential exposure
- Exceeded source/project/record limits
