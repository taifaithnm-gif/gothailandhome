# Windows 01 Runtime Architecture

**Status:** Documentation only — no code, no deployment, nothing installed
**Normative for:** `CONTENT_FACTORY_ARCHITECTURE_V2.md` §9
**Gate:** `WINDOWS01_VALIDATION_CHECKLIST.md`
**Date:** 2026-07-17
**Resolves:** CFD-01 (no runtime architecture), CFD-04 (reliability), CFD-13, CFD-14

**Hardware assumption:** every number marked **[AUDIT]** is a placeholder pending
`WINDOWS01_VALIDATION_CHECKLIST.md`. Sizing assumes **32 GB RAM / 8 cores / 1 TB
NVMe / no GPU**. If the audit returns different hardware, §3.4 and §9.3 change.

---

## 1. Windows 01 Runtime

### 1.1 Process layout

```text
Windows 11 host
│
├─ Windows Task Scheduler
│   └─ Task "CF-Boot"  (At startup · Run whether user is logged on or not ·
│                       Highest privileges · Delay 30s)
│        └─ wsl.exe -d factory -u root -e /bin/true      ← boots the distro
│
├─ Tailscale (Windows service, auto-start)                ← the ONLY ingress
│
└─ WSL2 · Ubuntu 24.04 · systemd=true
    │
    ├─ systemd
    │   ├─ docker.service                 (enabled)
    │   └─ cf-compose.service             (enabled, After=docker.service)
    │        └─ docker compose -f /opt/cf/compose.yml up -d
    │
    └─ Docker Engine (dockerd)  ← NOT Docker Desktop
        └─ compose project "cf"  (11 containers · §2.1)
```

**Why a Task Scheduler task at all.** WSL2 does not start at boot. It starts when
something touches it. Without `CF-Boot`, the factory does not come back after a
Windows Update reboot — it waits for a human to log in. **This is the single most
common way a WSL2-hosted 24×7 service silently dies**, and V1 had no concept of it.

`Run whether user is logged on or not` + `Highest privileges` is mandatory. A task
that requires an interactive session reproduces the exact Docker Desktop problem
this design avoids (RD-1).

### 1.2 Service layout

| Layer | Runs as | Restart owner |
| --- | --- | --- |
| Tailscale | Windows service | Windows SCM |
| WSL2 distro `factory` | Windows lightweight VM | `CF-Boot` task at startup |
| dockerd | systemd unit in WSL2 | systemd (`Restart=always`) |
| compose project | systemd unit `cf-compose.service` | systemd, then per-container policy (§2.5) |
| Containers | Docker | `restart: unless-stopped` (§2.5) |

**Three independent restart authorities** — Windows SCM, systemd, Docker. Each
must be verified separately (checklist §3). A design that only checks
`docker ps` after a reboot has verified the least fragile of the three.

### 1.3 Startup sequence

```text
T+0s    Windows boot
T+~20s  Tailscale service up → node reachable on tailnet
T+30s   Task Scheduler fires CF-Boot → wsl.exe -d factory
T+~35s  WSL2 VM starts → systemd PID 1
T+~40s  docker.service up
T+~45s  cf-compose.service → docker compose up -d
        │
        ├─ postgres     health: pg_isready            (~10s)
        ├─ redis        health: redis-cli ping        (~2s)
        ├─ minio        health: /minio/health/live    (~5s)
        │
        ├─ migrate      one-shot; depends_on: postgres(healthy); restart: no
        │               → exits 0; blocks everything downstream
        │
        ├─ api          depends_on: migrate(success), redis, minio
        │               health: GET /health/ready
        │
        ├─ worker-*     depends_on: api(healthy)      (5 workers)
        ├─ scheduler    depends_on: api(healthy)
        └─ uptime-kuma  independent
T+~90s  All healthy. First scheduler tick at T+120s.
```

**Ordering rules.**
- `migrate` is a one-shot with `restart: no`. If it fails, **nothing downstream
  starts** — a partially migrated database must never accept work.
- Workers wait for `api` healthy, not merely started. `depends_on: condition:
  service_healthy` — otherwise workers connect to a half-open DB pool and fail
  their first 30 seconds of jobs.
- The scheduler waits 120s before its first tick, so a boot storm does not enqueue
  work while workers are still warming.
- **No manual step exists anywhere in this sequence.** If the sequence needs a
  human, it is not a 24×7 runtime.

### 1.4 Health checks

Three distinct levels — conflating them is why "the dashboard was green" incidents
happen:

| Level | Endpoint | Answers | Used by |
| --- | --- | --- | --- |
| **Liveness** | `GET /health/live` | Is the process alive? | Docker healthcheck → restart |
| **Readiness** | `GET /health/ready` | Can it serve? (DB pool, Redis, MinIO reachable) | `depends_on`, load gating |
| **Deep** | `GET /health/deep` | Is the *system* healthy? (queue depth, DLQ depth, oldest unleased job, review backlog, last scheduler tick, disk free) | Uptime Kuma → alert |

```jsonc
// GET /health/deep
{
  "status": "degraded",          // healthy | degraded | unhealthy
  "checks": {
    "postgres":        { "ok": true,  "latency_ms": 3 },
    "redis":           { "ok": true,  "latency_ms": 1 },
    "minio":           { "ok": true,  "latency_ms": 8 },
    "embedder":        { "ok": true,  "model": "bge-m3", "loaded": true },
    "queue_depth":     { "ok": true,  "value": 12,  "threshold": 500 },
    "dlq_depth":       { "ok": false, "value": 63,  "threshold": 50 },   // ← degraded
    "oldest_job_age_s":{ "ok": true,  "value": 44,  "threshold": 900 },
    "review_backlog":  { "ok": true,  "value": 88,  "threshold": 200 },
    "last_tick_age_s": { "ok": true,  "value": 31,  "threshold": 300 },
    "disk_free_pct":   { "ok": true,  "value": 61,  "threshold": 15 }
  }
}
```

