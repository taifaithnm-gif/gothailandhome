# Windows 01 Validation Checklist

**Status:** Documentation only — **nothing is installed until §1–§4 pass**
**Gate for:** `WINDOWS01_RUNTIME_ARCHITECTURE.md` (Step 1 of `CONTENT_FACTORY_ARCHITECTURE_V2.md` §12.3)
**Date:** 2026-07-17
**Executor:** Platform/Infra · **Approver:** Architect

---

## How to use this

Three phases, run in order. **Do not skip forward.**

| Phase | Sections | Purpose | Installs anything? |
| --- | --- | --- | --- |
| **A — Audit** | §1–§2 | Establish what Windows 01 actually is. Answers RD-8, RD-9 and every **[AUDIT]** in the runtime doc | **No — read-only** |
| **B — Build** | §3–§9 | Install and verify the runtime | Yes |
| **C — Prove** | §10–§12 | Prove it survives reality | No |

**Marking:** `[ ]` not run · `[P]` pass · `[F]` fail · `[N/A]` justified in Notes.
Every `[F]` on a **GATE** item stops the phase. Every `[F]` needs a note.

**Gate items are marked GATE.** They are not negotiable — each one corresponds to a
failure that silently destroys data or silently stops the factory.

```
Auditor: ______________  Date: __________  Approver: ______________  Date: __________
Phase A: PASS / FAIL     Phase B: PASS / FAIL     Phase C: PASS / FAIL
```

---

# PHASE A — Audit (read-only)

**Install nothing. Change nothing.** This phase answers the questions the runtime
architecture had to assume.

## 1. Hardware and OS

| # | Check | Expected | Result | Notes |
| --- | --- | --- | --- | --- |
| 1.1 | `winver` — Windows edition + build | **Windows 11 Pro** 22H2+. **Home does not support Hyper-V/WSL2 reliably — GATE** | | |
| 1.2 | **GATE · RD-8** — Total physical RAM (`systeminfo`) | **≥ 32 GB.** At 16 GB the container budget (§2.4 runtime) does not fit and the design must be re-sized | | |
| 1.3 | CPU model, physical cores, threads | ≥ 8 cores. Virtualisation enabled in BIOS | | |
| 1.4 | **GATE** — Free disk on the target volume | **≥ 500 GB free NVMe.** SSD is a GATE; HDD is disqualifying for Postgres | | |
| 1.5 | Disk type (NVMe / SATA SSD / HDD) | NVMe preferred; sets `random_page_cost` | | |
| 1.6 | Is there a second physical volume? | Optional — WAL separation (§4.1 runtime) | | |
| 1.7 | **RD-9** — GPU present? Model? VRAM? | Decides RD-5 (local LLM vs Claude API). **No GPU is an acceptable answer** — it confirms API | | |
| 1.8 | Windows activation + license type | Activated | | |
| 1.9 | Machine is physically accessible / has remote console (IPMI/KVM)? | **If Tailscale dies, is there any way in?** (§8.4 runtime) | | |
| 1.10 | UPS present? | Power loss → WAL replay. Uncontrolled loss risks volume corruption | | |
| 1.11 | Host name, workgroup/domain, local admin available | Admin required for §3 | | |

## 2. Existing state and conflicts

