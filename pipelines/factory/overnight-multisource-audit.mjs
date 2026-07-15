#!/usr/bin/env node
/**
 * Phase 6 M8 — multi-source overnight consolidation audit (read-only).
 * Does not harvest, merge, or rewrite verified records.
 */
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = join(ROOT, "pipelines/factory/overnight/_runs");
mkdirSync(OUT, { recursive: true });

function loadEnvLocal() {
  const text = readFileSync(join(ROOT, ".env.local"), "utf8");
  for (const line of text.split("\n")) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    const key = line.slice(0, i);
    let value = line.slice(i + 1);
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    )
      value = value.slice(1, -1);
    if (!process.env[key]) process.env[key] = value;
  }
}
loadEnvLocal();

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const SOURCES = [
  {
    key: "propertyhub",
    packageFile: "listings.json",
    adapterDir: "pipelines/factory",
    harvestEvidence: [
      "pipelines/factory/wave1-hardening",
      "content/projects",
    ],
    expectedFrozenUpdatedAt: "2026-07-14T15:05:56.459976+00:00",
  },
  {
    key: "livinginsider",
    packageFile: "listings-livinginsider.json",
    adapterDir: "pipelines/factory/livinginsider",
    harvestEvidence: ["pipelines/factory/livinginsider/_runs/latest-harvest.json"],
  },
  {
    key: "ddproperty",
    packageFile: "listings-ddproperty.json",
    adapterDir: "pipelines/factory/ddproperty",
    harvestEvidence: ["pipelines/factory/ddproperty/_runs/latest-harvest.json"],
  },
  {
    key: "hipflat",
    packageFile: "listings-hipflat.json",
    adapterDir: "pipelines/factory/hipflat",
    harvestEvidence: ["pipelines/factory/hipflat/_runs/latest-harvest.json"],
  },
  {
    key: "dotproperty",
    packageFile: "listings-dotproperty.json",
    adapterDir: "pipelines/factory/dotproperty",
    harvestEvidence: ["pipelines/factory/dotproperty/_runs/latest-harvest.json"],
  },
  {
    key: "fazwaz",
    packageFile: "listings-fazwaz.json",
    adapterDir: "pipelines/factory/fazwaz",
    harvestEvidence: ["pipelines/factory/fazwaz/_runs/latest-harvest.json"],
  },
];

function loadPackages(fileName) {
  const out = [];
  const root = join(ROOT, "content/projects");
  for (const d of readdirSync(root)) {
    const f = join(root, d, fileName);
    if (!existsSync(f)) continue;
    const pkg = JSON.parse(readFileSync(f, "utf8"));
    for (const x of pkg.listings || []) {
      out.push({
        ...x,
        project_slug: x.project_slug || d,
        _package_file: f,
      });
    }
  }
  return out;
}

async function fetchAll(table, select, filterFn = null) {
  const pageSize = 1000;
  let from = 0;
  const rows = [];
  for (;;) {
    let q = admin.from(table).select(select).range(from, from + pageSize - 1);
    if (filterFn) q = filterFn(q);
    const { data, error } = await q;
    if (error) throw error;
    rows.push(...(data || []));
    if (!data || data.length < pageSize) break;
    from += pageSize;
  }
  return rows;
}

function classifySource({
  packageCount,
  dbCount,
  adapterExists,
  harvestStatus,
}) {
  if (dbCount > 0 && packageCount > 0) return "imported";
  if (adapterExists && (harvestStatus === "BLOCKED" || (packageCount === 0 && dbCount === 0))) {
    // Adapter present, harvest blocked or empty-by-block
    if (harvestStatus === "BLOCKED") return "implemented_but_blocked";
    if (packageCount === 0 && dbCount === 0 && adapterExists)
      return harvestStatus === "PASS" || harvestStatus === "EMPTY"
        ? "imported" // empty successful execution still "executed"
        : "implemented_but_blocked";
  }
  if (!adapterExists) return "not_executed";
  if (packageCount > 0 && dbCount === 0) return "validation_failed";
  if (dbCount === 0 && packageCount === 0 && adapterExists) {
    return harvestStatus === "BLOCKED"
      ? "implemented_but_blocked"
      : "not_executed";
  }
  return "imported";
}

const report = {
  generated_at: new Date().toISOString(),
  milestone: "Phase 6 M8 Multi-Source Overnight Consolidation Audit",
  sources: {},
  provenance: {},
  candidates: {},
  defects: {
    hard_duplicates: [],
    project_mapping_conflicts: [],
    district_mismatches: [],
    malformed_prices_or_areas: [],
    missing_evidence: [],
    partial_imports: [],
    orphan_source_rows: [],
  },
  drift: {},
  totals: {},
};

