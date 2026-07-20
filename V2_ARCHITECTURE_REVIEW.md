# V2 Runtime Architecture — Independent Review

**Review target (3 documents):**
`CONTENT_FACTORY_ARCHITECTURE_V2.md` · `WINDOWS01_RUNTIME_ARCHITECTURE.md` · `WINDOWS01_VALIDATION_CHECKLIST.md`
**Date:** 2026-07-17
**Decisions:** `V2_DECISION_REGISTER.md` — 28 findings, namespace `V2-###`
**Out of scope:** the original six documents (frozen) · CFD numbering (unchanged, not reused)

**Disclosure:** I wrote the documents under review. I have therefore weighted this
pass toward finding defects rather than confirming decisions, and every finding
below is anchored to a specific section and a specific failure. The V1 review's
conclusions were not assumed to hold.

---

## 1. Executive verdict

**The knowledge design survives. The runtime design has six defects that would each produce a live outage or a silent data-loss condition, and four of them are self-contradictions inside a single document.**

V2 was written to close CFD-01 ("no runtime architecture"). It does name every
process, container, volume and limit — that gap is genuinely closed. But naming
components is not the same as making them work together, and the seams are where
this fails:

- **The network rule forbids the things the design requires.** `WINDOWS01_RUNTIME_ARCHITECTURE.md` §2.2 states *"Egress for `worker-extract` only. Everything else is offline."* Four specified behaviours need egress: Uptime Kuma → Telegram alerts (§7.3), MinIO `mc mirror` → Backblaze B2 (§4.5), the bge-m3 model download (§2.3), and digest-pinned image pulls (§2.1). MinIO sits on `cf-internal`, declared `internal: true`. **As written, backups cannot leave the box and no alert can ever be delivered.**
- **The monitoring cannot observe its own failure.** `cf-uptime-kuma` runs inside the compose project it monitors. If WSL2, dockerd, or the host dies, Kuma dies with them and sends nothing. §8.1 lists the detection for a WSL2 crash as *"CF-Boot / Kuma silence"* — but nothing external is listening for that silence. **The single most likely catastrophic failure on a one-box deployment produces zero alerts.**
- **The access path does not exist.** Tailscale runs as a **Windows host service** (§1.1). The containers live on Docker bridge networks **inside the WSL2 VM**, behind its NAT. §2.2 calls `cf-edge` *"the only network Tailscale reaches"* — but no port-proxy, no mirrored networking mode, and no Tailscale-inside-WSL2 is specified. **Traffic arriving on the tailnet has no route to `cf-api`.**
- **There is no way to get code onto the box.** No registry, no CI, no build step, in any of the three documents. `cf-api` and `cf-worker` images are referenced eleven times and built nowhere. The Mac mini is **ARM64**; Windows 01 is **x86-64**. The V1 review explicitly flagged this divergence as a risk — **V2 did not solve it, and stopped mentioning it.**
- **The advertised RPO is false.** §4.5 claims *"Effective RPO = 5 minutes (WAL), not 24 hours (dump)"*. The WAL archive target is MinIO — **on the same box, on the same disk**. The scenario WAL archiving exists to survive is the loss of that disk. **Real off-box RPO is 24 hours.** The `archive_command` also invokes `mc`, which is not present in the `pgvector/pgvector:pg17` image, so it would fail on first execution — and a failing `archive_command` fills `pg_wal` until the disk is full and Postgres stops.
- **Evidence immutability makes takedown illegal-by-construction.** §4.3 mandates MinIO Object Lock in **compliance mode, 365 days**. Compliance mode cannot be shortened or overridden by anyone, including root. `CONTENT_FACTORY_ARCHITECTURE_V2.md` §7.4 defines the transition `takedown_pending → removed`, and CFD-35/§9.3 commits to PDPA/GDPR erasure. **Under compliance mode, both are unimplementable for 365 days.** §4.6 even states the conflict — *"Object Lock hard-stops evidence deletion regardless of policy"* — and files it as a note rather than as the blocker it is.

None of these require redesign. The knowledge model, the state machine (V2 §7),
the tenancy model (V2 §8), the queue design (RD-2), and the idempotency spine are
sound and should be kept. Every P0 is a wiring error or an arithmetic error, and
the fixes are local.

