#!/usr/bin/env node
/**
 * LivingInsider Wave harvest for mapped Bangkok projects.
 * Does NOT modify PropertyHub packages or re-harvest PropertyHub.
 *
 * Usage:
 *   node pipelines/factory/harvest-livinginsider-wave1.mjs [--per-project=N] [--limit-projects=N] [--only=slug] [--dry-run]
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  SOURCE,
  extractDetailIds,
  fetchHtml,
  parseDetailHtml,
  sleep,
  toListingDto,
} from "./livinginsider/adapter.mjs";
import { validateListingRecord } from "./lib/validate.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const TODAY = new Date().toISOString().slice(0, 10);
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const perProject = Number(
  (args.find((a) => a.startsWith("--per-project=")) || "--per-project=8").split(
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
const mergeExisting = args.includes("--merge");
const tabsArg = (
  args.find((a) => a.startsWith("--tabs=")) || "--tabs=all,Buysell,Rent"
).split("=")[1];
const tabs = tabsArg.split(",").map((t) => t.trim()).filter(Boolean);

function projectTabUrl(baseUrl, tab) {
  if (tab === "all") return baseUrl;
  // living_project_en/{zone}/{id}/Condo/all/all/1/...html
  return baseUrl.replace(/\/Condo\/all\/all\//i, `/Condo/${tab}/all/`);
}

const mapPath = join(
  ROOT,
  "pipelines/factory/livinginsider/project-map.wave1.json",
);
const map = JSON.parse(readFileSync(mapPath, "utf8"));
const projects = Object.values(map.projects || {})
  .filter((p) => !onlySet || onlySet.has(p.project_slug))
  .slice(0, limitProjects);

const evidenceDir = join(ROOT, "pipelines/factory/livinginsider/_runs");
mkdirSync(evidenceDir, { recursive: true });

const summary = {
  source: SOURCE,
  dry_run: dryRun,
  started_at: new Date().toISOString(),
  per_project: perProject,
  projects: [],
  totals: {
    projects: 0,
    detail_ids_seen: 0,
    parsed_ok: 0,
    validated: 0,
    rejected: 0,
  },
};

for (const p of projects) {
  process.stderr.write(`LI harvest ${p.project_slug}...\n`);
  const idSet = new Set();
  for (const tab of tabs) {
    const url = projectTabUrl(p.project_url, tab);
    const projectRes = await fetchHtml(url);
    await sleep(900);
    if (!projectRes.ok) {
      process.stderr.write(`  tab ${tab} http_${projectRes.status}\n`);
      continue;
    }
    for (const id of extractDetailIds(projectRes.text)) idSet.add(id);
  }
  const ids = [...idSet].slice(0, perProject);
  if (!ids.length) {
    summary.projects.push({
      slug: p.project_slug,
      status: "empty",
      ids_found: 0,
      listings: 0,
    });
    summary.totals.projects += 1;
    continue;
  }
  const listings = [];
  const rejected = [];
  const existingPath = join(
    ROOT,
    "content/projects",
    p.project_slug,
    "listings-livinginsider.json",
  );
  const existingByRef = new Map();
  if (mergeExisting && existsSync(existingPath)) {
    const prev = JSON.parse(readFileSync(existingPath, "utf8"));
    for (const x of prev.listings || []) existingByRef.set(x.external_ref, x);
  }

  for (const id of ids) {
    summary.totals.detail_ids_seen += 1;
    const detailUrl = `https://www.livinginsider.com/re/en_${id}`;
    const detail = await fetchHtml(detailUrl);
    await sleep(700);
    if (!detail.ok) {
      rejected.push({ id, reason: `http_${detail.status}` });
      summary.totals.rejected += 1;
      continue;
    }
    const raw = parseDetailHtml(detail.text, id);
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
        price: raw.price_thb,
        listing_type: raw.listing_type,
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
    existingByRef.set(dto.external_ref, dto);
    listings.push(dto);
  }

  const merged = [...existingByRef.values()];
  const outPkg = {
    project_slug: p.project_slug,
    collected_at: TODAY,
    source: SOURCE,
    livinginsider_project_id: p.livinginsider_project_id,
    livinginsider_project_url: p.project_url,
    notes:
      "LivingInsider harvest — verified only when public detail exposes priced Offer + listing type. No fabricated fields. PropertyHub packages untouched.",
    listings: merged,
  };

  const dest = existingPath;
  if (!dryRun) {
    writeFileSync(dest, `${JSON.stringify(outPkg, null, 2)}\n`);
  }

  summary.projects.push({
    slug: p.project_slug,
    status: merged.length ? "ok" : "empty",
    ids_found: ids.length,
    listings_new: listings.length,
    listings_total: merged.length,
    rejected: rejected.length,
    rejected_sample: rejected.slice(0, 5),
    package: dryRun ? null : dest,
  });
  summary.totals.projects += 1;
  process.stderr.write(
    `  → +${listings.length} new / ${merged.length} total (${rejected.length} rejected)\n`,
  );
}

summary.finished_at = new Date().toISOString();
const runPath = join(
  evidenceDir,
  `harvest-${TODAY.replace(/-/g, "")}-${Date.now()}.json`,
);
writeFileSync(runPath, JSON.stringify(summary, null, 2));
writeFileSync(
  join(ROOT, "pipelines/factory/livinginsider/_runs/latest-harvest.json"),
  JSON.stringify(summary, null, 2),
);
console.log(JSON.stringify({ ...summary, run_path: runPath }, null, 2));