**`/health/deep` returning `healthy` while the DLQ fills is the failure mode this
design exists to prevent.** Liveness says the process is alive; only the deep check
says the factory is actually working. `review_backlog` is a health signal because
reviewer capacity is the binding constraint (V2 §2.2) — a backlog of 500 is a
system failure even when every container is green.

---

## 2. Docker Architecture

### 2.1 Containers

| Container | Image | Purpose | Phase |
| --- | --- | --- | --- |
| `cf-postgres` | `pgvector/pgvector:pg17` | Relational + vector + **job queue** (RD-2) | V1 |
| `cf-redis` | `redis:7-alpine` | Cache, rate-limit, locks. **Not the queue at V1** | V1 |
| `cf-minio` | `minio/minio:latest` (pinned) | Raw evidence, immutable, versioned | V1 |
| `cf-migrate` | `cf/api` (same image) | One-shot schema migration | V1 |
| `cf-api` | `cf/api` | Control plane: REST + review UI | V1 |
| `cf-worker-parse` | `cf/worker` | HTML + PDF parsing, sectioning, chunking | V1 |
| `cf-worker-ocr` | `cf/worker` | OCR fallback for image-PDFs | V1 |
| `cf-worker-embed` | `cf/worker` | bge-m3 embedding | V1 |
| `cf-worker-extract` | `cf/worker` | LLM-assisted fact extraction | V1 |
| `cf-scheduler` | `cf/api` | Cron ticks, retention, backup triggers | V1 |
| `cf-uptime-kuma` | `louislam/uptime-kuma:1` | Health polling + alerting | V1 |

**11 containers.** Prometheus + Grafana + Alertmanager are **deferred to Step 5** —
three more services to run and back up, for one box and one site, when Uptime Kuma
plus `/health/deep` plus `/metrics` answers every question worth asking at V1.
Promote when there is a trend worth trending.

**Image pinning.** Every image is pinned by **digest**, not tag. `latest` on a
24×7 box means an unattended `docker compose pull` can silently change the
database engine. Checklist §2.

### 2.2 Networks

```text
cf-edge      bridge   api, uptime-kuma          ← only network Tailscale reaches
cf-internal  bridge   api, workers, scheduler,
                      postgres, redis, minio    ← internal: true, NO egress route
```

| Rule | Reason |
| --- | --- |
| `cf-internal` is `internal: true` | Postgres, Redis and MinIO have **no route off the box**. A container compromise cannot exfiltrate the evidence store. |
| Only `cf-api` and `cf-uptime-kuma` join `cf-edge` | One ingress surface. |
| **No `ports:` on postgres/redis/minio** | Publishing 5432 on a Windows host binds it on **every** interface, and WSL2 port forwarding has surprised people before. Access is `docker exec` or an SSH tunnel over Tailscale. |
| Egress for `worker-extract` only | It is the only container that calls the Claude API (RD-5). Everything else is offline. |

### 2.3 Volumes

| Volume | Mount | Content | Backup | Est. growth **[AUDIT]** |
| --- | --- | --- | --- | --- |
| `cf-pgdata` | `/var/lib/postgresql/data` | Database + vectors + queue | **Yes** — nightly dump + WAL | ~2 GB/1k docs |
| `cf-pgwal` | `/var/lib/postgresql/wal` | WAL archive (separate device if audit allows) | Yes — continuous | ~500 MB/day |
| `cf-minio` | `/data` | Raw evidence (immutable) | **Yes** — mirror | ~5 GB/1k docs |
| `cf-redis` | `/data` | AOF | **No** — cache only, rebuildable | < 500 MB |
| `cf-models` | `/models` | bge-m3 weights (~2.3 GB) | No — re-downloadable | Fixed |
| `cf-logs` | `/var/log/cf` | JSON logs | No — rotated | Capped 5 GB |

**All volumes are named Docker volumes inside the WSL2 ext4 filesystem — never
Windows bind mounts to `/mnt/c/`.** Postgres over the 9p filesystem boundary is
catastrophically slow and has real fsync-durability caveats. This is not a
preference; it is the difference between a working database and a corrupted one.

Checklist §4 verifies no volume crosses `/mnt/c`.

### 2.4 Resource allocation **[AUDIT — assumes 32 GB / 8 cores]**

**WSL2 global cap** — `%UserProfile%\.wslconfig`:

```ini
[wsl2]
memory=20GB          # HARD cap. Without this, vmmem consumes the host.
processors=6         # Leave 2 cores for Windows
swap=8GB
swapFile=D:\\wsl-swap.vhdx
pageReporting=true   # Return freed memory to Windows
[experimental]
autoMemoryReclaim=gradual
```

**Unbounded WSL2 memory growth (`vmmem`) is the classic Windows failure mode for
long-running Linux workloads.** V1 specified no ceiling anywhere. Without
`memory=`, WSL2 will take the whole host and Windows will start killing things —
including Tailscale, which is how you lose remote access to the box.

**Per-container limits** (sum ≈ 17.5 GB, inside the 20 GB cap):