**But they change what the Windows 01 audit must ask** — which is why the audit
should not run yet (§8).

---

## 2. What holds up

Genuinely correct, and worth defending against any revision:

| Strength | Where | Why |
| --- | --- | --- |
| **RD-1: Docker Engine in WSL2, not Docker Desktop** | RUNTIME §2.1, RD-1 | Correct and non-obvious. Desktop needs an interactive session and is per-seat licensed; it is not a 24×7 unattended runtime. |
| **RD-2: Postgres `SKIP LOCKED` over Redis** | RUNTIME §3.4 | The reasoning is right for this volume: transactional enqueue in the same commit as the state change removes the dual-write bug class, and jobs restore consistently with the data. The promotion trigger (>50 jobs/s) is concrete. |
| **The `CF-Boot` Task Scheduler insight** | RUNTIME §1.1 | WSL2 not starting at boot is the classic silent death of WSL-hosted services. Identifying it, and tying it to the Windows Update reboot risk, is the document's best operational catch. |
| **Idempotency key + `UNIQUE(stage, idempotency_key)`** | RUNTIME §3.4–§3.5 | At-least-once delivery with exactly-once effects, done the simple way. Makes replay and crash-recovery safe by construction. |
| **Lease + reaper instead of a lock service** | RUNTIME §3.5 | Correct minimal choice. No ZooKeeper-shaped hole. |
| **Backpressure keyed to `review_backlog`** | RUNTIME §9.2, V2 §2.2 | Treating reviewer capacity as an infrastructure signal is the most important idea in the set, and `cf_review_backlog` sitting in `/health/deep` beside disk-free is the right expression of it. |
| **Three-level health check, alerting on `deep`** | RUNTIME §1.4, §7.3 | The "green dashboard, filling DLQ" failure is real and this design catches it — assuming the alert can be delivered (V2-001). |
| **Restore step 8 (reconcile + spot-check evidence)** | RUNTIME §8.3 | A restore that returns the database but not the evidence is a silent integrity failure. Most restore runbooks stop at step 7. This one does not. |
| **Chunks carry `char_start`/`char_end`** | V2 §11.1 | Correctly identified as load-bearing: lose the offsets and the evidence model becomes decorative. |
| **`maxmemory-policy noeviction` set before Redis holds anything** | RUNTIME §2.4 | Setting it now, against a future promotion, is the right instinct. |
| **Named volumes on ext4, never `/mnt/c`** | RUNTIME §2.3 | Correct, and correctly justified by fsync semantics rather than taste. |
| **V2 §12.4 — the factory waits for CRIT-01** | V2 §12.4 | Refusing to consume engineering capacity while a revenue-losing P0 is open is the right call and the right place to say it. |

---

## 3. P0 findings

### V2-001 · The egress rule forbids alerting, backup, and image pulls

**RUNTIME §2.2 vs §2.1, §2.3, §4.5, §7.3**

```text
cf-internal  bridge  ... postgres, redis, minio  ← internal: true, NO egress route
| Egress for `worker-extract` only | ... Everything else is offline. |
```

Four specified behaviours contradict this:

| Needs egress | Stated in | Blocked by |
| --- | --- | --- |
| Uptime Kuma → Telegram | §7.3 (**GATE** in checklist 9.6) | Kuma has no stated egress |
| MinIO `mc mirror` → Backblaze B2 | §4.5, §8.4 | MinIO is `internal: true` |
| bge-m3 weights download (~2.3 GB) | §2.3 ("re-downloadable") | worker-embed has no egress |
| Digest-pinned image pulls | §2.1 | dockerd is outside the container networks, but no rule states it |

The security instinct is right — the evidence store should not be able to phone
home. The implementation is wrong. `internal: true` on MinIO makes the offsite
backup, and therefore the entire disaster-recovery story in §8.4, impossible.

**Required:** an explicit egress matrix, per container, per destination, with the
default denied. MinIO must not egress — a sidecar `mc` container on a separate
egress network should perform the mirror instead. Model weights should be baked
into the image at build time, not fetched at runtime.

### V2-002 · Monitoring cannot detect the failure of its own host

**RUNTIME §7.3, §7.4, §8.1**

`cf-uptime-kuma` is container 11 of 11 in the compose project it monitors. It
detects container-level failures. It cannot detect:

