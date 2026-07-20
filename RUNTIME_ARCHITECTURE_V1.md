# Runtime Architecture V1

**Status:** Sprint 3 planning architecture only  
**Authorization:** No runtime creation, installation, Docker/container work, Windows 01 change, live connection, collection, OCR, embedding, database change, deployment, or publication

## Objective

Define a minimal, removable, single-host runtime boundary capable of supporting the approved V1 pilot after later approval. The runtime must preserve evidence and audit history, enforce deterministic validation and human review, and remain isolated from the production website and database.

## Logical architecture

```text
Scheduler
  -> Queue
  -> Collector
  -> Evidence Storage
  -> Parser
  -> Validation Worker
  -> Review Queue
  -> Human Review

All components
  -> Log Service
  -> Monitoring
  -> Backup
```

The diagram describes future message/data movement only. It does not authorize a collector or any live source.

## Components

1. Scheduler
2. Queue
3. Collector
4. Parser
5. Validation Worker
6. Review Queue
7. Evidence Storage
8. Log Service
9. Monitoring
10. Backup

No OCR, embedding/vector service, production database, website frontend, release tooling, ERP, AI generation service, or unrelated project service belongs in V1.

## Architecture principles

- **Single pilot:** Bangkok new condominium projects; <=2 approved sources, <=10 projects, <=100 normalized records.
- **Single host candidate:** Windows 01 only after G3/G4 approval; no high availability, cluster, distributed broker, or container orchestration.
- **Product-neutral:** This sprint selects no runtime language, scheduler, queue, storage engine, monitoring vendor, or backup product.
- **Fail closed:** Missing source approval, evidence, integrity, version, validation, human review, or audit blocks progression.
- **Evidence first:** Raw evidence is preserved and hashed before parsing/validation.
- **Idempotent:** Repeat work uses stable keys and cannot duplicate canonical output or overwrite evidence/decisions.
- **Human governed:** System/AI routes and recommends; only assigned humans approve records, publication, and rollback.
- **Append-only history:** Evidence, decisions, versions and audit events are never silently overwritten.
- **Reversible:** Configuration/runtime removal preserves required evidence/audit/backup; every future publication has rollback.
- **Production isolated:** No production database, frontend, deployment credentials, release tooling, or direct publish path.

## Logical data flow and gates

| Step | Input | Output | Hard gate |
| --- | --- | --- | --- |
| Schedule | Approved job definition | Queue job reference | Source/manifest/runtime profile approved |
| Queue | Versioned job envelope | Leased work item | Idempotency key and cap enforcement |
| Collect | Approved source/job | Immutable raw evidence reference/hash | No unapproved access; evidence write succeeds first |
| Parse | Verified evidence | Versioned parsed/citeable output | Hash/source/version valid; unsupported fails/quarantines |
| Validate | Parsed output + frozen standards | Candidate + validation/duplicate/freshness result | 100% P0 deterministic rules |
| Review route | Candidate/results/evidence | Human review task | Complete traceability; no auto-approval |
| Human review | Exact task/version/evidence | Immutable decision/state transition | Assigned human; mandatory checklist |
| Package boundary | Approved records only | Future package candidate | Separate publication workflow; not part of runtime deployment here |

## Trust boundaries

- External source boundary: future egress only to explicitly approved sources.
- Runtime boundary: dedicated identity, configuration and logical directories.
- Evidence boundary: immutable/retrievable artifact references and hashes.
- Human boundary: authenticated role assignment and immutable decisions.
- Production boundary: no direct production access.
- Backup boundary: separate approved target and clean restore verification.

## Runtime lifecycle

```text
planned -> approved_for_build -> installed -> configured -> validated
-> pilot_ready -> running -> paused -> stopped -> removed
```

Only `planned` applies in Sprint 3. Every later transition requires separate approval, evidence and rollback/removal procedure.

## Failure posture

- Scheduler failure: no jobs start; alert.
- Queue failure: stop dispatch; preserve job state.
- Collector/evidence failure: no parser progression.
- Parser/validation failure: quarantine or route technical review; no silent drop.
- Review Queue failure: preserve approved candidate state; no auto-approval.
- Logging/audit failure: stop affected authoritative transition.
- Monitoring failure: treat runtime health as unknown and pause new work.
- Backup/restore failure: block deployment/publication readiness.

## Windows 01 boundary

Windows 01 is only a future candidate for this minimal runtime. Before any deployment, the Human Owner must approve component inventory, versions, physical paths/ACLs, service identity, secrets, network allowlist, capacity, logs, monitoring, backup/restore, startup/shutdown, and clean removal. This architecture creates none of them.

