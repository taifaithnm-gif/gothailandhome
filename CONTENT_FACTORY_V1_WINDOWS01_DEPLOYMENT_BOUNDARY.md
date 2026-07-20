# Content Factory V1 Windows 01 Deployment Boundary

**Decision status:** Proposed boundary only. Deployment is prohibited until Human Owner gate G4 and the Alpha RC constraints permit it.

## Role

Windows 01 is a dedicated, removable execution node for the controlled pilot. It may run bounded collection and transformation jobs and retain pilot evidence. It is not the GoThailandHome web host, release machine, ERP host, general AI lab, or shared business server.

The Mac mini remains the control plane: repository work, configuration review, manual operator actions, package inspection, approvals, and management reporting. It must not become a duplicate runtime.

## Allowed component inventory

Product choices and exact versions are intentionally unresolved until CF3-01. All services must use a dedicated service identity, pinned versions, least privilege, bounded resources, structured logs, and a documented clean-removal procedure.

| Component | Purpose | V1 status | Runtime dependency | Storage | Network | Security | Backup | Health check | Rollback/removal |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Minimal runtime | Execute collector/parser/validator workers | **Required** | One owner-approved pinned runtime | Binaries/config only | None except approved dependencies | Dedicated non-admin identity; signed/pinned packages | Config/version manifest | Process alive + test job | Stop service; remove runtime/config after evidence export |
| Scheduler | Start bounded approved refresh/manual jobs | **Required, minimal** | Runtime; OS scheduler acceptable | Job definitions | None | Only approved job IDs; no arbitrary command input | Export definitions | Last/next run + missed-run alert | Disable/delete jobs; retain audit |
| Queue | Preserve stage state and retries | **Required if asynchronous; otherwise deferred** | Runtime metadata store | Small durable pilot queue | Localhost only | Service ACL; payload IDs, not secrets | Included in state backup | Depth, oldest age, failed count | Drain/freeze; restore snapshot; remove |
| Collector | Retrieve only manifest URLs/files | **Required** | Runtime, source policy, scheduler/manual trigger | Temporary transfer area then evidence store | Egress allowlist to 1–2 approved sources; no inbound public access | Rate limits; TLS; no access bypass; credential refs only | Code/config plus evidence backup | Approved fixture/source smoke test | Disable source/job; remove collector; retain evidence |
| Parser | Convert approved source formats to citeable sections | **Required** | Runtime; only selected parser libraries | Temporary work area + versioned output | None | Treat payload as untrusted; file/type/size limits | Parsed output/config | Golden fixture result | Revert parser version; reprocess to new version |
| Validation worker | Normalize, validate, detect deterministic duplicates | **Required** | Runtime, contracts/rules | Versioned candidates/reports | Localhost only | Rules pinned; no silent mutation | State/rules backup | Deterministic canary record | Revert rules; retain old/new outputs |
| Evidence storage | Preserve raw payloads/references, hashes, manifests | **Required** | Filesystem/object abstraction selected at G3 | Capacity for <=100 records plus versions; dedicated pilot path | Local services; backup path only | Encrypt where available; deny-by-default ACL; integrity hashes | Required to separate approved target | Write/read/hash and capacity test | Read-only freeze; export/restore; remove only after verified retention decision |
| Runtime metadata store | Store jobs, versions, states, decisions, audit | **Required** | Owner-approved isolated store | Small bounded database/files; **not production DB** | Localhost only | Dedicated credentials; least privilege; immutable decision policy | Required + restore test | Query/write transaction canary | Stop writes; restore prior snapshot; remove isolated store |
| Logs | Correlate source/job/record/stage failures | **Required** | Runtime/services | Rotated, size-capped dedicated path | Local; optional approved monitoring endpoint | Redaction; no payloads/secrets/credentials | Operational retention per approved policy | Recent heartbeat and error canary | Revert config; export then purge per retention approval |
| Monitoring | Alert on health, failures, backlog, disk, backup | **Required, minimal** | OS/service metrics | Small metric/event retention | No public ingress; approved alert path only | Read-only service access | Config backup | Synthetic health and alert test | Disable agent/rules; retain incident log |
| Backup | Protect evidence and runtime state | **Required** | Approved separate destination/tool | Full initial + bounded incremental/snapshot | Allowlist to backup target only | Encryption, separate credentials, restricted restore | It is the backup layer; restore evidence mandatory | Scheduled status + hash-verified restore drill | Disable schedule; preserve last approved backup per retention |
| OCR worker | Extract text from unavoidable scanned/image-only approved source | **Conditional** | Parser + pinned OCR engine | Temporary images/text; evidence retained | None unless owner approves a service (local preferred) | Sandboxed input; confidence threshold; mandatory human check | OCR output/config if activated | Golden scanned fixture + confidence result | Disable/remove engine; quarantine OCR-derived records |
| Embedding service/index | Semantic matching/search | **Deferred** | Would require model/index/runtime | Not allocated | Not allowed | Not assessed | Not applicable | Not applicable | Not deployed |

## OCR decision

**Conditional, not required by default.** Activate only if:

1. an owner-approved pilot source is scanned/image-only;
2. the source is necessary to the 5–10 project pilot;
3. deterministic text extraction cannot obtain required fields;
4. the OCR engine, resource use, security, confidence threshold, and removal plan pass G4; and
5. every OCR-derived value is checked by a human against the image evidence.

OCR failure or low confidence quarantines the record. It never authorizes inferred text.

## Embedding decision

**Deferred after V1.** Exact hashes, canonical URLs, source external IDs, and deterministic normalized project/developer/geography keys are sufficient for the bounded pilot. Embeddings add model/version, privacy, resource, explainability, and index-backup dependencies without a proven V1 need.

## Explicit exclusions

Windows 01 must not host:

- ERP or any ERP database/service;
- the production GoThailandHome frontend;
- website build, release, CI/CD, or deployment tooling;
- the production website database or any unapproved production database;
- unrelated business projects or shared project credentials;
- broad crawler/discovery tooling;
- experimental AI, OCR, embedding, vector, translation, media, or automation services outside the approved pilot;
- public inbound endpoints unless separately risk-assessed and owner-approved;
- source code workspaces used as the primary development environment.

## Filesystem and identity separation

Use dedicated logical paths for runtime, configuration, evidence, state, logs, temporary files, and backup staging. The service account may write only to pilot paths. Human reviewer credentials must be separate from service credentials. GoThailandHome package handoff is a versioned artifact transfer—not shared write access to the website.

## Network boundary

- Default deny inbound.
- Egress only to the 1–2 approved source endpoints, approved package/backup destination, time/DNS, and explicitly approved monitoring path.
- No access to ERP, production database, website administration, or unrelated LAN services.
- Record source endpoint, TLS result, job ID, byte count, and time for every fetch.

## Deployment gate and rollback

G4 requires: inventory, pinned versions, capacity baseline, service identity/ACL proof, egress allowlist, secret handling, backup target, restore proof, health/alert test, shutdown test, and clean-removal runbook.

Rollback order:

1. stop scheduler and block new jobs;
2. drain or freeze queue;
3. preserve logs, audit, manifests, and evidence hashes;
4. restore the last known-good state/config if recovery is intended;
5. otherwise export verified evidence/state, stop services, revoke credentials, remove pilot components and allowlists;
6. verify no production system changed and record the removal event.

