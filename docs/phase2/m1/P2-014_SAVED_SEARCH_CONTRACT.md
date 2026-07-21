# P2-014 — Saved Search Contract

Logical schema: `customer_saved_searches`
Filters JSON round-trip via `src/lib/account/saved-search.ts`
Frequency: `off | instant | daily | weekly`
Locale: page locale at create time.

## Round-trip cases

- q, listingType, district, price band, bedrooms preserved
- Unknown keys dropped
- Empty object valid
