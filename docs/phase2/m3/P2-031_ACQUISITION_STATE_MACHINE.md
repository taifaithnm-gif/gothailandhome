# P2-031 — Acquisition State Machine

Statuses: submitted → enriching → in_review → approved → published | rejected | withdrawn.

Illegal transitions encoded in `src/lib/acquisition/state-machine.ts` (`canTransitionAcquisition`).

Permissions: submitter may withdraw from submitted; ops may advance/reject; published→rejected supports unpublish rollback.