| Container | Memory | CPUs | Key tuning |
| --- | --- | --- | --- |
| `cf-postgres` | 6 GB | 3.0 | `shared_buffers=1536MB`, `work_mem=32MB`, `max_connections=60`, `effective_cache_size=4GB` |
| `cf-redis` | 512 MB | 0.5 | `maxmemory 384mb`, **`maxmemory-policy noeviction`** |
| `cf-minio` | 1 GB | 1.0 | — |
| `cf-api` | 1 GB | 1.0 | pool: 10 |
| `cf-worker-parse` | 2 GB | 2.0 | concurrency 2, pool 3 |
| `cf-worker-ocr` | 3 GB | 2.0 | **concurrency 1** — OCR is the memory hog |
| `cf-worker-embed` | 4 GB | 2.0 | concurrency 1, model ~2.3 GB resident |
| `cf-worker-extract` | 1 GB | 1.0 | concurrency 2 (API-bound, not CPU-bound) |
| `cf-scheduler` | 512 MB | 0.5 | pool 2 |
| `cf-uptime-kuma` | 256 MB | 0.25 | — |

**`maxmemory-policy noeviction` is not a detail.** Redis's default (`allkeys-lru`)
silently discards keys under pressure. If Redis is ever promoted to hold the queue
(RD-2, Step 6+), the default policy would **silently delete jobs** and the system
would report success. Set it now, before it can matter.

**Connection budget:** `(2×3) + (1×1) + (1×1) + (2×2) + 10 + 2 = 24` ≤ 60. §9.3.
Exceeding `max_connections` under load is a self-inflicted outage; this arithmetic
must be redone every time a worker replica count changes.

### 2.5 Restart policy

| Container | Policy | Reason |
| --- | --- | --- |
| `cf-migrate` | **`no`** | One-shot. A looping migration on a failing schema is how databases get destroyed. |
| postgres, redis, minio, api, workers, scheduler, uptime-kuma | `unless-stopped` | Survives reboot; respects a deliberate operator stop. |

**Never `always`** — `always` restarts a container the operator deliberately
stopped during incident triage, which is precisely when you need it to stay down.

**Crash-loop protection:** Docker's exponential backoff (100ms → 1s → 2s → 4s …
capped 60s). `cf-api` restarting >5× in 10 min → Uptime Kuma alert. A crash-looping
container is a **degraded** system even though `docker ps` shows it "running".

---

## 3. AI Runtime

### 3.1 LLM runtime (RD-5)

| Aspect | Decision |
| --- | --- |
| **Provider** | Claude API — `claude-sonnet-5` for extraction; `claude-opus-4-8` for ambiguous cases behind a flag |
| **Abstraction** | `LLMProvider` interface. **No call site imports a vendor SDK.** Swapping providers must be one adapter, not a refactor. |
| **Local option** | Ollama + a 7B–14B model — **only if the audit finds a GPU. [AUDIT]** On a CPU box, local extraction quality at acceptable latency is not achievable. |
| **Rate limiting** | Token bucket in Redis. Global cap + per-tenant cap. |
| **Cost control** | Per-tenant daily token budget. Budget exhausted → jobs park in `waiting`, not fail. **[AUDIT: no cost model exists yet]** |
| **Determinism** | `temperature=0`. Prompt + model + version recorded on every extraction as `extraction_version`. |
| **Failure** | API error → retry with backoff (§6.4) → DLQ. **Never** fall back to a weaker model silently; a fact's provenance must name the model that produced it. |

**Data governance — the P1 that naming the runtime created (V2 §9.3, CFD-35).**

Source content leaves the box on every extraction call. If a document contains
personal data, that is a cross-border transfer requiring lawful basis and a DPA
under PDPA/GDPR.

**Mandatory ordering:**

```text
parsed document → PII detection → { clean → LLM extraction
                                  { PII found → human extraction queue (never leaves the box)
```

PII detection runs **before** the LLM call. There is no configuration that
reverses this order. Enforced at the queue level: `worker-extract` refuses any job
whose `pii_scan_status != 'clean'`.

### 3.2 Worker runtime

| Worker | Concurrency | Timeout | Max payload | Notes |
| --- | --- | --- | --- | --- |
| `parse` | 2 | 5 min | 100 MB | HTML + PDF text |
| `ocr` | **1** | 15 min | 100 MB / 200 pages | Memory hog; hard page cap |
| `embed` | 1 | 10 min | 500 chunks/job | Model resident |
| `extract` | 2 | 5 min | 50 chunks/job | API-bound |

**Oversized input (V1 had no ceiling at all):**

```text
> 100 MB          → rejected at upload. Never enters the queue.
> 200 pages       → quarantined; reason_code = oversized_document; human decides
> 500 chunks      → split into multiple embed jobs, same idempotency root
worker OOM-killed → lease expires → retried ONCE at concurrency 1
                  → fails again → DLQ, reason_code = resource_exhausted
                  → NOT retried indefinitely (that is how a box dies at 3am)
```

**Language:** workers in **Python** (PDF/OCR/embedding are Python's home turf —
PyMuPDF, tesseract, sentence-transformers), control plane in **TypeScript** (team
stack, shared types with the site adapters). Containers isolate the split
cleanly.

**Honest cost:** a second language doubles the ops surface for a 1–3 person team.
The alternative — PDF and OCR in TypeScript — trades ops simplicity for materially
worse parsing on the exact document types this factory exists to read. **This
decision needs explicit sign-off (§10, RD-6).** It is the one runtime decision
here that a reasonable architect could call the other way.