- WSL2 VM crash or `wsl --shutdown`
- dockerd death that takes the project with it
- Windows host hang, BSOD, or power loss
- **`CF-Boot` failing to fire after a Windows Update reboot** — the failure §1.1 correctly identifies as the most likely one

§8.1 lists the detection for a WSL2 crash as *"CF-Boot / Kuma silence"*. **Silence
is not a detection mechanism unless something outside the box is listening**, and
nothing is. §8.4 compounds it: *"Tailscale outage → Factory runs; remote access
lost"* — with no alert path, so the operator learns about it by wondering.

**Required:** an external dead-man's switch. The scheduler pushes a heartbeat to
an off-box endpoint (healthchecks.io, or a Kuma push monitor on the Mac mini);
absence of the heartbeat pages. This is one line of scheduler code and it converts
the highest-probability catastrophic failure from silent to paged.

### V2-003 · The Tailscale → container path does not work as drawn

**RUNTIME §1.1, §2.2**

Tailscale is a **Windows host service** (§1.1). Containers are on Docker bridges
**inside the WSL2 VM**, behind WSL2's NAT. §2.2 asserts `cf-edge` is *"the only
network Tailscale reaches."* Nothing makes that true.

Windows→WSL2 has `localhost` forwarding for the *local* host only. Traffic
arriving from the tailnet on the Windows interface is **not** forwarded to
services inside WSL2 without one of:

1. `networkingMode=mirrored` in `.wslconfig` (**Windows 11 22H2+, and only some builds** — an audit question that §1 of the checklist never asks),
2. `netsh interface portproxy` rules (fragile — the WSL2 IP changes on every restart),
3. Tailscale running **inside** the WSL2 distro instead of on the host.

**Option 3 is the correct answer** and it contradicts §1.1's process layout.

**Consequence:** on a box whose only ingress is Tailscale (§2.2, §3.12), the
review UI and `/health/deep` are unreachable. The system runs and nobody can see
it.

### V2-004 · No build, no registry, no deployment path — and an architecture mismatch

**All three documents**

`cf/api` and `cf/worker` are referenced eleven times across the container table,
the migration one-shot and the scheduler. **Nothing in any document says how those
images come to exist or how they arrive on Windows 01.** There is no registry, no
CI, no build step, no image-promotion story.

Worse, the divergence the V1 review flagged is now silently load-bearing:

> **Mac mini = ARM64. Windows 01 = x86-64.**

Images built on the development machine **will not run** on the runtime host
without multi-arch builds (`buildx`) or building on the target. §2.1 mandates
digest pinning — a digest is architecture-specific, so the pinning rule cannot
even be satisfied without deciding this first.

"Deployment assumptions" is an explicit review area. **The deployment assumption
here is that images appear by magic.**

**Required:** name the registry (GHCR is the obvious fit), the build host, the
`buildx` platform targets, and how Windows 01 authenticates to pull.

### V2-005 · The RPO claim is false, and the archive command cannot run

**RUNTIME §4.1, §4.5**

Two defects in one mechanism.

**(a) The archive target is on the box it protects.**

```ini
archive_command = 'mc cp %p local/cf-wal/%f'
```

§4.5 claims: *"Effective RPO = 5 minutes (WAL), not 24 hours (dump). Stating only
the nightly dump would understate recoverability by 288×."*

That paragraph is exactly backwards. `local/cf-wal` is **MinIO on Windows 01, on
the same disk as `cf-pgdata`**. The failure WAL archiving exists to survive is the
loss of that disk. Volume corruption or host destruction (§8.4) takes the database
and its WAL archive together.

**Real off-box RPO is 24 hours** — the last dump that reached the Mac mini. The
document overstates recoverability by the same 288× it accuses others of
understating.

**(b) `mc` is not in the Postgres image.**

`archive_command` executes **inside `cf-postgres`** (`pgvector/pgvector:pg17`),
which does not ship the MinIO client. The command fails on first execution. A
persistently failing `archive_command` causes Postgres to **retain WAL
indefinitely** → `pg_wal` grows → disk fills → Postgres stops. The `disk_free`
alert (§7.2) would fire eventually, presenting a WAL-archive bug as a capacity
problem.

