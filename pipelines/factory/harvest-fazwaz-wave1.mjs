#!/usr/bin/env node
/**
 * FazWaz Wave 1 harvest for mapped Bangkok projects.
 * Does NOT modify prior source packages.
 *
 * Usage:
 *   node pipelines/factory/harvest-fazwaz-wave1.mjs [--per-project=N] [--limit-projects=N] [--only=slug] [--dry-run]
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  SOURCE,
  extractListingRefs,
  fetchHtml,
  listingDetailUrl,
  parseDetailHtml,
  sleep,
  toListingDto,
} from "./fazwaz/adapter.mjs";
import { validateListingRecord } from "./lib/validate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const TODAY = new Date().toISOString().slice(0, 10);
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const perProject = Number(
  (args.find((a) => a.startsWith("--per-project=")) || "--per-project=6").split(
    "=",
  )[1],
);
const limitProjects = Number(
  (
    args.find((a) => a.startsWith("--limit-projects=")) ||
    "--limit-projects=999"
  ).split("=")[1],
);
const onlyArg = args.find((a) => a.startsWith("--only="));
const onlySet = onlyArg
  ? new Set(onlyArg.split("=")[1].split(",").filter(Boolean))
  : null;

const map = JSON.parse(
  readFileSync(
    join(ROOT, "pipelines/factory/fazwaz/project-map.wave1.json"),
    "utf8",
  ),
);
const projects = Object.values(map.projects || {})
  .filter((p) => p.search_sale_url || p.search_rent_url)
  .filter((p) => !onlySet || onlySet.has(p.project_slug))
  .slice(0, limitProjects);

const evidenceDir = join(ROOT, "pipelines/factory/fazwaz/_runs");
mkdirSync(evidenceDir, { recursive: true });

const summary = {
  source: SOURCE,
  dry_run: dryRun,
  started_at: new Date().toISOString(),
  per_project: perProject,
  blocker: null,
  projects: [],
  totals: {
    projects: 0,
    search_pages_ok: 0,
    search_pages_blocked: 0,
    detail_ids_seen: 0,
    detail_blocked: 0,
    parsed_ok: 0,
    validated: 0,
    rejected: 0,
  },
};

for (const p of projects) {
  process.stderr.write(`FZ harvest ${p.project_slug}...\n`);
  const idMap = new Map();
  for (const [tab, url] of [
    ["sale", p.search_sale_url],
    ["rent", p.search_rent_url],
  ]) {
    if (!url) continue;
    const res = await fetchHtml(url);
    await sleep(600);
    if (res.cloudflare || !res.ok) {
      summary.totals.search_pages_blocked += 1;
      summary.blocker = summary.blocker || {
        type: "cloudflare_or_http",
        status: res.status,
        sample_url: url,
        title: res.text.match(/<title>([^<]+)/i)?.[1] || null,
      };
      process.stderr.write(
        `  tab ${tab} blocked/http_${res.status} cf=${Boolean(res.cloudflare)}\n`,
      );
      continue;
    }
    summary.totals.search_pages_ok += 1;
    for (const ref of extractListingRefs(res.text)) {
      if (!idMap.has(ref.id)) idMap.set(ref.id, { ...ref, tab });
    }
  }

  const byTab = { sale: [], rent: [] };
  for (const [id, ref] of idMap.entries()) {
    const tab = ref.tab === "rent" ? "rent" : "sale";
    byTab[tab].push([id, ref]);
  }
  const saleTake = Math.ceil(perProject / 2);
  const rentTake = Math.floor(perProject / 2);
  const ids = [
    ...byTab.sale.slice(0, saleTake),
    ...byTab.rent.slice(0, rentTake),
  ];
  // If one tab is short, fill from the other up to perProject
  if (ids.length < perProject) {
    const have = new Set(ids.map(([id]) => id));
    for (const pool of [byTab.sale, byTab.rent]) {
      for (const row of pool) {
        if (ids.length >= perProject) break;
        if (have.has(row[0])) continue;
        ids.push(row);
        have.add(row[0]);
      }
    }
  }
  const listings = [];
  const rejected = [];

  for (const [id, ref] of ids) {
    summary.totals.detail_ids_seen += 1;
    const detailUrl = listingDetailUrl(id, ref.path);
    const detail = await fetchHtml(detailUrl);
    await sleep(500);
    if (detail.cloudflare || !detail.ok) {
      summary.totals.detail_blocked += 1;
      rejected.push({
        id,
        reason: detail.cloudflare ? "cloudflare" : `http_${detail.status}`,
      });
      summary.totals.rejected += 1;
      continue;
    }
    const raw = parseDetailHtml(detail.text, id, detail.finalUrl || detailUrl);
    if (raw?.blocked) {
      summary.totals.detail_blocked += 1;
      rejected.push({ id, reason: "cloudflare_parse" });
      summary.totals.rejected += 1;
      continue;
    }
    // Prefer tab hint when type ambiguous
    if (!raw.listing_type && ref.tab) raw.listing_type = ref.tab;
    const dto = toListingDto(raw, {
      project_slug: p.project_slug,
      developer_slug: p.developer_slug,
      district_slug: p.district_slug,
      transit_tags: [],
    });
    if (!dto) {
      rejected.push({
        id,
        reason: "missing_price_or_type",
        price: raw?.price_thb,
        listing_type: raw?.listing_type,
        parse_error: raw?.parse_error || null,
      });
      summary.totals.rejected += 1;
      continue;
    }
    summary.totals.parsed_ok += 1;
    const v = validateListingRecord(dto);
    if (!v.ok) {
      rejected.push({ id, reason: "validation", errors: v.errors.slice(0, 6) });
      summary.totals.rejected += 1;
      continue;
    }
    summary.totals.validated += 1;
    listings.push(dto);
  }

  const outPkg = {
    project_slug: p.project_slug,
    collected_at: TODAY,
    source: SOURCE,
    project_id: p.project_id,
    search_sale_url: p.search_sale_url,
    search_rent_url: p.search_rent_url,
    notes:
      "FazWaz harvest — verified only when public public detail dataLayer/title exposes priced offer + listing type. No fabricated fields. Prior sources untouched.",
    listings,
  };

  const dest = join(
    ROOT,
    "content/projects",
    p.project_slug,
    "listings-fazwaz.json",
  );
  if (!dryRun) {
    writeFileSync(dest, `${JSON.stringify(outPkg, null, 2)}\n`);
  }

  summary.projects.push({
    slug: p.project_slug,
    project_id: p.project_id,
    status: listings.length
      ? "ok"
      : ids.length
        ? "empty_after_detail"
        : "blocked_or_empty",
    ids_found: ids.length,
    listings: listings.length,
    rejected: rejected.length,
    rejected_sample: rejected.slice(0, 5),
    package: dryRun ? null : dest,
  });
  summary.totals.projects += 1;
  process.stderr.write(
    `  → ${listings.length} listings (${rejected.length} rejected / ${ids.length} ids)\n`,
  );
}

summary.finished_at = new Date().toISOString();
if (summary.totals.validated === 0 && summary.totals.search_pages_blocked > 0) {
  summary.status = "BLOCKED";
  summary.status_reason =
    "FazWaz pages returned Cloudflare/HTTP failures; no priced listings validated.";
} else if (summary.totals.validated > 0) {
  summary.status = "PASS";
} else {
  summary.status = "EMPTY";
}

const runPath = join(
  evidenceDir,
  `harvest-${TODAY.replace(/-/g, "")}-${Date.now()}.json`,
);
writeFileSync(runPath, JSON.stringify(summary, null, 2));
writeFileSync(
  join(evidenceDir, "latest-harvest.json"),
  JSON.stringify(summary, null, 2),
);
console.log(JSON.stringify({ ...summary, run_path: runPath }, null, 2));
