/**
 * Thin import-session repository helpers (design surface).
 */

import type { StagingImportSession } from "./types.ts";
import type { ImportSessionRepository } from "./repository.ts";

export type { ImportSessionRepository };

export function assertSessionSimulationCeiling(
  status: StagingImportSession["status"],
): void {
  if (
    status === "COMMITTING" ||
    status === "COMMITTED" ||
    status === "PARTIAL_FAILURE"
  ) {
    throw new Error(
      `Simulation may not reach status ${status}; ceiling is READY_FOR_COMMIT`,
    );
  }
}