Checklist 6.4 asks to *"verify an actual WAL file lands in MinIO"* — good instinct,
and it would have caught (b) in Phase B. It cannot catch (a), because (a) is a
design error that a passing test conceals.

**Required:** WAL ships **off-box** continuously (`archive_command` → a Tailscale
mount on the Mac mini, or WAL-G/pgBackRest to B2), and the binary that does it is
present in the Postgres image or the archiving runs as a sidecar. Then restate the
RPO honestly.

### V2-006 · Compliance-mode Object Lock makes takedown and erasure impossible

**RUNTIME §4.3, §4.6 vs `CONTENT_FACTORY_ARCHITECTURE_V2.md` §7.4, §9.3**

```text
| **Object Lock** | **Compliance mode, 365 days** on `cf-raw-*` |
```

**MinIO compliance mode cannot be shortened, overridden, or bypassed by any user,
including root, for the full retention period.** That is its entire purpose.

It directly contradicts two commitments in the architecture it implements:

1. **V2 §7.4** defines `takedown_pending → removed` as a legal state transition, guarded by "takedown approved". Under compliance mode, removal of the underlying evidence is **impossible for 365 days**.
2. **V2 §9.3 / CFD-35** commits to PDPA and GDPR handling. A data-subject erasure request against raw evidence **cannot be honoured**.

RUNTIME §4.6 spots the conflict and files it as an aside:

> *"Object Lock (365d) hard-stops evidence deletion regardless of policy. Retention shorter than 365 days CANNOT be honoured for raw evidence — this is a deliberate conflict that surfaces at policy creation."*

Calling a legal impossibility "deliberate" does not resolve it. A copyright
takedown or an erasure request arriving in month 2 has no compliant answer.

**Required: governance mode, not compliance mode.** Governance preserves
immutability against workers, bad migrations and `rm -rf` — the actual threats
§4.3 names — while permitting a privileged, audited deletion for takedown and
erasure. The audit trail (`cf_audit_events`) is what makes that safe. Checklist
6.8 must then verify that an *unprivileged* delete fails **and** a *privileged,
audited* delete succeeds.

---

## 4. P1 findings

