# V2 Decision Register

**Companion to:** `V2_ARCHITECTURE_REVIEW.md`
**Review target:** `CONTENT_FACTORY_ARCHITECTURE_V2.md` · `WINDOWS01_RUNTIME_ARCHITECTURE.md` · `WINDOWS01_VALIDATION_CHECKLIST.md`
**Date:** 2026-07-17
**Namespace:** `V2-###` — independent of CFD-001…CFD-035, which remain unchanged and are not reused.

**Decisions:** 28 · **P0:** 6 · **P1:** 9 · **P2:** 8 · **P3:** 5

**Severity:** P0 implementation must not start · P1 must be corrected before the affected phase · P2 important improvement · P3 optional refinement

**Doc keys:** `V2` = `CONTENT_FACTORY_ARCHITECTURE_V2.md` · `RT` = `WINDOWS01_RUNTIME_ARCHITECTURE.md` · `CL` = `WINDOWS01_VALIDATION_CHECKLIST.md`

---

## P0 — Implementation must not start

| ID | Document | Section | Finding | Classification | Sev | Required change | Executor | Phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **V2-001** | RT | §2.2 vs §2.1, §2.3, §4.5, §7.3 | **Egress rule forbids what the design requires.** "Egress for `worker-extract` only. Everything else is offline" + MinIO on `internal: true`. But Uptime Kuma must reach Telegram (§7.3, CL 9.6 **GATE**), MinIO must `mc mirror` to B2 (§4.5, §8.4), bge-m3 weights must download (§2.3), and images must pull (§2.1). **As written: no alert can be delivered and no backup can leave the box** — voiding the entire §8.4 DR story. | REVISE BEFORE IMPLEMENTATION | **P0** | Replace with a per-container egress matrix, default deny. MinIO stays internal; a sidecar `mc` container on an egress network mirrors to B2. Bake model weights into the image at build time. | Platform + Architect | Before Phase A |
| **V2-002** | RT | §7.3, §7.4, §8.1 | **Monitoring cannot detect its own host's failure.** `cf-uptime-kuma` is container 11 of the project it monitors. WSL2 crash, dockerd death, host hang, power loss, or **`CF-Boot` failing after a Windows Update reboot** (the failure §1.1 calls most likely) all kill Kuma too. §8.1 lists detection as "Kuma silence" — **nothing external listens for silence.** | REVISE BEFORE IMPLEMENTATION | **P0** | Add an external dead-man's switch: scheduler pushes a heartbeat off-box (healthchecks.io, or Kuma on the Mac mini); absence pages. One scheduler job + one CL gate. | Platform | Before Phase A |
| **V2-003** | RT | §1.1, §2.2 | **Tailscale → container path does not exist.** Tailscale is a **Windows host service**; containers are behind WSL2's NAT. "`cf-edge` — only network Tailscale reaches" is asserted, never implemented. Needs `networkingMode=mirrored` (build-dependent), fragile `portproxy` (WSL2 IP changes each restart), or **Tailscale inside WSL2** (correct — and it contradicts §1.1). **On a Tailscale-only box, the review UI and `/health/deep` are unreachable.** | REVISE BEFORE IMPLEMENTATION | **P0** | Adopt Tailscale-inside-WSL2; redraw §1.1 and §2.2. Add the Windows-build/mirrored-mode question to CL §1. | Platform + Architect | Before Phase A |
| **V2-004** | V2, RT, CL | RT §2.1; all | **No build, no registry, no deployment path.** `cf/api` and `cf/worker` referenced 11× and built nowhere. **Mac mini = ARM64; Windows 01 = x86-64** — images built on the dev machine will not run on the runtime host. Digest pinning (§2.1) is architecture-specific and cannot be satisfied without deciding this. The V1 review flagged this divergence; V2 dropped it. **"Deployment assumptions" reduces to: images appear by magic.** | REVISE BEFORE IMPLEMENTATION | **P0** | Add a build/registry section: GHCR, `buildx --platform linux/amd64` from the Mac mini, per-arch digest pinning, pull authentication. Add registry reachability to CL §2. | Platform + Architect | Before Phase A |
| **V2-005** | RT | §4.1, §4.5 | **RPO claim is false and `archive_command` cannot run.** (a) `archive_command = 'mc cp %p local/cf-wal/%f'` targets **MinIO on the same box and disk** — the failure WAL archiving exists to survive. §4.5's "Effective RPO = 5 minutes … understate by 288×" is exactly backwards; **real off-box RPO is 24 h.** (b) `mc` is **not in `pgvector/pgvector:pg17`** — the command fails on first run; a failing `archive_command` retains WAL until the disk fills and Postgres stops, surfacing as a capacity alert. | REVISE BEFORE IMPLEMENTATION | **P0** | Ship WAL **off-box** continuously (WAL-G/pgBackRest → B2, or a Tailscale mount on the Mac mini). Put the archiving binary where it can execute, or archive via sidecar. **Restate the RPO honestly.** | Platform + Architect | Before Phase A |
| **V2-006** | RT vs V2 | RT §4.3, §4.6 vs V2 §7.4, §9.3 | **Compliance-mode Object Lock makes takedown and erasure impossible.** MinIO compliance mode cannot be shortened or overridden **by anyone, including root**, for 365 days. V2 §7.4 defines `takedown_pending → removed`; V2 §9.3/CFD-35 commits to PDPA/GDPR erasure. **Both are unimplementable for a year.** §4.6 spots the conflict and files it as "deliberate" — calling a legal impossibility deliberate does not resolve it. | REVISE BEFORE IMPLEMENTATION | **P0** | **Governance mode, not compliance mode.** Preserves immutability against workers, migrations and `rm -rf` — the threats §4.3 names — while allowing privileged, audited deletion. CL 6.8 verifies **both**: unprivileged delete fails, privileged audited delete succeeds. | Compliance/Legal + Architect | Before Phase A |

