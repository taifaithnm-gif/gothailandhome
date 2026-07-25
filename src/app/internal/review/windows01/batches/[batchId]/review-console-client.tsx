"use client";

import { useMemo, useState } from "react";

type Bundle = {
  summary: Record<string, unknown>;
  developers: Array<Record<string, unknown>>;
  projects: Array<Record<string, unknown>>;
  images: Array<Record<string, unknown>>;
  pdfs: Array<Record<string, unknown>>;
  news: Array<Record<string, unknown>>;
  reviewItems: Array<Record<string, unknown>>;
  duplicates: Array<Record<string, unknown>>;
  conflicts: Array<Record<string, unknown>>;
  ready: Array<Record<string, unknown>>;
  rejected: Array<Record<string, unknown>>;
  quarantined: Array<Record<string, unknown>>;
};

const TABS = [
  "summary",
  "developers",
  "projects",
  "images",
  "pdfs",
  "news",
  "review",
  "duplicates",
  "conflicts",
  "ready",
] as const;

type Tab = (typeof TABS)[number];

function escapeText(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function SummaryCards({ summary }: { summary: Record<string, unknown> }) {
  const byEntity = (summary.byEntityType ?? {}) as Record<string, number>;
  const cards: Array<[string, string | number | boolean | undefined]> = [
    ["Entities", summary.totalEntities as number | undefined],
    ["Review items", summary.totalReviewItems as number | undefined],
    ["Developers", byEntity.developer],
    ["Projects", byEntity.project],
    ["Images", byEntity.image],
    ["PDFs", byEntity.pdf],
    ["News", byEntity.news],
    ["DB writes", summary.databaseWrites as number | undefined],
    ["Storage", summary.storageUploads as number | undefined],
    ["Prod safe", summary.productionSafe ? "YES" : "NO"],
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map(([label, value]) => (
        <div
          key={label}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"
        >
          <div className="text-xs uppercase tracking-wide text-white/50">
            {label}
          </div>
          <div className="mt-1 text-xl font-semibold text-white">
            {String(value ?? "—")}
          </div>
        </div>
      ))}
    </div>
  );
}

function Pager({
  page,
  pageSize,
  total,
  onChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="mt-3 flex items-center gap-3 text-sm text-white/70">
      <button
        type="button"
        className="rounded border border-white/20 px-2 py-1 disabled:opacity-40"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        Prev
      </button>
      <span>
        Page {page} / {pages} ({total} rows)
      </span>
      <button
        type="button"
        className="rounded border border-white/20 px-2 py-1 disabled:opacity-40"
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
      >
        Next
      </button>
    </div>
  );
}

function RowDetails({ row }: { row: Record<string, unknown> }) {
  const [openEvidence, setOpenEvidence] = useState(false);
  const [openRaw, setOpenRaw] = useState(false);
  return (
    <div className="mt-2 space-y-2 border-t border-white/10 pt-2 text-xs">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded bg-white/10 px-2 py-1"
          onClick={() => setOpenEvidence((v) => !v)}
        >
          View Evidence
        </button>
        <button
          type="button"
          className="rounded bg-white/10 px-2 py-1"
          onClick={() => setOpenRaw((v) => !v)}
        >
          View Source Metadata
        </button>
        <span className="rounded border border-dashed border-amber-400/40 px-2 py-1 text-amber-200">
          Marking Preview (no-op)
        </span>
      </div>
      {openEvidence ? (
        <pre className="overflow-auto rounded bg-black/40 p-2 text-[11px] text-emerald-100">
          {escapeText(JSON.stringify(row.evidence ?? row.provenance ?? {}, null, 2))}
        </pre>
      ) : null}
      {openRaw ? (
        <pre className="overflow-auto rounded bg-black/40 p-2 text-[11px] text-sky-100">
          {escapeText(
            JSON.stringify(
              row.rawPayload ?? row.provenance ?? row,
              null,
              2,
            ),
          )}
        </pre>
      ) : null}
    </div>
  );
}