| # | Check | Expected | Result | Notes |
| --- | --- | --- | --- | --- |
| 2.1 | **GATE** — Is anything already running on this box? | **Inventory every existing service.** The brief says assume nothing is installed — verify, do not trust | | |
| 2.2 | **GATE** — Port conflicts: `netstat -ano` for 5432, 6379, 9000, 9001, 3000, 3001, 8080 | Free. A pre-existing Postgres on 5432 is a real and common collision | | |
| 2.3 | Is WSL installed? `wsl --status`, `wsl -l -v` | Record version + existing distros | | |
| 2.4 | Is Docker Desktop installed? | **If yes: RD-1 requires removing or disabling it.** Desktop + Engine on one host conflict | | |
| 2.5 | Is Hyper-V / Virtual Machine Platform enabled? | Required for WSL2 | | |
| 2.6 | Antivirus product and real-time scanning config | **Defender scanning the WSL2 ext4 vhdx destroys Postgres I/O.** Exclusions needed (§3.9) | | |
| 2.7 | Third-party firewall / endpoint agent | May block Tailscale or Docker bridges | | |
| 2.8 | **GATE** — Windows Update: active hours + restart policy | **This is the #1 predicted failure (§8.1 runtime).** Record current policy | | |
| 2.9 | Power plan · sleep · hibernate · fast startup | **All must be OFF for 24×7.** Sleep = the factory stops | | |
| 2.10 | Is Tailscale installed? Tailnet? ACLs? | Records the ingress story | | |
| 2.11 | Public IP exposure / inbound NAT rules | **Expected: none.** Tailscale-only | | |
| 2.12 | Existing scheduled tasks | Conflicts with `CF-Boot` | | |
| 2.13 | Existing backup solution on this box | May already cover volumes — or fight ours | | |
| 2.14 | Time sync (NTP) + timezone | Accurate time. Leases, backoff and audit timestamps depend on it | | |
| 2.15 | Mac mini ↔ Windows 01 over Tailscale: reachable? Latency? | Backup target (§4.5) + review access | | |
| 2.16 | Outbound internet: can the box reach `api.anthropic.com` and B2? | Required for RD-5 and offsite backup | | |

### Phase A exit

- [ ] **GATE** 1.2 RAM ≥ 32 GB — **or** the runtime doc is re-sized and re-approved before Phase B
- [ ] **GATE** 1.4 ≥ 500 GB free SSD/NVMe
- [ ] **GATE** 2.2 no port conflicts (or remediation agreed)
- [ ] **GATE** 1.1 Windows 11 Pro
- [ ] RD-8 and RD-9 answered; every **[AUDIT]** value in the runtime doc replaced with a real number
- [ ] Runtime doc §2.4 / §9.3 budgets recomputed against actual RAM
- [ ] **Architect sign-off that the design fits this hardware**

> **If 1.2 or 1.4 fail, stop.** Do not proceed and "see how it goes" — the memory
> and connection budgets are the design. Re-size, re-approve, then continue.

---

# PHASE B — Build

## 3. Windows host preparation

| # | Check | Expected | Result | Notes |
| --- | --- | --- | --- | --- |
| 3.1 | Sleep/hibernate/fast-startup disabled | `powercfg /a` confirms | | |
| 3.2 | Power plan = High performance, disk never sleeps | | | |
| 3.3 | **GATE** — Windows Update configured: active hours set, auto-restart deferred, reboot window agreed and documented | A reboot at 14:00 mid-pipeline is survivable (§8.1) **only if CF-Boot works** (3.6) | | |
| 3.4 | Virtual Machine Platform + WSL enabled | `wsl --install`, `wsl --set-default-version 2` | | |
| 3.5 | WSL2 kernel updated | `wsl --update` | | |
| 3.6 | **GATE** — `.wslconfig` created with `memory=`, `processors=`, `swap=`, `pageReporting=true` | **Without `memory=`, vmmem eats the host and Windows kills Tailscale — you lose the box remotely** (§2.4) | | |
| 3.7 | Ubuntu 24.04 distro `factory` installed | `wsl -l -v` shows VERSION 2 | | |
| 3.8 | `/etc/wsl.conf` has `[boot] systemd=true` | `systemctl` works inside the distro | | |
| 3.9 | **GATE** — Defender exclusions for the WSL2 vhdx path and Docker data root | **Real-time scanning of the ext4 vhdx cripples Postgres and risks corruption** (2.6) | | |
| 3.10 | Tailscale installed as a Windows **service**, auto-start, key expiry **disabled** | **A tailnet key expiring at 3am = permanent loss of remote access** to an otherwise healthy box | | |
| 3.11 | Tailscale ACL restricts access to the operator + Mac mini | | | |
| 3.12 | No inbound public ports; Windows Firewall verified | | | |
| 3.13 | Non-admin service account decided for the factory | | | |

## 4. WSL2 + Docker

