# Staging DB Idempotency

## Key composition

```
sha256(source_batch_id | entity_type | source_record_id | content_hash)
```

- No timestamps in the key
- Hashes normalized to lowercase hex
- Stable across repeated simulations

## Decisions

| Case | Decision |
| --- | --- |
| Same batch + same record + same hash | `WOULD_SKIP_DUPLICATE` |
| Same batch + same record + different hash | `WOULD_UPDATE` / CONFLICT |
| Different batch + same URL + same hash | `DUPLICATE_CANDIDATE` |
| Different batch + same source_record_id | `CONFLICT` (no overwrite) |
