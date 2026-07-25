# Architecture Naming Standard (Frozen)

| Domain | Convention | Examples |
| --- | --- | --- |
| TS values | camelCase | `batchId`, `importSessionId` |
| Types/Classes | PascalCase | `ImportBatch`, `StagingDeveloper` |
| Constants | UPPER_SNAKE_CASE | `READY_FOR_APPROVAL` |
| Files | kebab-case.ts | `commit-simulator.ts` |
| SQL columns | snake_case | `source_batch_id` |
| Windows01 raw payload | snake_case allowed | `source_url` |
| Internal models | camelCase | `sourceRecordId` |

## Forbidden dual naming for same meaning

Do not mix `batch_id`/`batchId` in internal models. Raw contract payloads may retain snake_case until adapter normalization.