---

## P1 — Must be corrected before the affected phase

| ID | Document | Section | Finding | Classification | Sev | Required change | Executor | Phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **V2-007** | RT | §1.1, §2.4 | **`.wslconfig` will not apply.** Placed at `%UserProfile%\.wslconfig` and called mandatory; WSL reads it from the **invoking user's** profile. `CF-Boot` specifies "Highest privileges" but **never names the account** — as SYSTEM it reads `config\systemprofile\.wslconfig` and the memory cap silently does not apply, producing the exact vmmem failure §2.4 warns about (Windows kills Tailscale; the box is lost remotely). | REVISE BEFORE IMPLEMENTATION | P1 | Name the `CF-Boot` account explicitly (operator account + "Run whether user is logged on or not", stored credentials — **not** SYSTEM). CL 3.6 verifies the cap applies **under that account**. | Platform | Phase B |
| **V2-008** | RT | §2.4, §9.3 | **Memory budget is wrong and does not fit.** Stated "≈ 17.5 GB"; actual **19.25 GB** (6+0.5+1+1+2+3+4+1+0.5+0.25) against a 20 GB WSL2 cap → **0.75 GB** for kernel + systemd + dockerd, which need 1–2 GB. `cf-migrate` is in the connection budget but **absent from the memory table** and has no `mem_limit`, contradicting §9.3's own rule. Summing **limits** against a cap is the wrong analysis — limits are ceilings, not reservations, and the doc never distinguishes them. | REVISE BEFORE IMPLEMENTATION | P1 | Recompute. Distinguish reservations from limits. Add `cf-migrate`. Re-derive against **audited** RAM (RD-8), not the 32 GB assumption. | Architect + Platform | Phase A→B |
| **V2-009** | RT | §3.5 | **"Execute inside a transaction" mandates a pathology.** OCR runs to 15 min (§3.2); a 15-minute open transaction blocks vacuum, bloats the DB, and pins 1 of 60 connections. | REVISE BEFORE IMPLEMENTATION | P1 | Restate: claim (tx1) → work (**no** tx) → write results + mark done + enqueue next (tx2). The atomic-completion intent is right; the phrasing is not. | Architect | Step 2 |
| **V2-010** | RT | §3.2, §3.5 | **Lease (10 min) < max job duration (15 min).** Safe only if the 60 s heartbeat fires — and §3.5 never requires it to be **out-of-band**. An in-thread heartbeat behind blocking OCR will not fire → lease expires → reaper requeues → **a second worker runs the same 15-minute OCR** on a 6-core box. Idempotency saves the rows, not the CPU. | REVISE BEFORE IMPLEMENTATION | P1 | Mandate an out-of-band heartbeat (separate thread/process), **or** set lease > max job duration. Add a CL drill: block the heartbeat, prove no double-execution. | Architect | Step 2 |
| **V2-011** | RT | §3.2 | **Embed defaults dead-letter valid work.** Timeout 10 min, max payload **500 chunks/job**; bge-m3 on CPU ≈ 1–3 s/chunk → 8–25 min. The stated maximum routinely exceeds the stated timeout → resource-class retry → DLQ. | REVISE BEFORE IMPLEMENTATION | P1 | Re-derive from CL 7.2's **measured** benchmark. Batch to fit the timeout with margin (likely ~100 chunks), or raise the timeout. | Architect | Phase B (after 7.2) |
| **V2-012** | V2, RT, CL | All | **No secrets management.** Needed: Claude API key, Postgres password, MinIO root creds, B2 keys, Telegram token, age/gpg key. Only the backup key is addressed ("password manager, not on Windows 01"). Nothing states where the other five live, how they are injected, or how they rotate. **`.env` in the compose directory is the default outcome and nothing forbids it.** | REVISE BEFORE IMPLEMENTATION | P1 | Add a secrets section: Docker secrets or an injected env file outside the repo, ownership, rotation, and a CL gate that no secret is committed. | Platform + Compliance | Phase B |
| **V2-013** | CL | §6 (6.7, 6.8, 6.9) | **Object Lock verified too late to apply.** MinIO Object Lock **can only be enabled at bucket creation**. CL orders bucket setup then verifies the lock at 6.8 — if buckets exist without it, the only remedy is recreate + re-upload. | REVISE BEFORE IMPLEMENTATION | P1 | Reorder: Object Lock is a **creation parameter**, verified immediately after creation and before any object lands. | Platform | Phase B |
| **V2-014** | RT | §3.3, §4.5, §8.3 | **Binaries assumed into images** (same class as V2-005b). `backup.pg_dump` runs from `cf-scheduler` (`cf/api`) — does it carry `pg_dump` at **matching pg17**? Where does `mc mirror` run (§4.5, §8.3 step 5)? **No image contents are specified anywhere.** | REVISE BEFORE IMPLEMENTATION | P1 | Specify image contents per container, with version-matched client binaries. Folds into V2-004's build section. | Platform | Phase B |
| **V2-015** | RT | §4.5, §8.4 | **B2 write credential lives on the box it protects.** §8.4's ransomware answer is "restore from B2 immutable" — but the box holds a B2 key to write nightly. Unless that key is **write-only, no-delete scoped**, an attacker owning Windows 01 owns the offsite copy. §8.4 already assumes the Mac mini is compromised on the same tailnet; B2 deserves the same reasoning. CL 11.6 checks the lock, not the key scope. | REVISE BEFORE IMPLEMENTATION | P1 | Scope the B2 application key write-only/no-delete; verify in CL 11.6 by **attempting a delete and confirming it fails**. | Platform | Phase B |