| # | Check | Expected | Result | Notes |
| --- | --- | --- | --- | --- |
| 4.1 | **GATE · RD-1** — Docker **Engine** installed inside WSL2. **Docker Desktop NOT used** | Desktop needs an interactive session; not a 24×7 runtime | | |
| 4.2 | If Docker Desktop was present (2.4): removed or fully disabled | No conflict | | |
| 4.3 | `systemctl is-enabled docker` → `enabled` | Starts with systemd | | |
| 4.4 | `docker compose version` → v2 | | | |
| 4.5 | **GATE** — Docker data root is on WSL2 **ext4**, not `/mnt/c` | **Postgres over the 9p boundary is slow and has fsync caveats** (§2.3) | | |
| 4.6 | **GATE** — No named volume bind-mounts to `/mnt/c/...` | Verified per volume in the compose file | | |
| 4.7 | Networks `cf-edge` + `cf-internal` (`internal: true`) created | (§2.2) | | |
| 4.8 | **GATE** — Postgres/Redis/MinIO publish **no** `ports:` | Publishing 5432 on a Windows host binds every interface | | |
| 4.9 | **GATE** — Every image pinned by **digest**, not tag | `latest` on a 24×7 box can silently change the database engine | | |
| 4.10 | All 11 containers declare `mem_limit` and `cpus` | **An unlimited container is a host outage waiting for a bad PDF** (§9.3) | | |
| 4.11 | Restart policies: `cf-migrate: no`; all others `unless-stopped`; **none `always`** | (§2.5) | | |
| 4.12 | Log driver `json-file`, `max-size=50m`, `max-file=5` on every container | Uncapped logs → disk full → data loss | | |
| 4.13 | Compose file + `.wslconfig` + wsl.conf committed to git | DR requires them (§8.4) | | |

## 5. Startup and boot

| # | Check | Expected | Result | Notes |
| --- | --- | --- | --- | --- |
| 5.1 | **GATE** — Task `CF-Boot` exists: **At startup**, **Run whether user is logged on or not**, **Highest privileges**, 30s delay | **WSL2 does not start at boot.** Without this the factory waits for a human login — the #1 silent-death mode | | |
| 5.2 | `cf-compose.service` enabled, `After=docker.service` | | | |
| 5.3 | `cf-migrate` is one-shot, `restart: no`, and **blocks** downstream | A looping migration destroys databases | | |
| 5.4 | Workers use `depends_on: condition: service_healthy` (not merely started) | Otherwise the first 30s of jobs fail | | |
| 5.5 | Scheduler first tick delayed ≥ 120s | No boot-storm enqueue | | |
| 5.6 | **GATE** — Full sequence completes with **zero manual steps** | If a human is needed, it is not 24×7 | | |
| 5.7 | Cold boot → all healthy within **5 min** | Timed (§1.3) | | |

## 6. Storage

| # | Check | Expected | Result | Notes |
| --- | --- | --- | --- | --- |
| 6.1 | Postgres = `pgvector/pgvector:pg17`; `CREATE EXTENSION vector` succeeds | RD-3 | | |
| 6.2 | HNSW index builds; a similarity query returns | (§4.4) | | |
| 6.3 | `max_connections=60`; `shared_buffers=1536MB` | (§4.1) | | |
| 6.4 | `wal_level=replica`, `archive_mode=on`, `archive_command` works | **Verify an actual WAL file lands in MinIO** — not just that config parsed | | |
| 6.5 | **GATE** — Redis `maxmemory-policy noeviction` | Default `allkeys-lru` **silently deletes** data. Set before it can matter (§2.4) | | |
| 6.6 | Redis `appendonly yes` | | | |
| 6.7 | **GATE** — MinIO bucket **versioning enabled** on `cf-raw-*` | Evidence immutability (§4.3) | | |
| 6.8 | **GATE** — MinIO **Object Lock, compliance mode, 365 days** on `cf-raw-*` | The storage engine — not policy — enforces immutability. **Try to delete a locked object and confirm it fails** | | |
| 6.9 | Content-addressed layout `raw/{sha256[0:2]}/{sha256}` | | | |
| 6.10 | Volume free-space alerting at 15% | | | |
| 6.11 | **GATE** — Retention sweep runs in **dry-run** by default; `RETENTION_DELETE_ENABLED=false` | Deletion is opt-in (§4.6) | | |
| 6.12 | Retention cascade blocks deleting a raw item cited by a **published** fact | **Test it deliberately** (§4.6) | | |

## 7. AI runtime

