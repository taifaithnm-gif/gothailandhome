# Content Factory V1 Source Approval Template

**Purpose:** Reusable G1 form for one candidate source. Complete one copy per source.  
**Important:** Completing this form does not authorize collection. The Human Owner must record an approval result and the source must appear in an approved pilot manifest.

## Source identity

| Field | Entry |
| --- | --- |
| Source approval ID | |
| Source name | |
| Source owner/operator | |
| Source URL or access point | |
| Source type | _Official developer website / Government website / Owner-authorized file / API / Other_ |
| Geographic coverage | |
| Data type | _Project profiles / Structured rows / Documents / Other_ |
| Source language(s) | |
| Candidate pilot use | |

## Access and rights review

| Field | Entry |
| --- | --- |
| Access method | _Manual upload / Approved page fetch / File import / Approved API / Other_ |
| Public or authorization basis | |
| Terms-of-use review status | _Reviewed-allowed / Reviewed-conditional / Prohibited / Unclear / Not applicable with reason_ |
| Terms reviewed by/date/version or captured URL | |
| Robots/API/access restriction status | _Allowed / Conditional / Prohibited / Unclear / Not applicable_ |
| Authentication required | _No / Yes — credential reference only_ |
| Rate or request limits | |
| Attribution requirement | |
| Retention/citation/publication rights | |
| Takedown/contact path | |

## Data and evidence assessment

| Field | Entry |
| --- | --- |
| Update frequency | |
| Source published/updated dates available | _Yes / Partial / No_ |
| Evidence capture method | _Immutable payload / Permitted snapshot / Stable reference + extracted evidence / Other_ |
| Citeable location method | _Page / Section / Row-cell / Character range / Exact quote-value / Other_ |
| SHA-256 and rights snapshot possible | _Yes / No / Conditional_ |
| Expected data quality | _High / Medium / Low_ |
| Expected record volume | |
| Estimated projects within pilot | |
| Required parser format | |
| OCR required | _No / Possibly / Yes — requires D-020 and G4_ |
| Personal-data exposure | _None expected / Incidental / Material_ |
| Personal-data handling/exclusion | |

## Risk and suitability assessment

| Field | Entry |
| --- | --- |
| Legal/compliance concerns | |
| Technical difficulty | _Low / Medium / High_ |
| Access stability | _Stable / Variable / Unstable / Unknown_ |
| Attribution quality | _Clear / Conditional / Missing_ |
| Evidence retention feasibility | _Yes / Conditional / No_ |
| Pilot suitability | _Suitable / Suitable with conditions / Not suitable_ |
| Risks mapped to V1 register | |
| Required conditions/controls | |

## Mandatory rejection criteria

Mark each `PASS` or `REJECT`. Any `REJECT` makes the source ineligible unless the underlying fact changes and a new approval is completed.

| Criterion | Result | Evidence / notes |
| --- | --- | --- |
| Ownership/operator is clear | _PASS / REJECT — unclear ownership_ | |
| Proposed access is allowed | _PASS / REJECT — prohibited automated access_ | |
| Attribution path exists | _PASS / REJECT — missing attribution path_ | |
| Information is verifiable | _PASS / REJECT — unverifiable information_ | |
| Personal data is absent/minimal and controllable | _PASS / REJECT — excessive personal data_ | |
| Access is stable enough for the pilot | _PASS / REJECT — unstable access_ | |
| Legal/compliance risk is acceptable and controlled | _PASS / REJECT — high legal risk_ | |
| Evidence can be retained or referenced immutably | _PASS / REJECT — no evidence-retention method_ | |

Also reject any source that requires access-control evasion, CAPTCHA bypass, credential sharing, broad discovery crawling, or collection outside the approved method.

## Approval result

**Result (select one):** `APPROVED / CONDITIONAL / REJECTED`

| Field | Entry |
| --- | --- |
| Owner approver | |
| Approval date | _YYYY-MM-DD_ |
| Conditions | |
| Approved access method | |
| Approved data types/fields | |
| Approved geography | |
| Maximum records from this source | |
| Attribution wording/rule | |
| Evidence/retention rule | |
| Review expiry date | _YYYY-MM-DD_ |
| Re-review triggers | _Terms/access/ownership/structure/rights change; expiry; incident; other_ |

## Gate check

- [ ] No live collection occurred during this assessment.
- [ ] Approval result is signed by the Human Owner.
- [ ] Conditional controls are testable.
- [ ] Source count remains at or below the approved V1 maximum.
- [ ] Source is added to the pilot manifest only after approval.
- [ ] Collection remains NO-GO until G1, G2, G4 (if Windows is used), and G5 are complete.