### 3.3 Scheduler

`cf-scheduler` — a single container, in-process cron. **Not** Windows Task
Scheduler (which cannot see inside WSL2) and **not** a cron container per job.

| Job | Schedule | Idempotent? | Missed-run behaviour |
| --- | --- | --- | --- |
| `retention.sweep` | 02:00 daily | Yes | Skip; next tick covers it |
| `backup.pg_dump` | 03:00 daily | Yes | **Run on catch-up** — a skipped backup is a lost RPO |
| `backup.minio_mirror` | 03:30 daily | Yes | Run on catch-up |
| `health.reconcile` | every 5 min | Yes | Skip |
| `queue.reap_expired_leases` | every 1 min | Yes | Skip |
| `metrics.rollup` | hourly | Yes | Skip |
| `source.refresh_plan` | 06:00 daily | Yes | Skip — **disabled at V1** (no fetch collector) |

**Missed runs after a reboot are a first-class concern.** `backup.pg_dump` catches
up; `health.reconcile` does not. V1's design had no scheduler and therefore no
opinion — which means every missed run would have been silent.

**Single-instance lock:** the scheduler takes a Postgres advisory lock on start.
Two schedulers would double-enqueue every job.

### 3.4 Queue (RD-2)

**V1 uses PostgreSQL, not Redis.**

| | Postgres `SKIP LOCKED` | Redis + BullMQ |
| --- | --- | --- |
| Transactional enqueue with the state change | **Yes** — kills the dual-write bug class | No |
| Backed up and restored with the data | **Yes — one consistent restore** | No — a second backup path |
| Extra service to run/monitor/back up | No | Yes |
| Windows/WSL2 caveats | None | Redis has no maintained native Windows build |
| Throughput ceiling | ~1k jobs/s — **far beyond V1's ~100s/day** | ~50k jobs/s |

**Promotion trigger:** sustained > 50 jobs/sec **or** p95 enqueue latency > 50ms.
Neither is plausible at V1 volume. Redis stays in the stack for cache,
rate-limiting and locks — it just does not hold the queue yet.

**Schema:**

```sql
cf_jobs(
  id, tenant_id, stage, payload jsonb,
  idempotency_key text NOT NULL,        -- sha256(stage, input_id, content_hash, stage_version)
  status,                               -- queued|leased|done|failed|waiting
  attempts int DEFAULT 0, max_attempts int DEFAULT 5,
  locked_by text, locked_until timestamptz,
  run_after timestamptz DEFAULT now(),
  last_error text, created_at, updated_at,
  UNIQUE(stage, idempotency_key)        -- ← exactly-once effects
)
CREATE INDEX ON cf_jobs (status, stage, run_after) WHERE status='queued';
```

### 3.5 Executor

```sql
-- Claim (atomic; concurrency-safe; no distributed lock service)
UPDATE cf_jobs SET
  status='leased', locked_by=$worker, locked_until=now()+interval '10 minutes',
  attempts=attempts+1
WHERE id = (
  SELECT id FROM cf_jobs
  WHERE status='queued' AND run_after<=now() AND stage=$stage
    AND tenant_id = ANY($allowed_tenants)     -- ← tenant fairness (V2 §8.3)
  ORDER BY priority DESC, run_after
  FOR UPDATE SKIP LOCKED
  LIMIT 1
) RETURNING *;
```

**Executor contract:**

1. Claim job (above).
2. **Check idempotency** — if `(stage, idempotency_key)` already `done`, return the prior result. Do no work.
3. Heartbeat: extend `locked_until` every 60s while running.
4. Execute inside a transaction. Write output **and** `status='done'` **and** the next stage's job **in the same commit**.
5. On failure: classify (§6.4) → backoff or DLQ.

**Step 4 is the reason RD-2 chose Postgres.** Enqueueing the next stage in the same
transaction that commits this stage's output means there is no window where work is
done but the follow-on job is lost — or vice versa. With an external queue this is
a distributed-transaction problem that gets solved with an outbox table, which is
just this design with extra steps.

**Crash recovery:** worker dies → heartbeat stops → `locked_until` expires →
`queue.reap_expired_leases` returns it to `queued` within 60s. **No human action.**

---

## 4. Storage Architecture

### 4.1 PostgreSQL

| | |
| --- | --- |
| Image | `pgvector/pgvector:pg17` (digest-pinned) |
| Role | Relational core · vector index · **job queue** · audit |
| Volume | `cf-pgdata` (WSL2 ext4 — never `/mnt/c`) |
| WAL | `cf-pgwal`, archived continuously to MinIO then off-box |
| Connections | `max_connections=60`; budgeted §2.4 |
| Extensions | `vector`, `pg_stat_statements`, `pgcrypto` |

```ini
shared_buffers          = 1536MB
effective_cache_size    = 4GB
work_mem                = 32MB
maintenance_work_mem    = 512MB
wal_level               = replica
archive_mode            = on
archive_command         = 'mc cp %p local/cf-wal/%f'
checkpoint_timeout      = 15min
random_page_cost        = 1.1        # NVMe
```

**No pgbouncer at V1** — 24 pooled connections against 60 does not need a pooler.
Add one when the connection budget (§9.3) stops closing.

### 4.2 Redis

Cache, rate-limit tokens, advisory locks. **Not the queue** (RD-2).
`maxmemory 384mb` · **`maxmemory-policy noeviction`** · `appendonly yes`.
**Not backed up** — every key is rebuildable. Redis data loss is an availability
event, never a data-loss event. That property is worth protecting: if Redis is
ever promoted to hold the queue, this line stops being true and the backup story
changes (Step 6+ decision).

