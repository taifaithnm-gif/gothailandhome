# Review Checklist V1

**Status:** Sprint 2 frozen mandatory checklist; no implementation  
**Completion rule:** Every P0 item must be `PASS` or the record cannot advance. `N/A` requires a written evidence-backed reason.

## Review header

| Field | Entry |
| --- | --- |
| Review task ID | |
| Record ID/version | |
| Evidence version(s) | |
| Review stage | |
| Human reviewer reference/role | |
| Started/completed at | |
| Prior decision references | |

## A. Intake review

| ID | Pri | Check | Result | Evidence/notes |
| --- | --- | --- | --- | --- |
| IN-01 | P0 | Source is approved, unexpired, and within maximum-two-source manifest | _PASS/FAIL_ | |
| IN-02 | P0 | Owner/operator, access method, rights, attribution and retention path are recorded | _PASS/FAIL_ | |
| IN-03 | P0 | Record is Bangkok and `new_condominium_project`; excluded listing/property types are absent | _PASS/FAIL_ | |
| IN-04 | P0 | Project and record caps are not exceeded | _PASS/FAIL_ | |
| IN-05 | P0 | Raw payload/screenshot/reference is retrievable and SHA-256 matches | _PASS/FAIL_ | |
| IN-06 | P0 | URL/access point, capture time, adapter/parser versions and rights snapshot exist | _PASS/FAIL_ | |
| IN-07 | P0 | No credentials or uncontrolled personal data appear in evidence/output/log references | _PASS/FAIL_ | |
| IN-08 | P0 | Validation result is complete; no silent processing failure | _PASS/FAIL_ | |

## B. Fact review

| ID | Pri | Check | Result | Evidence/notes |
| --- | --- | --- | --- | --- |
| FA-01 | P0 | Project original/normalized names and developer original/normalized names match evidence and rule version | _PASS/FAIL_ | |
| FA-02 | P0 | Bangkok location and new-condominium type are source-backed; no inferred geography | _PASS/FAIL_ | |
| FA-03 | P0 | Price status/value/range/basis, currency and as-of context are internally consistent and exactly evidenced | _PASS/FAIL/N/A_ | |
| FA-04 | P0 | Currency is explicit and not inferred | _PASS/FAIL/N/A_ | |
| FA-05 | P0 | Area, bedroom, bathroom and parking originals/status/normalized values match evidence or explicit null status | _PASS/FAIL_ | |
| FA-06 | P0 | Completion original/status/date matches exact source evidence; marketing wording is not promoted to fact | _PASS/FAIL_ | |
| FA-07 | P0 | Every source-derived field maps to evidence ID, exact value/location, source and capture time | _PASS/FAIL_ | |
| FA-08 | P0 | Original values are preserved; normalized values cite deterministic rule/version | _PASS/FAIL_ | |
| FA-09 | P0 | Unknown/null is not represented as zero, unavailable, sold out or another unsupported value | _PASS/FAIL_ | |
| FA-10 | P0 | Record/evidence/adapter/normalization versions are complete and prior version retained | _PASS/FAIL_ | |

## C. Freshness review

| ID | Pri | Check | Result | Evidence/notes |
| --- | --- | --- | --- | --- |
| FR-01 | P0 | Capture time and last verified time are valid UTC values | _PASS/FAIL_ | |
| FR-02 | P0 | Freshness state matches elapsed age: 0–30 fresh, 31–90 warning, >90 expired | _PASS/FAIL_ | |
| FR-03 | P0 | Price/current availability older than 30 days is not represented as current | _PASS/FAIL/N/A_ | |
| FR-04 | P0 | Source/evidence change created a new version and reopened review | _PASS/FAIL/N/A_ | |
| FR-05 | P0 | Expired record is blocked from current publication | _PASS/FAIL/N/A_ | |

## D. Duplicate review

| ID | Pri | Check | Result | Evidence/notes |
| --- | --- | --- | --- | --- |
| DU-01 | P0 | Hash, source external ID and canonical URL duplicate results were reviewed | _PASS/FAIL_ | |
| DU-02 | P0 | Normalized developer + project + Bangkok location candidates were reviewed | _PASS/FAIL_ | |
| DU-03 | P0 | Phase/tower/building differences and conflicting identity evidence were preserved | _PASS/FAIL/N/A_ | |
| DU-04 | P0 | Every group has human `merge`, `keep_separate`, or `false_positive`; no `needs_more_evidence` remains | _PASS/FAIL_ | |
| DU-05 | P0 | No uncertain match was automatically merged | _PASS/FAIL_ | |
| DU-06 | P0 | Merge preserves all members, aliases, versions, evidence and decisions | _PASS/FAIL/N/A_ | |

## E. Publish review

| ID | Pri | Check | Result | Evidence/notes |
| --- | --- | --- | --- | --- |
| PU-01 | P0 | Intake, fact, freshness and duplicate reviews are complete for exact record version | _PASS/FAIL_ | |
| PU-02 | P0 | No open mandatory task, P0 failure, conflict, unknown rights status or quarantine | _PASS/FAIL_ | |
| PU-03 | P0 | Attribution and field-level citations are complete | _PASS/FAIL_ | |
| PU-04 | P0 | Record is eligible only for GoThailandHome and no third-party syndication | _PASS/FAIL_ | |
| PU-05 | P0 | Package/batch version, content hash, approved record versions and prior-state rollback reference are identified | _PASS/FAIL_ | |
| PU-06 | P0 | Separate final human approver and rollback owner/witness requirements are satisfied | _PASS/FAIL_ | |
| PU-07 | P0 | Publication is not attempted while Feature Freeze/G6 remains unresolved | _PASS/FAIL_ | |

## F. Decision

Select exactly one:

- [ ] `approve_stage`
- [ ] `change_requested`
- [ ] `rejected`
- [ ] `quarantined`
- [ ] `reopen`

Required:

| Field | Entry |
| --- | --- |
| Reason code | |
| Comment | |
| Evidence viewed | |
| From/to state | |
| Target record/evidence version | |
| Human reviewer reference/sign-off | |
| Decision timestamp | |

AI may prepare a checklist recommendation or flag missing items. AI may not select/sign the final decision, advance state, approve publication, or approve rollback.