| # | Check | Expected | Result | Notes |
| --- | --- | --- | --- | --- |
| 7.1 | **RD-4** — bge-m3 loads; 1024-dim vector produced | (§4.4) | | |
| 7.2 | Embedding latency (CPU) benchmarked: single chunk + 100-chunk batch | Feeds §9.1 sizing. **Record the number** | | |
| 7.3 | `cf-worker-embed` stays within its 4 GB limit under load | Model ~2.3 GB resident | | |
| 7.4 | **RD-5** — Claude API reachable from `cf-worker-extract` only | (§2.2 egress) | | |
| 7.5 | **GATE · CFD-35** — PII detection runs **before** any LLM call; a PII-flagged doc **never** reaches the API | **Test with a document containing personal data** (§3.1). No config may reverse this order | | |
| 7.6 | LLM provider is behind an interface; no vendor SDK at any call site | RD-5 reversibility | | |
| 7.7 | `temperature=0`; prompt + model + version recorded as `extraction_version` | Provenance | | |
| 7.8 | Per-tenant token budget enforced; exhaustion → `waiting`, not failure | | | |
| 7.9 | Tesseract OCR: `eng+chi_sim+tha` all resolve | Trilingual pilot | | |
| 7.10 | OCR page cap (200) and 15-min timeout enforced | (§3.2) | | |
| 7.11 | **GATE** — OCR preserves page-level offsets | Scanned government PDFs are exactly where provenance matters most (§5.2) | | |

## 8. Task pipeline

| # | Check | Expected | Result | Notes |
| --- | --- | --- | --- | --- |
| 8.1 | **RD-2** — `cf_jobs` exists; `UNIQUE(stage, idempotency_key)` present | Exactly-once effects (§3.4) | | |
| 8.2 | **GATE** — Re-enqueueing an identical job is a **no-op returning the prior result** | Idempotency. Test explicitly | | |
| 8.3 | **GATE** — `FOR UPDATE SKIP LOCKED` claim: 2 workers never take the same job | Run concurrently and verify | | |
| 8.4 | Lease 10 min; heartbeat 60s extends it | | | |
| 8.5 | **GATE** — `kill -9` a mid-job worker → job requeued within 60s, **no duplicate effects** | The whole reliability thesis in one test (§3.5) | | |
| 8.6 | Backoff `4^n` ± 25% jitter | (§6.4) | | |
| 8.7 | Failure classification routes correctly: transient / poison / resource / policy / permanent | Poison → DLQ after **1** attempt, not 5 | | |
| 8.8 | **GATE** — `cf_jobs_dlq` captures full context; **nothing silently dropped** | (§6.5) | | |
| 8.9 | DLQ replay by `idempotency_key` resumes rather than duplicates | | | |
| 8.10 | Poison circuit-breaker: same `error_signature` 3× → breaks **that stage, that tenant only** | Containment (§6.6) | | |
| 8.11 | **GATE** — Oversized: > 100 MB rejected at upload; > 200 pages quarantined | Never enters the queue (§3.2) | | |
| 8.12 | Scheduler advisory lock: a second scheduler cannot double-enqueue | (§3.3) | | |
| 8.13 | `backup.pg_dump` **catches up** after a missed run; `health.reconcile` does not | (§3.3) | | |

## 9. Monitoring

| # | Check | Expected | Result | Notes |
| --- | --- | --- | --- | --- |
| 9.1 | `/health/live`, `/health/ready`, `/health/deep` all respond | (§1.4) | | |
| 9.2 | **GATE** — `/health/deep` reports **degraded** when `dlq_depth > 50` while containers are up | **"Green dashboard, filling DLQ" is the exact failure this catches** | | |
| 9.3 | `/health/deep` includes `review_backlog` | Reviewer capacity is an infrastructure signal (V2 §2.2) | | |
| 9.4 | `/metrics` exposes all §7.2 metrics incl. `cf_last_restore_test_age_days` | | | |
| 9.5 | Uptime Kuma polls `/health/deep`, not `/health/live` | Alert on the deep check | | |
| 9.6 | **GATE** — Telegram alert **delivered to the operator's phone** in a live test | An untested alert channel is not an alert channel | | |
| 9.7 | P0 triggers fire: Postgres down · disk < 10% · backup age > 26h · restore test > 120d | | | |
| 9.8 | **GATE** — Logs contain **no PII**, no payload bodies, no credentials, no source-text prompts | Sample and inspect (§7.1) | | |
| 9.9 | Log rotation caps each container at ~250 MB | | | |
| 9.10 | Status page reachable over Tailscale from the Mac mini | | | |