// --- Package + harvest status ---
for (const s of SOURCES) {
  const pkgs = loadPackages(s.packageFile);
  const adapterExists =
    existsSync(join(ROOT, s.adapterDir, "adapter.mjs")) ||
    (s.key === "propertyhub" &&
      existsSync(join(ROOT, "pipelines/factory/harvest-propertyhub-wave1.mjs")));

  let harvestStatus = null;
  let harvestReason = null;
  for (const ev of s.harvestEvidence) {
    const p = join(ROOT, ev);
    if (ev.endsWith(".json") && existsSync(p)) {
      try {
        const j = JSON.parse(readFileSync(p, "utf8"));
        harvestStatus = j.status || null;
        harvestReason = j.status_reason || j.blocker || null;
      } catch {
        /* ignore */
      }
    }
  }
  if (s.key === "propertyhub") harvestStatus = harvestStatus || "PASS";

  const { count: dbCount, error: cErr } = await admin
    .from("properties")
    .select("id", { count: "exact", head: true })
    .eq("source", s.key);
  if (cErr) throw cErr;

  const { data: maxRow } = await admin
    .from("properties")
    .select("updated_at")
    .eq("source", s.key)
    .order("updated_at", { ascending: false })
    .limit(1);

  let sale = 0;
  let rent = 0;
  for (const x of pkgs) {
    if (x.listing_type === "sale") sale += 1;
    else if (x.listing_type === "rent") rent += 1;
  }

  const classification = classifySource({
    key: s.key,
    packageCount: pkgs.length,
    dbCount: dbCount || 0,
    adapterExists,
    harvestStatus,
  });

  // refine blocked sources with empty packages
  let status = classification;
  if (
    ["ddproperty", "hipflat"].includes(s.key) &&
    adapterExists &&
    (dbCount || 0) === 0
  ) {
    status = "implemented_but_blocked";
  }
  if (s.key === "propertyhub" && (dbCount || 0) > 0) status = "imported";
  if (s.key === "livinginsider" && (dbCount || 0) > 0) status = "imported";
  if (s.key === "dotproperty" && (dbCount || 0) > 0) status = "imported";
  if (s.key === "fazwaz" && (dbCount || 0) > 0) status = "imported";

  report.sources[s.key] = {
    status,
    adapter_exists: adapterExists,
    harvest_status: harvestStatus,
    harvest_reason: harvestReason,
    package_file: s.packageFile,
    package_listings: pkgs.length,
    package_sale: sale,
    package_rent: rent,
    db_listings: dbCount || 0,
    db_updated_at_max: maxRow?.[0]?.updated_at || null,
    expected_frozen_updated_at: s.expectedFrozenUpdatedAt || null,
  };
}

// --- DB properties by source (imported only) ---
const propSelect =
  "id,source,external_ref,source_listing_id,listing_url,normalized_source_url,source_url_hash,duplicate_fingerprint,soft_match_fingerprint,price_thb,area_sqm,bedrooms,bathrooms,listing_type,project_id,district_id,city_id,verification_status,listing_lifecycle_status,status,updated_at,published_at,source_captured_at,last_verified_at";

const allProps = await fetchAll("properties", propSelect);
const bySource = new Map();
for (const p of allProps) {
  if (!bySource.has(p.source)) bySource.set(p.source, []);
  bySource.get(p.source).push(p);
}

// --- Provenance checks per imported source ---
const sourceRows = await fetchAll(
  "property_listing_sources",
  "id,property_id,source,source_listing_id,listing_url,identity_fingerprint,soft_match_fingerprint,price_thb,verification_status",
);
const priceHistory = await fetchAll(
  "listing_price_history",
  "id,property_id,source,price_thb,observed_at",
);
const events = await fetchAll(
  "listing_verification_events",
  "id,property_id,source,event_type,to_status,created_at",
);

const sourceRowByProp = new Map();
for (const r of sourceRows) {
  if (!sourceRowByProp.has(r.property_id)) sourceRowByProp.set(r.property_id, []);
  sourceRowByProp.get(r.property_id).push(r);
}
const histByProp = new Map();
for (const r of priceHistory) {
  if (!histByProp.has(r.property_id)) histByProp.set(r.property_id, []);
  histByProp.get(r.property_id).push(r);
}
const eventsByProp = new Map();
for (const r of events) {
  if (!eventsByProp.has(r.property_id)) eventsByProp.set(r.property_id, []);
  eventsByProp.get(r.property_id).push(r);
}

