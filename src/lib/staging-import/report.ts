/**
 * Import Preview Dashboard — WOULD_* stats by entity type.
 */

import type {
  EntityPreviewRow,
  EntityPreviewStats,
  EntityType,
  PreviewAction,
  PreviewStats,
} from "./types.ts";
import { ENTITY_TYPES, PREVIEW_ACTIONS } from "./types.ts";

function emptyStats(): PreviewStats {
  return {
    WOULD_CREATE: 0,
    WOULD_UPDATE: 0,
    WOULD_REVIEW: 0,
    WOULD_REJECT: 0,
    WOULD_DUPLICATE: 0,
    WOULD_QUARANTINE: 0,
    WOULD_SKIP_DUPLICATE: 0,
  };
}

export function emptyEntityPreviewStats(): EntityPreviewStats {
  return {
    developer: emptyStats(),
    project: emptyStats(),
    image: emptyStats(),
    pdf: emptyStats(),
    news: emptyStats(),
  };
}

export function accumulatePreviewStats(
  rows: EntityPreviewRow[],
): { byEntity: EntityPreviewStats; totals: PreviewStats } {
  const byEntity = emptyEntityPreviewStats();
  const totals = emptyStats();
  for (const row of rows) {
    byEntity[row.entityType][row.action] += 1;
    totals[row.action] += 1;
  }
  return { byEntity, totals };
}

export type PreviewDashboard = {
  generatedAt: string;
  totalRows: number;
  byEntity: EntityPreviewStats;
  totals: PreviewStats;
  rows: EntityPreviewRow[];
  note: string;
};

export function buildPreviewDashboard(rows: EntityPreviewRow[]): PreviewDashboard {
  const { byEntity, totals } = accumulatePreviewStats(rows);
  return {
    generatedAt: new Date().toISOString(),
    totalRows: rows.length,
    byEntity,
    totals,
    rows,
    note: "DRY RUN ONLY — no commit, no approval, no storage upload",
  };
}

export function formatPreviewDashboardText(dashboard: PreviewDashboard): string {
  const lines: string[] = [
    "=== Staging Import Preview Dashboard ===",
    `generatedAt: ${dashboard.generatedAt}`,
    `totalRows: ${dashboard.totalRows}`,
    dashboard.note,
    "",
    "-- Totals --",
  ];
  for (const action of PREVIEW_ACTIONS) {
    lines.push(`  ${action}: ${dashboard.totals[action]}`);
  }
  lines.push("", "-- By Entity --");
  for (const entity of ENTITY_TYPES) {
    lines.push(`[${entity}]`);
    for (const action of PREVIEW_ACTIONS) {
      const n = dashboard.byEntity[entity as EntityType][action as PreviewAction];
      if (n > 0) lines.push(`  ${action}: ${n}`);
    }
  }
  return lines.join("\n");
}
