# REVIEW_PIPELINE

## State machine

RECEIVED → VALIDATED → REVIEW_REQUIRED → CONFLICT → DUPLICATE → READY_FOR_APPROVAL
(then human/future: APPROVED → READY_FOR_PRODUCTION → PUBLISHED)

## V1 automation ceiling

`READY_FOR_APPROVAL`

## Queue buckets

- review
- duplicate
- conflict
- ready
- reject
- quarantine

## Mapping source

`src/lib/staging-import/review-mapper.ts`
