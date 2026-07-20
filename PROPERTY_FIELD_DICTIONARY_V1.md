# Property Field Dictionary V1

**Status:** Sprint 1 frozen logical dictionary; no schema or implementation  
**Notation:** ISO 8601 UTC timestamps; ISO 4217 currencies; decimal numbers use dot notation. Examples are synthetic placeholders, not live data.

`Required = Yes` means the field must exist. A nullable required-category field is present with `null` plus its associated status/reason; null is never silently omitted.

| Field Name | Description | Type | Required | Validation Rule | Example | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `record_id` | Stable canonical pilot record identifier | string | Yes | Non-empty; immutable; unique in pilot | `project_0001` | System-assigned; not source identity |
| `record_type` | Canonical object type | enum | Yes | Exactly `project` | `project` | V1 is project-level |
| `project_name_original` | Project name exactly as source presents it | string | Yes | Non-blank; evidence-linked | `Example Residence` | Preserve spelling/case |
| `project_name_normalized` | Deterministic matching/display form | string | Yes | Derived from original using recorded rule version; non-blank | `example residence` | Never replaces original |
| `developer_name_original` | Developer name exactly as source presents it | string | Yes | Non-blank; evidence-linked | `Example Development Co., Ltd.` | |
| `developer_name_normalized` | Deterministic developer matching form | string | Yes | Derived using recorded rule version; non-blank | `example development` | Legal suffix handling must be rule-based |
| `country_code` | Country | string | Yes | Exactly `TH` | `TH` | ISO 3166-1 alpha-2 |
| `province` | Approved province/metro boundary | string | Yes | Exactly `Bangkok` for V1 | `Bangkok` | Owner decision D-002 |
| `district` | Bangkok district if source provides it | string/null | No | Source-backed; trimmed; no inferred district | `Watthana` | Null if absent |
| `subdistrict` | Bangkok subdistrict if source provides it | string/null | No | Source-backed; trimmed | `Khlong Tan Nuea` | Null if absent |
| `address_original` | Source address/location text | string/null | No | Evidence-linked when present | `Synthetic address text` | Do not geocode/infer in Sprint 1 |
| `property_type` | Controlled property/project type | enum | Yes | Exactly `new_condominium_project` | `new_condominium_project` | All excluded types fail validation |
| `price_status` | Whether usable price information is supplied | enum | Yes | `provided`, `not_provided`, `not_current`, or `conflicted` | `provided` | `conflicted` blocks approval |
| `price_original` | Exact source price text/value | string/null | Yes | Required non-null when `price_status=provided`; evidence-linked | `From 3,000,000 THB` | Synthetic |
| `price_min` | Minimum normalized price | decimal/null | No | >=0; requires currency/basis/as-of/evidence | `3000000.00` | No silent rounding |
| `price_max` | Maximum normalized price | decimal/null | No | >=`price_min`; same currency/basis | `5000000.00` | Null if source gives no maximum |
| `price_basis` | Meaning of price | enum/null | No | `starting_from`, `range`, `fixed`, `per_unit`, `per_sqm`, `other_source_stated` | `starting_from` | Required if price is present |
| `currency` | Price currency | string/null | Conditional | Required when any price value exists; ISO 4217; never inferred | `THB` | Evidence must support currency |
| `price_as_of` | Source date/time for price | datetime/null | Conditional | Required when source supplies date; otherwise capture time is used and limitation noted | `2026-07-18T00:00:00Z` | Price cannot be “current” after 30 days unverified |
| `area_original` | Exact source area text | string/null | Yes | Present as value or null | `28–45 sq m` | Synthetic |
| `area_min_sqm` | Minimum normalized unit area | decimal/null | No | >0 when present; source-backed | `28.0` | Square metres only after explicit conversion |
| `area_max_sqm` | Maximum normalized unit area | decimal/null | No | >= minimum | `45.0` | |
| `area_status` | Area availability/quality | enum | Yes | `provided`, `not_provided`, or `conflicted` | `provided` | Conflict blocks approval |
| `bedroom_original` | Exact source bedroom text | string/null | Yes | Present as value or null | `1–2 bedrooms` | Synthetic |
| `bedroom_options` | Normalized bedroom options | array<decimal>/null | No | Non-negative; unique sorted values; source-backed | `[1,2]` | Studio may be `0` only if source supports it |
| `bedroom_status` | Bedroom availability/quality | enum | Yes | `provided`, `not_provided`, or `conflicted` | `provided` | |
| `bathroom_original` | Exact source bathroom text | string/null | Yes | Present as value or null | `1 bathroom` | Synthetic |
| `bathroom_options` | Normalized bathroom options | array<decimal>/null | No | >0; unique sorted values; source-backed | `[1]` | |
| `bathroom_status` | Bathroom availability/quality | enum | Yes | `provided`, `not_provided`, or `conflicted` | `provided` | |
| `parking_original` | Exact source parking text | string/null | Yes | Present as value or null | `Parking subject to project policy` | Synthetic |
| `parking_value` | Normalized parking value/rule | decimal/string/null | No | Must state basis; no inferred allocation | `subject_to_policy` | |
| `parking_basis` | Meaning of parking value | enum/null | No | `spaces_per_unit`, `percentage_of_units`, `shared_policy`, `source_stated_other` | `shared_policy` | |
| `parking_status` | Parking availability/quality | enum | Yes | `provided`, `not_provided`, or `conflicted` | `provided` | |
| `completion_status_original` | Exact construction/completion text | string | Yes | Non-blank; evidence-linked | `Under construction` | Synthetic |
| `completion_status` | Normalized completion state | enum | Yes | `pre_launch`, `under_construction`, `completed`, `completion_status_unknown` | `under_construction` | Marketing wording does not create a state |
| `completion_expected_at` | Expected completion date if supplied | date/null | No | Valid ISO date; evidence-linked; future date does not imply guarantee | `2027-12-31` | |
| `source_id` | Approved internal source identifier | string | Yes | Must reference an approved, unexpired source form | `source_01` | Maximum two sources in pilot |
| `source_name` | Approved source display name | string | Yes | Must match source approval record | `Approved Source Placeholder` | Synthetic placeholder |
| `source_url_or_access_point` | Canonical source URL/file access point | string | Yes | Valid approved URL/reference; no credentials | `https://example.invalid/project` | Reserved synthetic domain |
| `source_external_id` | Source-specific stable project ID | string/null | No | Preserve exactly; unique within source when present | `external-001` | Duplicate signal |
| `source_published_at` | Source publication date/time | datetime/null | No | ISO 8601; source-backed | `2026-07-01T00:00:00Z` | |
| `source_updated_at` | Source update date/time | datetime/null | No | ISO 8601; source-backed | `2026-07-15T00:00:00Z` | |
| `evidence_ids` | Evidence objects supporting the record | array<string> | Yes | Non-empty; every publishable field maps to at least one evidence ID | `["evidence_0001"]` | High-risk fields require exact location/value |
| `capture_time` | Time source evidence was captured | datetime | Yes | UTC ISO 8601; not in future | `2026-07-18T00:00:00Z` | |
| `last_verified_at` | Latest manual verification against evidence/source | datetime | Yes | UTC; >= capture time for initial record | `2026-07-18T01:00:00Z` | Drives freshness |
| `freshness_status` | Age band since last verification | enum | Yes | `fresh`, `warning`, or `expired`; computed by frozen rule | `fresh` | Current price/availability allowed only while fresh |
| `review_status` | Current manual workflow state | enum | Yes | One state frozen in data standard | `approved` | `approved` requires complete decision |
| `reviewer_id` | Human reviewer reference | string/null | Conditional | Required for reviewed/approved states; must not identify AI | `reviewer_ref_01` | No name frozen in Sprint 1 |
| `review_decision_id` | Immutable decision reference | string/null | Conditional | Required for approved/rejected/change-requested states | `decision_0001` | |
| `approval_timestamp` | Time exact record version was approved | datetime/null | Conditional | Required for `approved`/`publish_ready` | `2026-07-18T02:00:00Z` | |
| `record_version` | Monotonic record version | integer | Yes | Integer >=1; increment on material change | `1` | No overwrite |
| `prior_record_version_ref` | Previous immutable version reference | string/null | No | Required when `record_version>1` | `project_0001:v1` | |
| `adapter_version` | Logical adapter contract/version that produced normalized output | string | Yes | Version identifier; non-blank | `property-adapter-contract-v1` | Does not imply live adapter |
| `normalization_rule_version` | Rules used for normalization | string | Yes | Version identifier; non-blank | `property-normalization-v1` | |
| `publication_batch_id` | Batch that includes exact approved version | string/null | No | Must be null before publication; batch must reference approved version | `null` | Publication remains unauthorized |
| `rollback_reference` | Prior approved state/package reference | string/null | No | Required before an actual publication batch | `null` | Defined for future G6 |

## Dictionary-wide rules

- All strings are Unicode, trimmed for normalized fields, and length-bounded during future implementation design.
- Unknown values use `null` plus a status/reason; placeholder text such as `N/A`, `unknown`, or `0` is not a substitute.
- Every original field is evidence-backed. Every normalized field records its rule version and remains traceable to the original.
- Validation examples do not nominate a live source or project.
- Any field or enum change creates a new dictionary version and requires G2 Owner approval.