| ID | Finding | Where |
| --- | --- | --- |
| **V2-007** | **`.wslconfig` will not apply.** §2.4 places it at `%UserProfile%\.wslconfig` and calls the memory cap mandatory. `.wslconfig` is read from the **invoking user's** profile. §1.1's `CF-Boot` task specifies "Highest privileges" but **never names the account**. If it runs as SYSTEM, WSL reads `C:\Windows\System32\config\systemprofile\.wslconfig` — the cap silently does not apply, and the exact failure §2.4 calls "the classic Windows failure mode" (vmmem eating the host, Windows killing Tailscale) occurs. | RUNTIME §1.1, §2.4 |
| **V2-008** | **The memory budget is wrong and does not fit.** §2.4 states "sum ≈ 17.5 GB". Actual: 6+0.5+1+1+2+3+4+1+0.5+0.25 = **19.25 GB** against a 20 GB WSL2 cap — **0.75 GB** for the WSL2 kernel, systemd and dockerd, which need 1–2 GB. Also: `cf-migrate` appears in the connection budget but is **absent from the memory table** and has no `mem_limit` (contradicting the §9.3 rule that every container declares one). And summing *limits* against a cap is the wrong analysis — limits are ceilings, not reservations; the doc never distinguishes them. | RUNTIME §2.4, §9.3 |
| **V2-009** | **"Execute inside a transaction" is wrong for long work.** §3.5's executor contract step 4 wraps execution in a transaction. OCR runs up to 15 minutes (§3.2). Holding a Postgres transaction open for 15 minutes blocks vacuum, bloats the DB, and pins a connection from a 60-connection budget. Correct pattern: claim (tx1) → work (**no** transaction) → write results + mark done + enqueue next (tx2). The *intent* — atomic completion + enqueue — is right and survives; the phrasing mandates the pathology. | RUNTIME §3.5 |
| **V2-010** | **Lease (10 min) is shorter than max job duration (15 min).** §3.5 sets a 10-minute lease; §3.2 gives OCR a 15-minute timeout. This works **only** if the 60-second heartbeat fires reliably — and §3.5 never states it must be out-of-band. A heartbeat on the same thread as blocking OCR will not fire; the lease expires; the reaper requeues; **a second worker starts the same OCR while the first still runs.** The idempotency key prevents duplicate rows but not duplicate 15-minute CPU burns on a 6-core box. | RUNTIME §3.2, §3.5 |
| **V2-011** | **Embed batch cannot finish inside its timeout.** §3.2: `embed` timeout 10 min, max payload **500 chunks/job**. bge-m3 on CPU is ~1–3 s/chunk. 500 chunks ≈ 8–25 minutes. The stated maximum payload routinely exceeds the stated timeout → OOM-class retry → concurrency 1 → DLQ (§3.2). **The default configuration dead-letters valid work.** | RUNTIME §3.2 |
| **V2-012** | **No secrets management at all.** The box needs: Claude API key, Postgres password, MinIO root credentials, B2 keys, Telegram bot token, age/gpg backup key. §4.5 says only "key in a password manager, **not on Windows 01**" — for the backup key. Nothing states where the other five live, how they are injected, or how they rotate. `.env` in the compose directory is the default outcome, and nothing forbids it. | All three |
| **V2-013** | **Checklist 6.8 verifies Object Lock too late.** **MinIO Object Lock can only be enabled at bucket creation** — it cannot be applied to an existing bucket. Checklist §6 orders bucket setup (6.7 versioning, 6.9 layout) and then verifies Object Lock at 6.8. If buckets were created in an earlier step without it, the GATE fails and the only remedy is recreating the buckets and re-uploading. Ordering, not just checking. | CHECKLIST §6 |
| **V2-014** | **Binaries assumed into images.** Same class as V2-005(b): `backup.pg_dump` runs from `cf-scheduler` (image `cf/api`) — does it carry `pg_dump`, and at **matching pg17 version**? `mc mirror` (§4.5) runs from where? §8.3 step 5 runs `mc mirror` during restore. No image contents are specified anywhere. | RUNTIME §3.3, §4.5, §8.3 |
| **V2-015** | **The B2 write credential lives on the box it protects.** §8.4's ransomware answer is "restore from B2 immutable (Object Lock)". But the box must hold a B2 credential to write nightly backups. Unless that key is **scoped write-only with no delete**, and B2 Object Lock is verified (checklist 11.6 checks the lock but not the key scope), an attacker who owns Windows 01 owns the offsite copy. §8.4 already assumes the Mac mini is compromised "if on the same tailnet" — B2 deserves the same reasoning. | RUNTIME §4.5, §8.4 |

---

## 5. P2 / P3 findings