### 4.3 MinIO

| | |
| --- | --- |
| Role | Raw evidence store — the immutability anchor of the whole evidence model |
| Layout | `cf-raw-{tenant}` · `cf-media-{tenant}` · `cf-wal` · `cf-backup` |
| **Versioning** | **Enabled** on evidence buckets |
| **Object Lock** | **Compliance mode, 365 days** on `cf-raw-*` |
| Addressing | Content-addressed: `raw/{sha256[0:2]}/{sha256}` |

**Object Lock is why MinIO is in V1 rather than a filesystem path.** The evidence
model's core promise is that raw evidence is immutable. A filesystem directory
makes that a convention enforced by hope; Object Lock makes it a property enforced
by the storage engine — a compromised worker, a bad migration, or an operator with
`rm -rf` cannot alter evidence a published fact cites. Retrofitting object storage
later means rewriting every `payload_uri`.

**Single-node.** No erasure coding, no distributed mode — one box, and durability
comes from backup (§7), not from MinIO topology.

### 4.4 Vector database (RD-3)

**pgvector inside `cf-postgres`.** No separate vector service.

```sql
CREATE INDEX cf_embeddings_hnsw ON cf_embeddings
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);
SET hnsw.ef_search = 40;                    -- query-time recall/latency knob
```

| | |
| --- | --- |
| Model | `bge-m3` — 1024 dims, multilingual **EN/ZH/TH in one model** (RD-4) |
| Index build | HNSW build on ~50k vectors ≈ 2–4 min, ~1 GB `maintenance_work_mem` |
| Scale headroom | pgvector + HNSW is comfortable to ~1M vectors on this hardware. V1 pilot ≈ 5–20k. **Two orders of magnitude of headroom.** |
| Promotion trigger | > 1M vectors **or** p95 search > 200ms → reconsider a dedicated vector DB |

`bge-m3` is chosen specifically because one model covers all three pilot locales.
A monolingual model would have forced either three models (three loads, ~7 GB
resident) or an English-only index that cannot find Thai evidence — which would
defeat the reviewer-search use case that justifies embeddings at V1 (V2 §11.4).

### 4.5 Backup

| What | Method | Schedule | Target | RPO |
| --- | --- | --- | --- | --- |
| Postgres full | `pg_dump -Fc` | 03:00 daily | MinIO → Mac mini → Backblaze B2 | 24 h |
| Postgres WAL | `archive_command` | Continuous | MinIO `cf-wal` → off-box | **≤ 5 min** |
| MinIO evidence | `mc mirror --preserve` | 03:30 daily | Mac mini → B2 | 24 h |
| Config + compose | git | On change | Repo | — |
| Redis | **None** | — | — | N/A (rebuildable) |

**3-2-1:** 3 copies (Windows 01, Mac mini, B2) · 2 media · 1 offsite.
**Retention:** daily×7, weekly×4, monthly×12.
**Encryption:** age/gpg before leaving the box. Key in a password manager, **not on Windows 01** — a backup encrypted with a key stored on the machine you are backing up protects against exactly nothing.

**Effective RPO = 5 minutes** (WAL), not 24 hours (dump). Stating only the nightly
dump would understate recoverability by 288×.

### 4.6 Archive and retention (resolves CFD-13)

V1 defined `cf_retention_policies` with `archive_after_days` / `delete_after_days`
and **nothing that executed them**. A documented, unenforced retention policy is a
liability: it records an intent you are provably not meeting.

**`retention.sweep` (02:00 daily) executes it:**

```text
for each cf_retention_policies row where status='active':
  1. legal_hold check          → skip (hold always wins)
  2. archive_after_days elapsed → lifecycle_state = archived
                                  MinIO object → cold tier
  3. delete_after_days elapsed  → CASCADE CHECK (below) → delete
  4. write cf_lifecycle_events + cf_audit_events for every action
  5. dry-run mode default; deletion requires RETENTION_DELETE_ENABLED=true
```

**Cascade rules — the question V1 never asked:**

```text
Deleting a raw item while a PUBLISHED fact cites it would orphan the evidence
chain and silently turn a sourced fact into an unsourced one.

→ Raw item deletion BLOCKED while any fact citing it is `published`.
→ Blocked deletions surface as a review task, never silently skipped.
→ Cascade order: publish_package → content_item → fact → chunk/embedding
                 → section → parsed_document → raw_item
→ Object Lock (365d) hard-stops evidence deletion regardless of policy.
   Retention shorter than 365 days CANNOT be honoured for raw evidence —
   this is a deliberate conflict that surfaces at policy creation, not at
   deletion time. [Compliance decision required if a shorter retention is
   ever legally mandated.]
```

---

## 5. Document Pipeline

```text
Upload → OCR → Chunk → Embedding → Index → Knowledge
```

| # | Stage | Worker | In → Out | Idempotency key root | Phase |
| --- | --- | --- | --- | --- | --- |
| 1 | **Upload** | api | File → `cf_raw_items` + MinIO object | `sha256(payload)` | V1 |
| 2 | **Parse** | parse | Raw → `cf_parsed_documents` + `cf_document_sections` | `(raw_item_id, parser_version)` | V1 |
| 2b | **OCR** | ocr | Image-PDF → text layer | `(raw_item_id, ocr_version)` | V1 |
| 3 | **Chunk** | parse | Sections → `cf_chunks` | `(parsed_document_id, chunker_version)` | V1 |
| 4 | **Embed** | embed | Chunks → `cf_embeddings` | `(chunk_id, model, model_version)` | V1 |
| 5 | **Index** | — | HNSW (implicit on insert) | — | V1 |
| 6 | **Knowledge** | extract | Chunks + retrieval → `cf_facts` + `cf_fact_evidence` | `(parsed_document_id, extraction_version)` | V1 |

