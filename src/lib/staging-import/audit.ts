/**
 * Append-only audit log for staging import sessions.
 */

import { createHash } from "node:crypto";

import type { AuditEvent } from "./types.ts";

let seq = 0;

function nextId(): string {
  seq += 1;
  return `audit-${Date.now()}-${seq}`;
}

export function createAuditEvent(
  sessionId: string,
  action: string,
  detail: Record<string, unknown> = {},
  actor: AuditEvent["actor"] = "system",
): AuditEvent {
  return {
    id: nextId(),
    at: new Date().toISOString(),
    sessionId,
    actor,
    action,
    detail,
  };
}

export class AuditLog {
  readonly sessionId: string;
  private readonly events: AuditEvent[] = [];
  private prevHash: string | null = null;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  append(
    action: string,
    detail: Record<string, unknown> = {},
    actor: AuditEvent["actor"] = "system",
  ): AuditEvent & { eventHash: string; prevHash: string | null } {
    const event = createAuditEvent(this.sessionId, action, detail, actor);
    const payload = JSON.stringify({
      ...event,
      prevHash: this.prevHash,
    });
    const eventHash = createHash("sha256").update(payload).digest("hex");
    const sealed = { ...event, eventHash, prevHash: this.prevHash };
    this.events.push(event);
    this.prevHash = eventHash;
    return sealed;
  }

  list(): readonly AuditEvent[] {
    return this.events;
  }

  count(): number {
    return this.events.length;
  }
}
