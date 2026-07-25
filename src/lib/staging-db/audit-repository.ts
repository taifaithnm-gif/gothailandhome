/** Audit repository — append-only design surface. */
export type { AuditRepository } from "./repository.ts";

import { createHash } from "node:crypto";
import { stableStringify } from "./environment-guard.ts";
import type { AuditActorType, StagingAuditEvent } from "./types.ts";
import { SIMULATION_ACTOR_TYPES } from "./types.ts";
import { StagingDbError } from "./errors.ts";

export function assertSimulationActor(actor: AuditActorType): void {
  if (!(SIMULATION_ACTOR_TYPES as readonly string[]).includes(actor)) {
    throw new StagingDbError(
      "INVALID_AUDIT_ACTOR",
      `Simulation actor_type must be SYSTEM or IMPORTER, got ${actor}`,
      { actor },
    );
  }
}

export function buildAuditEvent(input: {
  id: string;
  importSessionId: string;
  eventType: string;
  entityType?: string | null;
  entityId?: string | null;
  actorType: AuditActorType;
  actorId: string;
  previousState?: string | null;
  nextState?: string | null;
  reason?: string | null;
  metadata?: Record<string, unknown>;
  createdAt: string;
}): StagingAuditEvent {
  assertSimulationActor(input.actorType);
  const metadata = input.metadata ?? {};
  return {
    id: input.id,
    import_session_id: input.importSessionId,
    event_type: input.eventType,
    entity_type: input.entityType ?? null,
    entity_id: input.entityId ?? null,
    actor_type: input.actorType,
    actor_id: input.actorId,
    previous_state: input.previousState ?? null,
    next_state: input.nextState ?? null,
    reason: input.reason ?? null,
    payload_hash: createHash("sha256")
      .update(stableStringify(metadata))
      .digest("hex"),
    metadata_json: metadata,
    created_at: input.createdAt,
  };
}