### 5.1 Upload

Hash → dedupe on `content_hash` (exact-duplicate = link, never re-import) →
MinIO PUT (versioned, locked) → `cf_raw_items` → enqueue parse.
**Reject > 100 MB at the door.** Rights `blocked` → `quarantined`, no parse.

### 5.2 OCR

Triggered only when PDF text extraction yields < 100 chars/page (an image-PDF).
Tesseract, `eng+chi_sim+tha`. Cap 200 pages. Concurrency 1.
Output is a text layer with **page-level offsets preserved** — an OCR'd document
must remain citeable, or the evidence chain breaks for exactly the documents
(scanned government PDFs) where provenance matters most.

### 5.3 Chunk

Section-aware, never crossing a `cf_document_sections` boundary. 512 tokens,
64 overlap. **`char_start`/`char_end` propagate into every chunk.**

**This is the load-bearing rule of the entire document pipeline.** A fact extracted
from a chunk cites a character range in an immutable section. Lose the offsets and
facts cite vectors — and "evidence-preserving" (V2 §3.5) becomes decoration.

### 5.4 Embed

bge-m3 → 1024-dim → `cf_embeddings`. Never overwritten: a model change writes a new
`(chunk_id, model, model_version)` row, and old vectors stay queryable until the
new index is verified. A bad embedding rollout is therefore a rollback, not a
re-ingest.

### 5.5 Index

HNSW, maintained on insert. Rebuild only on model or parameter change.

### 5.6 Knowledge

Retrieval over approved-source chunks → LLM extraction (PII-gated, §3.1) →
candidate facts, each carrying `document_section_id` + char range +
`extraction_version` + `support_level` → confidence (3 signals, V2 §6.14) →
duplicate check (hash + URL) → **review task**.

**Nothing exits this stage as truth. It exits as a candidate for a human.**

---

## 6. Task Pipeline

```text
Task Queue → Worker → Executor → Retry → Dead Letter Queue
```

### 6.1–6.3 Queue, Worker, Executor

§3.4 (schema), §3.2 (workers), §3.5 (claim + contract).

### 6.4 Retry

```text
attempt 1 fail → run_after = now + 2s   ± jitter
attempt 2 fail → now + 8s   ± jitter
attempt 3 fail → now + 32s  ± jitter
attempt 4 fail → now + 128s ± jitter
attempt 5 fail → DEAD LETTER QUEUE
```

Backoff `4^n` seconds, ±25% jitter (jitter prevents a thundering herd when 200
jobs fail together on a dependency outage and all retry on the same tick).

**Classification decides whether a retry is even sane:**

| Class | Examples | Action |
| --- | --- | --- |
| **Transient** | DB timeout, API 429/5xx, network | Retry with backoff |
| **Poison** | Malformed PDF, unsupported encoding | **1 attempt → DLQ.** Retrying a corrupt file 5× is 5 identical failures. |
| **Resource** | OOM, timeout | Retry **once** at concurrency 1 → DLQ |
| **Policy** | Rights blocked, PII detected | **No retry** → `quarantined` (a human decision, not a failure) |
| **Permanent** | Source deleted, 404 | **No retry** → DLQ |

### 6.5 Dead Letter Queue

```sql
cf_jobs_dlq(
  id, tenant_id, original_job_id, stage, payload jsonb,
  idempotency_key, attempts, failure_class, last_error, error_signature,
  first_failed_at, dead_lettered_at,
  triage_status,        -- pending | investigating | replayed | written_off
  triage_note, triaged_by, triaged_at
)
```

**Rules:**
- **No job is ever silently dropped.** Every DLQ entry is triaged or written off with a reason code and a name attached.
- `dlq_depth > 50` → `/health/deep` **degraded** → alert (§7).
- **Replay:** fix the cause → re-enqueue by `idempotency_key`. Because effects are keyed, replaying a job that partially succeeded is safe — it resumes rather than duplicates.
- Weekly DLQ review is a standing operational task. **A DLQ nobody reads is a data-loss queue wearing a hat.**

### 6.6 Poison containment

`error_signature = sha256(stage, exception_type, normalized_message)`.
Same signature 3× within an hour → **circuit-break that stage for that tenant only**
→ alert. Other tenants and other stages keep running (V2 §8.3).

---

## 7. Monitoring

### 7.1 Logs

Structured JSON to stdout. Docker `json-file`, `max-size=50m`, `max-file=5`
(capped ~250 MB/container — an uncapped log file is a slow-motion disk-full
outage, and disk-full on the Postgres volume is data loss).

Every line: `ts`, `level`, `service`, `tenant_id`, `job_id`, `stage`,
`trace_id`, `msg`.
**Never logged:** PII, payload bodies, credentials, LLM prompts containing source
text.

### 7.2 Metrics

`GET /metrics` (Prometheus text format), scraped by nothing at V1 — read by
Uptime Kuma and by humans. Prometheus lands at Step 5 when trends matter.