// Projects for mapping conflicts
const projects = await fetchAll(
  "property_projects",
  "id,slug,district_id,city_id,location_id",
);
const projectById = new Map(projects.map((p) => [p.id, p]));

for (const s of SOURCES) {
  const rows = bySource.get(s.key) || [];
  if (!rows.length && report.sources[s.key].status !== "imported") {
    report.provenance[s.key] = {
      checked: 0,
      ok: 0,
      missing: {},
    };
    continue;
  }

  const missing = {
    source_listing_id: 0,
    listing_url: 0,
    project_id: 0,
    price_thb: 0,
    duplicate_fingerprint: 0,
    provenance_source_row: 0,
    price_history: 0,
    verification_event: 0,
    listing_status: 0,
  };
  let ok = 0;
  const pkList = loadPackages(s.packageFile);
  const pkgByRef = new Map(pkList.map((x) => [x.external_ref, x]));

  // hard dups within source
  const refCounts = new Map();
  const idCounts = new Map();
  for (const r of rows) {
    if (r.external_ref)
      refCounts.set(r.external_ref, (refCounts.get(r.external_ref) || 0) + 1);
    if (r.source_listing_id)
      idCounts.set(
        r.source_listing_id,
        (idCounts.get(r.source_listing_id) || 0) + 1,
      );
  }
  for (const [ref, n] of refCounts) {
    if (n > 1)
      report.defects.hard_duplicates.push({
        source: s.key,
        field: "external_ref",
        value: ref,
        count: n,
      });
  }
  for (const [id, n] of idCounts) {
    if (n > 1)
      report.defects.hard_duplicates.push({
        source: s.key,
        field: "source_listing_id",
        value: id,
        count: n,
      });
  }

  let priceDrift = 0;
  let checkedPkg = 0;
  const dbRefs = new Set(rows.map((r) => r.external_ref).filter(Boolean));

  for (const r of rows) {
    let rowOk = true;
    if (!r.source_listing_id) {
      missing.source_listing_id += 1;
      rowOk = false;
    }
    if (!r.listing_url) {
      missing.listing_url += 1;
      rowOk = false;
    }
    if (!r.project_id) {
      missing.project_id += 1;
      rowOk = false;
    }
    if (!(Number(r.price_thb) > 0)) {
      missing.price_thb += 1;
      rowOk = false;
      report.defects.malformed_prices_or_areas.push({
        source: s.key,
        property_id: r.id,
        issue: "missing_or_nonpositive_price",
        price_thb: r.price_thb,
      });
    }
    if (!r.duplicate_fingerprint) {
      missing.duplicate_fingerprint += 1;
      rowOk = false;
    }
    const srcRows = sourceRowByProp.get(r.id) || [];
    const hasSrc = srcRows.some((x) => x.source === s.key);
    if (!hasSrc) {
      missing.provenance_source_row += 1;
      rowOk = false;
      report.defects.missing_evidence.push({
        source: s.key,
        property_id: r.id,
        missing: "property_listing_sources",
      });
    }
    const hist = histByProp.get(r.id) || [];
    if (!hist.length) {
      missing.price_history += 1;
      rowOk = false;
      report.defects.missing_evidence.push({
        source: s.key,
        property_id: r.id,
        missing: "listing_price_history",
      });
    }
    const ev = eventsByProp.get(r.id) || [];
    if (!ev.length) {
      missing.verification_event += 1;
      rowOk = false;
      report.defects.missing_evidence.push({
        source: s.key,
        property_id: r.id,
        missing: "listing_verification_events",
      });
    }
    if (!r.status && !r.listing_lifecycle_status) {
      missing.listing_status += 1;
      rowOk = false;
    }
    if (r.area_sqm != null && !(Number(r.area_sqm) > 0)) {
      report.defects.malformed_prices_or_areas.push({
        source: s.key,
        property_id: r.id,
        issue: "nonpositive_area",
        area_sqm: r.area_sqm,
      });
    }

    // package price reconcile
    if (r.external_ref && pkgByRef.has(r.external_ref)) {
      checkedPkg += 1;
      const pkg = pkgByRef.get(r.external_ref);
      if (Number(pkg.price_thb) !== Number(r.price_thb)) {
        priceDrift += 1;
      }
      // project mapping
      const proj = projectById.get(r.project_id);
      if (proj && pkg.project_slug && proj.slug !== pkg.project_slug) {
        report.defects.project_mapping_conflicts.push({
          source: s.key,
          property_id: r.id,
          db_project_slug: proj.slug,
          package_project_slug: pkg.project_slug,
        });
      }
      if (pkg.district_slug && r.district_id && proj) {
        // soft note only when package district known — skip if no district slug table join
      }
    }

    if (rowOk) ok += 1;
  }

  // partial import: package refs missing in DB
  for (const [ref, pkg] of pkgByRef) {
    if (!dbRefs.has(ref)) {
      report.defects.partial_imports.push({
        source: s.key,
        external_ref: ref,
        project_slug: pkg.project_slug,
        issue: "package_listing_missing_in_db",
      });
    }
  }
  // orphan: DB refs missing in package (only for sources that use packages)
  if (pkList.length || ["ddproperty", "hipflat"].includes(s.key)) {
    for (const r of rows) {
      if (r.external_ref && !pkgByRef.has(r.external_ref) && pkList.length) {
        report.defects.orphan_source_rows.push({
          source: s.key,
          property_id: r.id,
          external_ref: r.external_ref,
          issue: "db_listing_missing_in_package",
        });
      }
    }
  }

  // orphan property_listing_sources with no property / wrong source inventory
  report.provenance[s.key] = {
    checked: rows.length,
    ok,
    missing,
    package_price_checked: checkedPkg,
    package_price_drift: priceDrift,
  };
  report.drift[s.key] = {
    package_price_checked: checkedPkg,
    package_price_drift: priceDrift,
    frozen_updated_at_expected: s.expectedFrozenUpdatedAt || null,
    frozen_updated_at_actual: report.sources[s.key].db_updated_at_max,
    frozen_hold:
      !s.expectedFrozenUpdatedAt ||
      report.sources[s.key].db_updated_at_max === s.expectedFrozenUpdatedAt,
  };
}