---

# PHASE C — Prove

**This phase is the point.** Everything above says the runtime is configured;
this says it survives contact with reality.

## 10. Failure and recovery drills

| # | Drill | Expected | Result | Notes |
| --- | --- | --- | --- | --- |
| 10.1 | **GATE** — `docker kill cf-worker-parse` mid-job | Restart; lease expires; job requeued ≤ 60s; **no duplicates**; no human action | | |
| 10.2 | **GATE** — `docker kill cf-postgres` | Restart; WAL replay; leased jobs reaped; pipeline resumes; no human action | | |
| 10.3 | `docker kill cf-redis` | Restart; cache cold; **zero data loss** (§4.2) | | |
| 10.4 | `docker kill cf-minio` | Restart; objects intact and readable | | |
| 10.5 | Kill dockerd | systemd `Restart=always` recovers | | |
| 10.6 | **GATE · the headline test** — **Force a Windows reboot mid-pipeline** with jobs in flight | Box returns unattended via `CF-Boot`; **zero data loss; zero duplicate side effects**; in-flight jobs requeued and completed. **This is Step 3's exit gate (V2 §12.3)** | | |
| 10.7 | **GATE** — Simulate a Windows Update reboot at the configured window | Same as 10.6. **The #1 predicted failure mode (§8.1)** | | |
| 10.8 | Fill the disk to < 15% | Intake hard-stops; P0 page; no corruption | | |
| 10.9 | Force OOM on `cf-worker-ocr` (oversized scan) | Killed; retried **once** at concurrency 1; then DLQ. **Not retried forever** | | |
| 10.10 | Feed a deliberately corrupt PDF | Poison class → DLQ after 1 attempt; circuit-breaker after 3 identical signatures | | |
| 10.11 | Revoke the Claude API key mid-run | `extract` jobs retry → DLQ; **no silent fallback to a weaker model**; other stages unaffected | | |
| 10.12 | Stop Tailscale | Factory keeps running; remote access lost; confirm the physical/console fallback (1.9) | | |
| 10.13 | Pull the power (if a UPS exists, test failover) | Boot → WAL replay → healthy; no volume corruption | | |

## 11. Backup and restore

| # | Check | Expected | Result | Notes |
| --- | --- | --- | --- | --- |
| 11.1 | Nightly `pg_dump -Fc` completes; artifact lands on Mac mini **and** B2 | 3-2-1 (§4.5) | | |
| 11.2 | **GATE** — WAL archiving verified by inspecting actual archived files | RPO 5 min depends on this, not on config | | |
| 11.3 | `mc mirror` of MinIO evidence completes to both targets | | | |
| 11.4 | **GATE** — Backups are **encrypted before leaving the box**, key stored **off** Windows 01 | A backup encrypted with a key on the machine you are backing up protects against nothing (§4.5) | | |
| 11.5 | Retention honoured: daily×7, weekly×4, monthly×12 | | | |
| 11.6 | B2 bucket has **Object Lock** | Ransomware fallback (§8.4) | | |
| 11.7 | **GATE — THE ONE THAT MATTERS** — Full restore to a **scratch** WSL2 distro per §8.3, steps 1–10 | Completes within **RTO 4 h** | | |
| 11.8 | **GATE** — Restore step 8: reconcile — leased jobs requeued, DLQ intact, **10 published facts spot-checked against restored evidence** | **A restore that returns the DB but not the evidence is a silent integrity failure that looks healthy** (§8.3) | | |
| 11.9 | PITR to an arbitrary timestamp works | RPO proven, not assumed | | |
| 11.10 | Restore runbook is written and followed by **someone who did not write it** | A runbook only its author can run is not a runbook | | |
| 11.11 | `cf_last_restore_test_age_days` reset to 0; quarterly recurrence scheduled | (CFD-14) | | |

> **11.7 is the single most important item in this document.**
> Everything else verifies configuration. This verifies the business survives a
> disk failure. A backup that has never been restored is a hypothesis.

## 12. Concurrency and load