| Metric | Type | Alert |
| --- | --- | --- |
| `cf_queue_depth{stage}` | gauge | > 500 |
| `cf_dlq_depth` | gauge | **> 50** |
| `cf_job_duration_seconds{stage}` | histogram | p95 > 300s |
| `cf_job_failures_total{stage,class}` | counter | rate > 10/min |
| `cf_oldest_unleased_job_age_seconds` | gauge | > 900 |
| **`cf_review_backlog`** | gauge | **> 200** |
| `cf_llm_tokens_total{tenant}` | counter | > daily budget |
| `cf_disk_free_percent` | gauge | < 15 |
| `cf_last_backup_age_hours` | gauge | **> 26** |
| `cf_last_restore_test_age_days` | gauge | **> 100** |

`cf_review_backlog` sits beside the infrastructure metrics deliberately: reviewer
capacity is the binding constraint (V2 §2.2), so it is an infrastructure signal.
`cf_last_restore_test_age_days` is a metric because an untested backup is a belief.

### 7.3 Alert

Uptime Kuma → **Telegram** (operator's phone). Email is a second channel for
non-urgent items.

| Severity | Trigger | Response |
| --- | --- | --- |
| **P0 page** | `/health/deep` unhealthy · Postgres down · disk < 10% · backup age > 26h · **restore test > 120d** | Immediate |
| **P1 alert** | DLQ > 50 · review backlog > 500 · api crash-loop · WAL archive failing | Same day |
| **P2 notice** | Queue > 500 · p95 latency · review backlog > 200 · token budget 80% | Next working day |

**Alert on the deep check, never on liveness.** A container that is "running" while
the DLQ fills is the failure this design exists to catch.

### 7.4 Dashboard

Uptime Kuma status page over Tailscale: per-service up/down, `/health/deep`
rendered, queue + DLQ depth, review backlog, last backup age, last restore-test
age, disk free. **Step 5:** Grafana, if and when trends earn three more containers.

### 7.5 Health endpoint

§1.4. `/health/live`, `/health/ready`, `/health/deep`.

---

## 8. Failure Recovery

### 8.1 Restart strategy

| Failure | Detection | Recovery | Human? |
| --- | --- | --- | --- |
| Worker crash | Healthcheck | Docker restart; lease expires; job requeued ≤ 60s | **No** |
| Worker OOM | Exit 137 | Restart; retry once at concurrency 1; else DLQ | No |
| Postgres crash | Healthcheck | Restart; WAL replay; leased jobs reaped | No |
| Redis crash | Healthcheck | Restart; cache cold. **No data loss** (§4.2) | No |
| MinIO crash | Healthcheck | Restart; objects intact (versioned + locked) | No |
| dockerd crash | systemd | `Restart=always` | No |
| **WSL2 crash** | CF-Boot / Kuma silence | `wsl --shutdown` + restart, or host reboot | **Yes** |
| **Windows Update reboot** | Expected | CF-Boot → full sequence (§1.3) | No — **if CF-Boot works** |
| Host power loss | Kuma silence | Boot → CF-Boot → WAL replay | No |
| Disk full | `disk_free < 15%` | Alert; log rotation; MinIO tier | Yes |
| **Corrupt Postgres volume** | Startup failure | **§8.3 restore** | **Yes** |

**The most probable failure on this box is a Windows Update reboot, and the whole
recovery hinges on one Task Scheduler task (§1.1).** Checklist §3 tests it by
actually rebooting — not by reading the task definition.

### 8.2 Backup strategy

§4.5. Nightly `pg_dump` + continuous WAL + daily MinIO mirror → Mac mini → B2.
Encrypted before leaving the box; key held off-box.

### 8.3 Restore strategy

**RTO 4 h · RPO 5 min.**

```text
1. Stop compose.                                          T+0
2. Provision clean volumes.                               T+10m
3. Restore latest pg_dump -Fc → cf-postgres.              T+40m
4. Replay WAL from cf-wal to the target timestamp (PITR). T+70m
5. mc mirror MinIO evidence back.                         T+2h
6. Run cf-migrate (idempotent — verifies schema).         T+2h10
7. Start api → verify /health/deep healthy.               T+2h20
8. RECONCILE: leased jobs → requeued; DLQ intact;
   spot-check 10 published facts against their evidence.  T+3h
9. Start workers + scheduler.                             T+3h30
10. Verify: one document end-to-end through the pipeline. T+4h
```

**Step 8 is not optional.** A restore that brings the database back but leaves
facts pointing at evidence that did not come back is a silent integrity failure —
the system would look healthy and be lying. **The restore is not complete until
published facts have been re-verified against restored evidence.**

**Quarterly restore test — a gate, not an aspiration.** Restore to a scratch WSL2
distro, run the checklist, record `cf_last_restore_test_age_days = 0`. A backup
that has never been restored is a hypothesis (CFD-14).

### 8.4 Disaster recovery

| Scenario | RTO | Procedure |
| --- | --- | --- |
| Volume corruption | 4 h | §8.3 on the same box |
| **Windows 01 destroyed** | **1–2 days** | Rebuild WSL2 + Docker on new hardware → §8.3 from B2. Requires the encryption key (off-box) and the compose repo (git). |
| Ransomware on the host | 4–8 h | Rebuild; restore from **B2 immutable** (Object Lock). Mac mini copy assumed compromised if on the same tailnet. |
| Mac mini lost | 0 | Backup target only. Re-point mirror. No factory impact. |
| Tailscale outage | 0 | Factory runs; remote access lost. **No console = no remote hands.** Physical access is the fallback. |

**Single point of failure, stated plainly:** Windows 01 is one box running
Postgres, Redis, MinIO and every worker. There is no HA and, at this scale, there
should not be — HA for a one-site pilot is cost without benefit. **The mitigation
is a tested restore, not a second box.** That is a deliberate, reviewable trade
that V1 never surfaced because V1 never named the box.

---

## 9. Concurrency

### 9.1 Worker scaling

| Worker | V1 replicas | Concurrency | Total | Scale trigger |
| --- | --- | --- | --- | --- |
| parse | 1 | 2 | 2 | queue_depth{parse} > 100 for 10 min |
| ocr | 1 | 1 | 1 | **Do not scale** — memory-bound (3 GB each) |
| embed | 1 | 1 | 1 | queue_depth{embed} > 200; **model is 2.3 GB per replica** |
| extract | 1 | 2 | 2 | API rate limit binds before CPU |

**Scaling ceiling — [AUDIT]:** at 32 GB / 20 GB WSL2, the box supports roughly
**+1 parse and +1 extract replica**. It cannot support a second `embed` (4 GB) or
`ocr` (3 GB) without raising the WSL2 cap, which requires more host RAM.

**Vertical before horizontal.** More replicas on one box compete for the same
cores, the same 60 connections and the same 20 GB. Scaling `embed` to 2 replicas
buys ~1.6× throughput for 4 GB — a bad trade until it is the proven bottleneck.

### 9.2 Queue scaling

| Control | Value |
| --- | --- |
| Claim batch | 1 (`SKIP LOCKED`, no batching at V1) |
| Lease | 10 min; heartbeat 60s |
| Reaper | every 60s |
| Priority | `priority DESC, run_after ASC` |
| **Tenant fairness** | Round-robin over `allowed_tenants` — one tenant cannot monopolise the pool (V2 §8.3) |
| **Backpressure** | Below |

```text
review_backlog > 200 → pause collection planning; P2 notice
review_backlog > 500 → HARD STOP intake; P1 alert
dlq_depth      > 50  → HARD STOP the affected stage; P1 alert
queue_depth    > 500 → pause upstream stages (parse before extract)
disk_free      < 15% → HARD STOP intake; P0 page
```

**Backpressure keys on the human, not the CPU.** V1 had no concept of this. A
factory that produces 500 candidates/day for a reviewer who approves 50 has not
scaled — it has built a 10-day-per-day backlog while every container reports green.

### 9.3 Resource limits

§2.4 for the per-container table.

**Connection budget — recompute on every replica change:**

```text
parse   1 × 3 =  3
ocr     1 × 2 =  2
embed   1 × 2 =  2
extract 1 × 3 =  3
api     1 × 10 = 10
scheduler     =  2
migrate (transient) = 2
                ───
                24  ≤ max_connections 60   ✓  (headroom for +2 replicas)
```

**Memory budget:** 17.5 GB containers ≤ 20 GB WSL2 cap ≤ 32 GB host **[AUDIT]** —
leaving ~12 GB for Windows, Tailscale and page cache.

**Hard rules:**
- Every container declares `mem_limit` and `cpus`. **An unlimited container on a shared box is a host outage waiting for a bad PDF.**
- WSL2 `memory=` is mandatory (§2.4).
- OCR and embed never scale beyond 1 without a RAM audit.
- `max_connections` is never raised to fix a leak — the leak is fixed.

---

## 10. Open runtime decisions

Requiring sign-off before Step 2.

| ID | Decision | Recommendation | Owner | Blocks |
| --- | --- | --- | --- | --- |
| **RD-1** | Docker Desktop vs WSL2+Engine | **WSL2 + Docker Engine.** Desktop needs an interactive session; not a 24×7 runtime | Platform | Step 1 |
| **RD-2** | Queue: Postgres vs Redis | **Postgres `SKIP LOCKED`** at V1; Redis at > 50 jobs/s | Architect | Step 2 |
| **RD-3** | Vector store | **pgvector in-database** | Architect | Step 2 |
| **RD-4** | Embedding model | **bge-m3** local CPU (EN/ZH/TH in one model) | Architect | Step 2 |
| **RD-5** | LLM provider | **Claude API**, PII-gated (§3.1). Local only if GPU **[AUDIT]** | Architect + Compliance | **Step 4** |
| **RD-6** | Worker language | **Python workers / TS control plane.** A second language doubles ops for a 1–3 person team — the one call here a reasonable architect could make differently | Architect + CEO | Step 2 |
| **RD-7** | Repo | **Separate repo.** The factory must not couple to GoThailandHome's Next.js app | Architect | Step 2 |
| **RD-8** | Host RAM | **[AUDIT]** — all sizing assumes 32 GB | Platform | **Step 1** |
| **RD-9** | GPU | **[AUDIT]** — decides RD-5 local vs API | Platform | Step 1 |
| **RD-10** | Backblaze B2 vs alternative offsite | B2 (cheap, Object Lock) | CEO | Step 3 |

**CFD-35 (new P1):** RD-5 sends source content off-box. PDPA/GDPR lawful basis and
a DPA are required before Step 4. Mitigation is the PII gate (§3.1); the legal
basis is not an architecture deliverable.

---

## 11. What this document does not decide

- Actual hardware — **[AUDIT]** (`WINDOWS01_VALIDATION_CHECKLIST.md`).
- Whether Windows 01 can host this at all. **Every number here is a hypothesis until the audit returns.**
- Migration of GoThailandHome's existing schema (out of scope).
- Site adapter internals (per-site, Step 4).

**Next gate:** `WINDOWS01_VALIDATION_CHECKLIST.md`. **Do not install anything
before it passes.**