---

## P2 — Important improvements

| ID | Document | Section | Finding | Classification | Sev | Required change | Executor | Phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **V2-016** | RT, CL | RT §7.2, §7.3, §4.5, §8.3; CL 11.11 | **Restore-test threshold stated three ways:** quarterly = 90 d; metric alert **>100**; P0 page **>120 d**. A quarterly gate that pages 30 days late is not quarterly. | REVISE BEFORE IMPLEMENTATION | P2 | One number. Recommend: test at 90 d, warn at 100 d, page at 110 d. | Platform | Phase B |
| **V2-017** | RT | §4.1 vs §4.4 | `maintenance_work_mem = 512MB` (§4.1) vs "~1 GB" needed for the HNSW build (§4.4). The build will spill. | REVISE BEFORE IMPLEMENTATION | P2 | Reconcile; raise for the build session or lower the claim. | Architect | Step 2 |
| **V2-018** | RT | §4.4 | **"~1M vectors comfortable" overclaims.** 1M × 1024 dims × 4 B ≈ 4 GB of vectors + HNSW graph inside a **6 GB** container with `shared_buffers=1536MB`. The index would not stay cached; p95 breaches the stated 200 ms trigger well before 1M. The pilot (5–20k) is fine; the headroom claim is not. | REVISE BEFORE IMPLEMENTATION | P2 | Restate headroom against the actual memory limit, or raise the limit and redo §2.4. | Architect | Step 2 |
| **V2-019** | RT | §9.2 vs §3.3, V2 §6.2 | **V1 backpressure has no lever.** "`review_backlog > 200` → pause collection planning" — but `source.refresh_plan` is **disabled at V1** and V1 is manual-upload-only. The control is designed for the Step-5 fetch collector and presented as a V1 control. | DEFER TO LATER PHASE | P2 | State that V1's only lever is blocking manual upload; the planner pause activates with the fetch collector at Step 5. | Architect | Step 5 |
| **V2-020** | RT | §2.4 vs §9.3 | Connection pool sizes for ocr/embed/extract appear **only** in §9.3's arithmetic; §2.4's table declares pools only for parse, api, scheduler. The budget's inputs are asserted where consumed, not where defined. | REVISE BEFORE IMPLEMENTATION | P2 | Declare pool size per container in §2.4; §9.3 sums from there. | Architect | Step 2 |
| **V2-021** | RT | §2.2, §2.5 | **Kuma cannot health-check workers** — Kuma is on `cf-edge`, workers only on `cf-internal`. Defensible (worker health surfaces via `/health/deep`), but §2.5's "crash-looping container → Kuma alert" implies a direct check that cannot happen. | REVISE BEFORE IMPLEMENTATION | P2 | State that worker health is observed indirectly; route container restart counts through `/health/deep`. | Platform | Phase B |
| **V2-022** | RT | §3.4, §3.3, §3.1 | **Redis's remaining job may be one token bucket.** Kept for "cache, rate-limiting and locks", but the scheduler lock is a **Postgres** advisory lock and the only named cache use is §3.1's rate limiter. That is a service, a volume, an AOF config and a health check for one feature Postgres could hold. | DEFER TO LATER PHASE | P2 | Either name ≥2 concrete V1 uses, or drop Redis from V1 and reintroduce it with the queue promotion (RD-2). | Architect | Step 2 |
| **V2-023** | CL | §1, §2 | **Phase A does not ask what the P0s require.** It never audits WSL2 networking mode (V2-003), registry reachability or build capability (V2-004), external monitoring endpoints (V2-002), or an off-box WAL target (V2-005). **Running Phase A as written returns an incomplete answer and forces a second audit** — this is the finding that decides the verdict. | REVISE BEFORE IMPLEMENTATION | P2 | Add the four question sets to Phase A **after** the P0 fixes land, then audit once. | Platform + Architect | Before Phase A |