| ID | Sev | Finding |
| --- | --- | --- |
| **V2-016** | P2 | **Restore-test threshold stated three ways:** "quarterly" = 90 days (§4.5, §8.3, checklist 11.11), metric alert at **>100** (§7.2), P0 page at **>120d** (§7.3). A quarterly gate that pages 30 days late is not quarterly. |
| **V2-017** | P2 | **`maintenance_work_mem` contradiction:** §4.1 sets `512MB`; §4.4 says the HNSW build needs "~1 GB". The index build will spill. |
| **V2-018** | P2 | **"~1M vectors comfortable" is an overclaim.** 1M × 1024 dims × 4 B ≈ 4 GB of vectors plus HNSW graph, inside a **6 GB** container with `shared_buffers=1536MB`. The index would not stay cached and p95 would blow past the stated 200 ms trigger long before 1M. The V1 pilot (5–20k) is fine; the headroom claim is not. |
| **V2-019** | P2 | **V1's backpressure has no lever.** §9.2: `review_backlog > 200 → pause collection planning`. But §3.3 disables `source.refresh_plan` at V1, and V1 is manual-upload-only (V2 §6.2). The only V1 "intake" is a human uploading a file. The control is designed for the Step-5 fetch collector while being presented as a V1 control. |
| **V2-020** | P2 | **Connection pool sizes appear only in the arithmetic.** §9.3 uses ocr×2, embed×2, extract×3; §2.4's table declares a pool only for parse (3), api (10), scheduler (2). The budget's inputs are asserted where they are consumed, not where they are defined. |
| **V2-021** | P2 | **Kuma cannot reach the workers.** Kuma is on `cf-edge`; workers are only on `cf-internal`. Worker health is observable only indirectly via `/health/deep` queue metrics. Defensible, but never stated — and §2.5's "crash-looping container → Kuma alert" implies a direct check that cannot happen. |
| **V2-022** | P2 | **Redis's remaining job is vague.** §3.4 keeps Redis for "cache, rate-limiting and locks", but §3.3 gives the scheduler a **Postgres** advisory lock, and the only named cache use is the §3.1 token bucket. Redis may be carrying one feature. If so, it is a service, a volume, an AOF config and a health check for a token bucket that Postgres could hold. |
| **V2-023** | P2 | **Checklist Phase A does not ask what the P0s require.** It never audits: WSL2 networking mode support (V2-003), container registry reachability or build capability (V2-004), any external monitoring endpoint (V2-002), or whether an off-box WAL target exists (V2-005). Running Phase A as written returns an incomplete answer — the audit would have to be repeated. **This is the finding that decides the verdict (§8).** |
| **V2-024** | P3 | §8.3's restore steps sum to exactly T+4h against a stated RTO of 4h. Zero slack; any surprise breaches the objective by definition. |
| **V2-025** | P3 | Checklist 7.5 instructs testing the PII gate "with a document containing personal data". Should mandate **synthetic** PII — the alternative is introducing real personal data into a system whose lawful basis (CFD-35) is not yet established. |
| **V2-026** | P3 | Idempotency key already contains `stage` (§3.5), so `UNIQUE(stage, idempotency_key)` (§3.4) is redundant. Harmless, but it signals the key's composition was not thought through. |
| **V2-027** | P3 | **Retry causes duplicate LLM spend.** If `worker-extract` crashes after the Claude call but before commit, the retry calls the API again. The idempotency key prevents duplicate rows, not duplicate cost. Correct behaviour, but §3.1's token budget does not account for it. |
| **V2-028** | P3 | §5.4/V2 §11.3 say old chunks are "retained until dependent facts are re-verified" on a `chunker_version` bump, but no mechanism, owner, or cleanup path is specified. An unbounded retention with no executor — the same shape as CFD-13, which V2 claimed to resolve. |

---

## 6. Missing operational risks

Not wrong — absent.

1. **No capacity number survives contact with V1.** §12.3 asks for a 50-document load test and §12.9 asks to "document the true ceiling", but no document states expected volume. The pilot is *one orphaned article*. The box is sized for a workload nobody has estimated.
2. **No cost model.** §3.1 mandates a "per-tenant daily token budget" and marks it `[AUDIT: no cost model exists yet]`. RD-5 sends every document to the Claude API. **Nobody knows what running this costs per document.** That is a V1 question, not a scaling question.
3. **No log retention or audit-log growth policy.** §7.1 caps container logs at ~250 MB. `cf_audit_events` and `cf_object_versions` are append-only and unbounded (V2 §6.13), and `retention.sweep` (§4.6) does not touch them.
4. **No upgrade path.** Postgres 17 → 18, pgvector versions, bge-m3 replacement, base image CVEs. §2.1 pins by digest, correctly — and never says who unpins, when, or how a pinned 24×7 box gets security patches.
5. **No operator runbook beyond restore.** §8.3 has a restore runbook. There is none for: DLQ triage (the standing weekly task in §6.5), circuit-breaker reset (§6.6), or backpressure release (§9.2).
6. **`docker compose` version drift.** The compose file is in git (checklist 4.13), but nothing pins the Docker Engine or Compose version. An unattended `apt upgrade` inside the WSL2 distro can change the container runtime under a running factory. The image-pinning discipline of §2.1 stops at the images.

---

## 7. Windows 01 readiness

The three documents are the first to make Windows 01 assessable at all — that is
real progress against CFD-01, and the Windows-specific catches (CF-Boot, WSL2
memory cap, Defender exclusions, `/mnt/c` avoidance, Docker Desktop rejection) are
correct and not obvious.

But readiness is currently **blocked by the design, not by the machine**:

| Requirement | Status |
| --- | --- |
| Windows 11 | Addressed (checklist 1.1) — **but the mirrored-networking build question is unasked** (V2-003) |
| Docker Desktop / WSL2 | **Resolved correctly** — Engine in WSL2 (RD-1) |
| 24×7 runtime | Addressed via CF-Boot + systemd — **undermined by V2-007** (`.wslconfig` may not apply) and **V2-002** (no external watchdog) |
| Redis queues | Deliberately deferred (RD-2), with a promotion trigger. Correct. |
| PostgreSQL + pgvector | Correct choice; sizing needs V2-017/V2-018 fixes |
| MinIO | Present — **but `internal: true` breaks backup (V2-001) and compliance mode breaks takedown (V2-006)** |
| OCR / parser / embedding workers | Specified — **V2-010 and V2-011 make the defaults unworkable** |
| Scheduled jobs | Well handled; missed-run semantics are a genuine strength |
| Backups | **RPO claim false (V2-005); credential scope unaddressed (V2-015)** |
| Monitoring | **Blind to its own host (V2-002); cannot deliver alerts (V2-001)** |
| Tailscale-only access | **Path does not exist as drawn (V2-003)** |

---

## 8. Should the Windows 01 read-only audit run now?

This is the one judgement worth taking seriously, because Phase A of the checklist
is genuinely read-only and does not depend on most of the P0s. What is on the box
does not change because the egress table is wrong.

**It should not run yet — for one reason: the P0s change the questions.**

| P0 | Question Phase A must now ask, and does not |
| --- | --- |
| V2-003 | Exact Windows 11 build — does it support `networkingMode=mirrored`? Is Tailscale-in-WSL2 acceptable? |
| V2-004 | Can the box reach GHCR? Can it build images, or must it pull? Is `buildx` multi-arch available on the Mac mini? |
| V2-002 | What external monitoring exists today? Is an off-box heartbeat endpoint reachable and acceptable? |
| V2-005 | Is there an off-box WAL target? Is the Mac mini always-on, or does it sleep? |
| V2-001 | What egress does the network actually permit, per destination? |
| V2-007 | Which account will run `CF-Boot` — and does `.wslconfig` exist under **that** profile? |

Running Phase A now returns an answer to the wrong questionnaire, and the audit
would be repeated. **Fix the six P0s — all documentation edits, none requiring
hardware — then audit once, against the right questions.**

The corrected Phase A should also absorb the four questions above as new items.

---

## 9. Recommended revision scope

Bounded. All six P0s are local edits to `WINDOWS01_RUNTIME_ARCHITECTURE.md` plus
checklist additions. Estimated effort: **half a day of documentation.**

1. **V2-001** — replace the one-line egress rule with a per-container egress matrix, default deny. MinIO stays internal; a sidecar mirrors to B2. Bake model weights into the image.
2. **V2-002** — add an external dead-man's switch: scheduler → off-box heartbeat; absence pages. One scheduler job, one checklist gate.
3. **V2-003** — decide Tailscale-inside-WSL2 (recommended) vs mirrored networking; redraw §1.1 and §2.2 accordingly; add the build question to Phase A.
4. **V2-004** — add a build/registry section: GHCR, `buildx --platform linux/amd64` from the Mac mini, digest pinning per architecture, pull auth.
5. **V2-005** — ship WAL off-box; put the archiving binary where it can run; restate RPO honestly (24h dump / 5min WAL **only once WAL leaves the box**).
6. **V2-006** — governance mode, not compliance mode; checklist verifies both that unprivileged delete fails and that privileged audited delete succeeds.

Then the P1s (V2-007 … V2-015), which are mostly arithmetic and phrasing.

**Do not touch:** the state machine (V2 §7), the tenancy model (V2 §8), RD-1, RD-2,
the idempotency spine, the backpressure concept, or restore step 8. They are the
reason this is a revision and not a redesign.

---

## 10. Final verdict

Six defects would each produce a live outage or a silent data-loss condition on
day one: no alert can be delivered, no host failure can be detected, no user can
reach the system, no code can reach the box, the advertised RPO is false, and
evidence immutability makes takedown legally impossible. Four are
self-contradictions within a single document — the design names its components
correctly and wires them together wrongly.

None require redesign. Every fix is local, and the load-bearing ideas — the state
machine, tenancy, the Postgres queue, idempotency, review-capacity backpressure —
survive intact.

But the P0s change what the hardware audit must ask, so auditing now would
collect the wrong data and force a second pass.

**REVISE V2 DOCUMENTATION BEFORE WINDOWS 01 VALIDATION**