export function ReviewConsoleClient({
  batchId,
  bundle,
}: {
  batchId: string;
  bundle: Bundle;
}) {
  const [tab, setTab] = useState<Tab>("summary");
  const [query, setQuery] = useState("");
  const [entityType, setEntityType] = useState("");
  const [reviewState, setReviewState] = useState("");
  const [severity, setSeverity] = useState("");
  const [confidence, setConfidence] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const activeRows = useMemo(() => {
    switch (tab) {
      case "developers":
        return bundle.developers;
      case "projects":
        return bundle.projects;
      case "images":
        return bundle.images;
      case "pdfs":
        return bundle.pdfs;
      case "news":
        return bundle.news;
      case "review":
        return bundle.reviewItems;
      case "duplicates":
        return bundle.duplicates;
      case "conflicts":
        return bundle.conflicts;
      case "ready":
        return bundle.ready;
      default:
        return [];
    }
  }, [tab, bundle]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = activeRows;
    if (entityType) {
      rows = rows.filter((r) => String(r.entityType ?? tab) === entityType);
    }
    if (reviewState) {
      rows = rows.filter(
        (r) =>
          String(r.reviewState ?? r.decision ?? "") === reviewState,
      );
    }
    if (severity) {
      rows = rows.filter((r) => String(r.severity ?? "") === severity);
    }
    if (confidence) {
      rows = rows.filter(
        (r) =>
          String(r.confidence ?? r.provinceConfidence ?? "").toUpperCase() ===
          confidence.toUpperCase(),
      );
    }
    if (q) {
      rows = rows.filter((r) => JSON.stringify(r).toLowerCase().includes(q));
    }
    return rows;
  }, [
    activeRows,
    query,
    entityType,
    reviewState,
    severity,
    confidence,
    tab,
  ]);

  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      <SummaryCards summary={bundle.summary} />

      <nav className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setTab(t);
              setPage(1);
            }}
            className={`rounded-full px-3 py-1.5 text-sm ${
              tab === t
                ? "bg-amber-300 text-black"
                : "bg-white/10 text-white/80 hover:bg-white/15"
            }`}
          >
            {t}
          </button>
        ))}
      </nav>

      {tab === "summary" ? (
        <section className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-lg text-white">Batch Summary</h2>
          <pre className="mt-3 overflow-auto text-xs text-white/80">
            {escapeText(JSON.stringify(bundle.summary, null, 2))}
          </pre>
          <p className="mt-3 text-xs text-white/50">
            Route: /internal/review/windows01/batches/{batchId}
          </p>
        </section>
      ) : (
        <section className="space-y-4">
          <div className="grid gap-2 md:grid-cols-5">
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search…"
              className="rounded border border-white/15 bg-black/30 px-3 py-2 text-sm"
            />
            <select
              value={entityType}
              onChange={(e) => {
                setEntityType(e.target.value);
                setPage(1);
              }}
              className="rounded border border-white/15 bg-black/30 px-3 py-2 text-sm"
            >
              <option value="">Entity type</option>
              <option value="developer">developer</option>
              <option value="project">project</option>
              <option value="image">image</option>
              <option value="pdf">pdf</option>
              <option value="news">news</option>
              <option value="review_item">review_item</option>
            </select>
            <select
              value={reviewState}
              onChange={(e) => {
                setReviewState(e.target.value);
                setPage(1);
              }}
              className="rounded border border-white/15 bg-black/30 px-3 py-2 text-sm"
            >
              <option value="">Review state</option>
              {[
                "RECEIVED",
                "VALIDATED",
                "REVIEW_REQUIRED",
                "CONFLICT",
                "DUPLICATE",
                "READY_FOR_APPROVAL",
                "REJECTED",
                "QUARANTINED",
                "ACCEPT_CANDIDATE",
                "DUPLICATE_CANDIDATE",
              ].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              value={severity}
              onChange={(e) => {
                setSeverity(e.target.value);
                setPage(1);
              }}
              className="rounded border border-white/15 bg-black/30 px-3 py-2 text-sm"
            >
              <option value="">Severity</option>
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
            </select>
            <select
              value={confidence}
              onChange={(e) => {
                setConfidence(e.target.value);
                setPage(1);
              }}
              className="rounded border border-white/15 bg-black/30 px-3 py-2 text-sm"
            >
              <option value="">Confidence</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
              <option value="UNKNOWN">UNKNOWN</option>
            </select>
          </div>

          <div className="overflow-auto rounded-xl border border-white/10">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-white/5 text-xs uppercase tracking-wide text-white/60">
                <tr>
                  <th className="px-3 py-2">ID</th>
                  <th className="px-3 py-2">State / Decision</th>
                  <th className="px-3 py-2">Flags</th>
                  <th className="px-3 py-2">Detail</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row, idx) => {
                  const id = String(
                    row.id ??
                      row.candidateId ??
                      row.entityId ??
                      row.sourceId ??
                      idx,
                  );
                  const state = String(
                    row.reviewState ?? row.decision ?? "—",
                  );
                  const unknownDev =
                    row.identityStatus === "UNKNOWN" ||
                    row.developerIdentityStatus === "UNKNOWN";
                  const provinceConflict = row.provinceConflict === true;
                  return (
                    <tr
                      key={`${id}-${idx}`}
                      className="border-t border-white/10 align-top"
                    >
                      <td className="px-3 py-3 font-mono text-xs text-amber-100">
                        {escapeText(id)}
                      </td>
                      <td className="px-3 py-3">
                        <span className="rounded bg-white/10 px-2 py-0.5 text-xs">
                          {escapeText(state)}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-xs">
                        {unknownDev ? (
                          <span className="mr-1 rounded bg-rose-500/20 px-1.5 py-0.5 text-rose-200">
                            UNKNOWN DEV
                          </span>
                        ) : null}
                        {provinceConflict ? (
                          <span className="mr-1 rounded bg-orange-500/20 px-1.5 py-0.5 text-orange-200">
                            PROVINCE CONFLICT
                          </span>
                        ) : null}
                        {tab === "images" ? (
                          <span className="rounded bg-slate-500/20 px-1.5 py-0.5 text-slate-200">
                            local preview:{" "}
                            {escapeText(
                              String(row.relativePreviewPath ?? "placeholder"),
                            )}
                          </span>
                        ) : null}
                        {tab === "pdfs" ? (
                          <span className="rounded bg-slate-500/20 px-1.5 py-0.5 text-slate-200">
                            pages={escapeText(row.pages)} category=
                            {escapeText(row.category)}
                          </span>
                        ) : null}
                        {tab === "duplicates" ? (
                          <span className="rounded bg-violet-500/20 px-1.5 py-0.5 text-violet-100">
                            duplicate compare
                          </span>
                        ) : null}
                      </td>
                      <td className="px-3 py-3">
                        <div className="text-white/80">
                          {escapeText(
                            row.name ??
                              row.title ??
                              row.sourceReason ??
                              row.mappedReason ??
                              row.reason ??
                              "",
                          )}
                        </div>
                        <RowDetails row={row} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pager
            page={page}
            pageSize={pageSize}
            total={filtered.length}
            onChange={setPage}
          />
        </section>
      )}

      <p className="text-xs text-white/40">
        Buttons are preview-only. Approve / Publish / Delete are intentionally
        absent. External images are never loaded.
      </p>
    </div>
  );
}
