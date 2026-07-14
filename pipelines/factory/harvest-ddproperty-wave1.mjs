#!/usr/bin/env node
/**
 * DDproperty Wave 1 harvest for mapped Bangkok projects.
 * Does NOT modify PropertyHub or LivingInsider packages.
 *
 * Usage:
 *   node pipelines/factory/harvest-ddproperty-wave1.mjs [--per-project=N] [--limit-projects=N] [--only=slug] [--dry-run]
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
} from "./ddproperty/adapter.mjs";
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
    join(ROOT, "pipelines/factory/ddproperty/project-map.wave1.json"),
    "utf8",
  ),
);
const projects = Object.values(map.projects || {})
  .filter((p) => !onlySet || onlySet.has(p.project_slug))
  .slice(0, limitProjects);

const evidenceDir = join(ROOT, "pipelines/factory/ddproperty/_runs");
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
  process.stderr.write(`DD harvest ${p.project_slug}...\n`);
  const idMap = new Map();
  for (const [tab, url] of [
    ["sale", p.search_sale_url],
    ["rent", p.search_rent_url],
  ]) {
    const res = await fetchHtml(url);
    await sleep(700);
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
      if (!idMap.has(ref.id)) idMap.set(ref.id, ref.path);
    }
  }

  const ids = [...idMap.entries()].slice(0, perProject);
  const listings = [];
  const rejected = [];

  for (const [id, path] of ids) {
    summary.totals.detail_ids_seen += 1;
    const detailUrl = listingDetailUrl(id, path);
    const detail = await fetchHtml(detailUrl);
    await sleep(600);
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
    search_sale_url: p.search_sale_url,
    search_rent_url: p.search_rent_url,
    notes:
      "DDproperty harvest — verified only when public detail exposes priced offer + listing type. No fabricated fields. PropertyHub/LivingInsider untouched.",
    listings,
  };

  const dest = join(
    ROOT,
    "content/projects",
    p.project_slug,
    "listings-ddproperty.json",
  );
  // Always write package file (may be empty) so ops see harvest attempt
  if (!dryRun) {
    writeFileSync(dest, `${JSON.stringify(outPkg, null, 2)}\n`);
  }

  summary.projects.push({
    slug: p.project_slug,
    status: listings.length ? "ok" : ids.length ? "empty_after_detail" : "blocked_or_empty",
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
    "DDproperty search/detail pages returned Cloudflare challenges; no priced listings could be validated without fabricating data.";
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