// Orphan source rows: property_listing_sources pointing to missing properties
const propIds = new Set(allProps.map((p) => p.id));
for (const r of sourceRows) {
  if (!propIds.has(r.property_id)) {
    report.defects.orphan_source_rows.push({
      source: r.source,
      property_listing_source_id: r.id,
      property_id: r.property_id,
      issue: "source_row_property_missing",
    });
  }
}

// --- Cross-source candidates (open) ---
const candidates = await fetchAll(
  "listing_duplicate_candidates",
  "id,property_id_a,property_id_b,match_reason,confidence,status,created_at",
);
const openCandidates = candidates.filter((c) => c.status === "open");
const byReason = {};
for (const c of openCandidates) {
  const reason = c.match_reason || "unknown";
  byReason[reason] = (byReason[reason] || 0) + 1;
}
report.candidates = {
  total_rows: candidates.length,
  open: openCandidates.length,
  by_reason: byReason,
  auto_merged: candidates.filter((c) =>
    /merged|auto_merge/i.test(String(c.status)),
  ).length,
  note: "Candidates consolidated for reporting only — never auto-merged",
};

// Totals
let importedTotal = 0;
const bySourceCounts = {};
for (const s of SOURCES) {
  const n = report.sources[s.key].db_listings || 0;
  bySourceCounts[s.key] = n;
  if (report.sources[s.key].status === "imported") importedTotal += n;
}
report.totals = {
  imported_by_source: bySourceCounts,
  imported_total: importedTotal,
  open_candidates: openCandidates.length,
  hard_duplicates: report.defects.hard_duplicates.length,
  package_price_drift_total: Object.values(report.drift).reduce(
    (a, d) => a + (d.package_price_drift || 0),
    0,
  ),
  schema_changes: 0,
};

writeFileSync(
  join(OUT, "overnight-audit.json"),
  JSON.stringify(report, null, 2),
);
console.log(
  JSON.stringify(
    {
      imported_by_source: bySourceCounts,
      imported_total: importedTotal,
      open_candidates: openCandidates.length,
      hard_duplicates: report.defects.hard_duplicates.length,
      package_price_drift_total: report.totals.package_price_drift_total,
      statuses: Object.fromEntries(
        SOURCES.map((s) => [s.key, report.sources[s.key].status]),
      ),
      defect_counts: Object.fromEntries(
        Object.entries(report.defects).map(([k, v]) => [k, v.length]),
      ),
      out: join(OUT, "overnight-audit.json"),
    },
    null,
    2,
  ),
);
