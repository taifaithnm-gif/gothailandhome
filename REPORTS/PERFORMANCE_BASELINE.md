# PERFORMANCE_BASELINE

## Target capacity (mock)

| Entity | Target |
| --- | --- |
| Projects | 1000+ |
| Images | 5000+ |
| PDFs | 1000+ |

## Generator

`buildPerformanceMockBatch({ projects, images, pdfs, developers, news })`

## Observed (Mac mini, dry-run session, 2026-07-24)

| Scale | elapsedMs | committed | DB writes | Notes |
| --- | --- | --- | --- | --- |
| 200 projects / 500 images / 100 pdfs | &lt; 30000 (assert) | false | 0 | automated test |
| **1000 projects / 5000 images / 1000 pdfs** (+50 developers, 200 news default) | **146 ms** | false | 0 | 7250 WOULD_CREATE rows |

Command:

```bash
node --experimental-strip-types --no-warnings scripts/staging-import-cli.mjs import --perf --projects 1000 --images 5000 --pdfs 1000
```

No database or storage I/O is performed.
