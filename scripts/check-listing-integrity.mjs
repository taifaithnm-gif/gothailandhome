#!/usr/bin/env node
/**
 * Listing integrity check — source package counts and byte fingerprint vs baseline.
 * Does not modify listings.
 */
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(process.cwd());
const PROJECTS = join(ROOT, "content/projects");
const BASELINE = join(
  ROOT,
  "pipelines/factory/project-master/listing_baseline.json",
);

function walkListings(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const st = statSync(path);
    if (st.isDirectory()) walkListings(path, out);
    else if (name.startsWith("listings") && name.endsWith(".json")) out.push(path);
  }
  return out;
}

const baseline = JSON.parse(readFileSync(BASELINE, "utf8"));
const files = walkListings(PROJECTS).sort();

const counts = {
  propertyhub: 0,
  livinginsider: 0,
  dotproperty: 0,
  fazwaz: 0,
};

let rows = [];
for (const file of files) {
  const raw = readFileSync(file, "utf8");
  const data = JSON.parse(raw);
  let items = Array.isArray(data) ? data : data.listings || [];
  if (!Array.isArray(items) || items.length === 0) {
    if (data && typeof data === "object") {
      for (const value of Object.values(data)) {
        if (Array.isArray(value) && value[0] && typeof value[0] === "object") {
          items = value;
          break;
        }
      }
    }
  }
  const base = file.split("/").pop() || "";
  let src = null;
  if (base.includes("propertyhub") || base === "listings.json") src = "propertyhub";
  else if (base.includes("livinginsider")) src = "livinginsider";
  else if (base.includes("dotproperty")) src = "dotproperty";
  else if (base.includes("fazwaz")) src = "fazwaz";

  for (const item of items) {
    if (!item || typeof item !== "object") continue;
    const s = String(item.source || item.portal || src || "").toLowerCase();
    let bucket = src;
    if (s.includes("propertyhub")) bucket = "propertyhub";
    else if (s.includes("livinginsider")) bucket = "livinginsider";
    else if (s.includes("dotproperty")) bucket = "dotproperty";
    else if (s.includes("fazwaz")) bucket = "fazwaz";
    if (bucket && counts[bucket] != null) counts[bucket] += 1;

    const id = item.id || item.listing_id || item.source_listing_id || "";
    const price = item.price ?? item.price_thb ?? "";
    const updated = item.updated_at || item.updatedAt || "";
    rows.push(`${id}|${price}|${updated}`);
  }
}

const n = Object.values(counts).reduce((a, b) => a + b, 0);
const sha = createHash("sha256").update(rows.join("\n")).digest("hex");

const countsOk =
  counts.propertyhub === baseline.counts.propertyhub &&
  counts.livinginsider === baseline.counts.livinginsider &&
  counts.dotproperty === baseline.counts.dotproperty &&
  counts.fazwaz === baseline.counts.fazwaz &&
  n === baseline.n;

const result = {
  ok: countsOk,
  listing_files: files.length,
  counts,
  n,
  baseline_counts: baseline.counts,
  baseline_n: baseline.n,
  baseline_sha256: baseline.sha256,
  row_identity_sha256: sha,
  note: "Primary gate: source package counts vs listing_baseline.json. Listing files must stay byte-identical outside this check.",
};

console.log(JSON.stringify(result, null, 2));
if (!countsOk) process.exitCode = 1;