| # | Check | Expected | Result | Notes |
| --- | --- | --- | --- | --- |
| 12.1 | **GATE** — Connection budget verified under full load: measured peak ≤ 60 | Recompute per §9.3 with real replica counts | | |
| 12.2 | **GATE** — Memory under full load: containers ≤ 20 GB; **`vmmem` never exceeds the `.wslconfig` cap** | Watch the Windows side, not just `docker stats` (§2.4) | | |
| 12.3 | Sustained load: 50 documents through the full pipeline | Measure throughput, p95 per stage, peak RAM | | |
| 12.4 | Backpressure: `review_backlog > 200` → collection pauses | (§9.2) | | |
| 12.5 | **GATE** — Backpressure: `review_backlog > 500` → **intake hard-stops** | The binding constraint is human, not CPU (V2 §2.2) | | |
| 12.6 | `dlq_depth > 50` → affected stage hard-stops | | | |
| 12.7 | Tenant fairness: tenant A's backlog does not starve tenant B | Two-tenant test — **required before Step 6** (V2 §8.3) | | |
| 12.8 | Scale `parse` +1 replica | Throughput rises; budgets hold | | |
| 12.9 | **Document the true ceiling of this box** | The honest answer to "how far does one box go?" — record it | | |
| 12.10 | 72-hour soak at realistic volume | No memory creep, no `vmmem` growth, no lease leaks, no unexplained restarts | | |

---

## 13. Sign-off

### Gate summary

| Phase | GATE items | Blocking failure means |
| --- | --- | --- |
| **A — Audit** | 1.1, 1.2, 1.4, 2.1, 2.2, 2.8 | The design does not fit this hardware. **Re-size and re-approve — do not proceed.** |
| **B — Build** | 3.3, 3.6, 3.9, 4.1, 4.5, 4.6, 4.8, 4.9, 5.1, 5.6, 6.5, 6.7, 6.8, 6.11, 7.5, 7.11, 8.2, 8.3, 8.5, 8.8, 8.11, 9.2, 9.6, 9.8 | The runtime is misconfigured in a way that silently loses data or silently stops. |
| **C — Prove** | 10.1, 10.2, 10.6, 10.7, 11.2, 11.4, 11.7, 11.8, 12.1, 12.2, 12.5 | It has not been shown to survive reality. |

### Open decisions closed by this checklist

| ID | Closed by | Answer |
| --- | --- | --- |
| RD-1 Docker Desktop vs Engine | 2.4, 4.1, 4.2 | |
| RD-8 Host RAM | 1.2 | |
| RD-9 GPU | 1.7 | |
| RD-5 LLM local vs API | 1.7, 7.4, 7.5 | |
| RD-10 Offsite target | 11.1, 11.6 | |

### Verdict

```
PHASE A — AUDIT:   PASS / FAIL      Gates failed: ______
PHASE B — BUILD:   PASS / FAIL      Gates failed: ______
PHASE C — PROVE:   PASS / FAIL      Gates failed: ______

All [AUDIT] placeholders in WINDOWS01_RUNTIME_ARCHITECTURE.md replaced:  YES / NO
Runtime budgets recomputed against real hardware:                        YES / NO
Restore performed and verified (11.7 + 11.8):                            YES / NO
Reboot survival proven (10.6 + 10.7):                                    YES / NO

WINDOWS 01 READY FOR STEP 3 (runtime migration):   YES / NO

Auditor:  ____________________  Date: __________
Architect: ___________________  Date: __________
CEO (Step 4 gate — CFD-35 lawful basis + DPA in place): ______________  Date: ______
```

### Reminders

- **Phase A installs nothing.** If RAM or disk fails, the design changes — not the checklist.
- **Step 2 (Mac mini vertical slice) does not depend on this checklist.** It has no Windows dependency and can run in parallel with Phase A — but only after GoThailandHome's open P0 (CRIT-01, silent lead loss) ships (V2 §12.4).
- **CFD-35 gates Step 4, not Step 3.** The PII gate (7.5) is an engineering control; the lawful basis and DPA for sending source content to the Claude API are a CEO/Legal deliverable.
- **12.7 (tenant fairness) must pass before Step 6**, when TAI FAITH becomes tenant 2 and RLS is enabled (V2 §8.4).
