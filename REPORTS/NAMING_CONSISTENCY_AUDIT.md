# Naming Consistency Audit

Internal models use camelCase (`batchId`, `sourceRecordId`, `reviewState`).
SQL drafts use snake_case.
Windows01 raw payloads retain snake_case until adapter normalization.
Staging-db entity rows intentionally use snake_case to mirror SQL design.

**Verdict:** CONDITIONAL_PASS — domain-appropriate dual casing documented.
