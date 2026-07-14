# VALIDATION_REPORT

**Date:** 2026-07-14  
**Milestone:** Phase 6 M3 LivingInsider Wave 1

## Package validation

| Check | Result |
|-------|--------|
| AJV / factory `validateListingRecord` on all LI DTOs before import | **PASS** (316 ok / 0 fail) |
| Required provenance (`source`, `listing_url`, `external_ref`, `source_updated_at`, i18n fields) | PASS |
| Positive `price_thb` only | PASS |
| Canonical `source=livinginsider` | PASS |

## Database guards

| Check | Result |
|-------|--------|
| PropertyHub count remains 617 | PASS |
| PropertyHub prices match Wave1 packages | PASS (617/617) |
| PropertyHub `updated_at` not advanced by LI-only import | PASS |
| LivingInsider rows isolated (`source=livinginsider`) | PASS (316) |
| Soft-match candidates open only (no merges) | PASS |

## Stop conditions

| Condition | Triggered? |
|-----------|------------|
| Schema change affecting PropertyHub | No (none applied) |
| PropertyHub verified listings altered | No |
| Fabricated prices / placeholders | No |

## Status

**PASS — LivingInsider Wave 1 validated for push**