---

## P3 — Optional refinements

| ID | Document | Section | Finding | Classification | Sev | Required change | Executor | Phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **V2-024** | RT | §8.3 | Restore steps sum to exactly T+4h against a stated RTO of 4h. Zero slack — any surprise breaches the objective by definition. | REVISE BEFORE IMPLEMENTATION | P3 | State RTO 6h with a 4h target, or trim the procedure. | Platform | Phase C |
| **V2-025** | CL | 7.5 | Instructs testing the PII gate "with a document containing personal data" — introducing real PII into a system whose lawful basis (CFD-35) is not yet established. | REVISE BEFORE IMPLEMENTATION | P3 | Mandate **synthetic** PII fixtures. | Compliance | Phase B |
| **V2-026** | RT | §3.4 vs §3.5 | Idempotency key already contains `stage`, so `UNIQUE(stage, idempotency_key)` is redundant. Harmless; signals the key composition was not thought through. | ACCEPT | P3 | Optional: drop `stage` from the key, or keep the constraint as documentation. No behavioural change. | Architect | Step 2 |
| **V2-027** | RT | §3.1, §6.4 | **Retry causes duplicate LLM spend.** A crash after the Claude call but before commit re-calls the API on retry. The idempotency key prevents duplicate rows, not duplicate cost. Correct behaviour; §3.1's token budget does not account for it. | ACCEPT | P3 | Note the overshoot in the budget; optionally cache the response by idempotency key before commit. | Architect | Step 4 |
| **V2-028** | RT, V2 | RT §5.4; V2 §11.3 | Old chunks "retained until dependent facts are re-verified" on a `chunker_version` bump — **no mechanism, owner, or cleanup path.** Unbounded retention with no executor: the same shape as CFD-13, which V2 claimed to resolve. | DEFER TO LATER PHASE | P3 | Specify the re-verification trigger and cleanup, or state that old chunks are retained indefinitely at V1 and bound the growth. | Architect | Step 5 |

---

## Summary

| Severity | Count |
| --- | --- |
| **P0** | 6 |
| **P1** | 9 |
| **P2** | 8 |
| **P3** | 5 |
| **Total** | **28** |

| Classification | Count |
| --- | --- |
| REVISE BEFORE IMPLEMENTATION | 22 |
| DEFER TO LATER PHASE | 3 |
| ACCEPT | 2 |
| REMOVE AS OVERENGINEERING | 0 |
| REQUIRES WINDOWS 01 AUDIT DATA | 1 (V2-008 — re-derive against audited RAM) |

**Notable:** zero findings classified REMOVE AS OVERENGINEERING. The V1 review
recorded eight. V2 corrected the scope inflation and did not reintroduce it — the
new defects are the opposite failure mode: **under-specification at the seams
between correctly-chosen components.**

### Critical path

All six P0s are **documentation edits requiring no hardware access**. Estimated
effort: half a day.

```
V2-001 (egress matrix)        ┐
V2-002 (external watchdog)    │
V2-003 (Tailscale in WSL2)    ├─► V2-023 (rewrite Phase A questions) ─► Windows 01 audit
V2-004 (build + registry)     │
V2-005 (off-box WAL)          │
V2-006 (governance mode)      ┘
```

**V2-023 is the gate.** The six P0s change what Phase A must ask; fix them, absorb
the new questions, then audit **once**.

### Unchanged by this review

`CONTENT_FACTORY_ARCHITECTURE_V2.md` §7 (state machine), §8 (tenancy), §11
(chunks/embeddings), RD-1, RD-2, the idempotency spine, review-capacity
backpressure, and restore step 8. **These are why this is a revision and not a
redesign.** CFD-001…CFD-035 are untouched.

---

**REVISE V2 DOCUMENTATION BEFORE WINDOWS 01 VALIDATION**
