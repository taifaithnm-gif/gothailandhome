#!/usr/bin/env node
/**
 * Phase 10 Sprint 4 — District Official Completion
 * Applies curated named amenities + verified BTS/MRT presence/absence.
 * Does not invent unnamed POIs. Absence of rail is scored via field_evidence only (arrays stay empty for UI).
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(process.cwd());
const VERIFIED_AT = "2026-07-16";
const seed = JSON.parse(
  readFileSync(
    join(ROOT, "pipelines/factory/district-master/sprint4_amenity_seed.json"),
    "utf8",
  ),
);

const DIST_DIR = join(ROOT, "content/areas/bangkok/districts");
const slugs = readdirSync(DIST_DIR)
  .filter((f) => f.endsWith(".json"))
  .map((f) => f.replace(/\.json$/, ""));

function wikiDistrictUrl(slug) {
  // Best-effort English wiki title from slug
  const special = {
    "chom-thong": "https://en.wikipedia.org/wiki/Chom_Thong_district,_Bangkok",
    "pom-prap-sattru-phai":
      "https://en.wikipedia.org/wiki/Pom_Prap_Sattru_Phai_district",
  };
  if (special[slug]) return special[slug];
  const title = slug
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("_");
  return `https://en.wikipedia.org/wiki/${title}_district`;
}

function poi(nameEn, nameTh, url) {
  return {
    name: { en: nameEn, zh: nameEn, th: nameTh || nameEn },
    source_url: url,
  };
}

function transitPoi(station, mode, url) {
  return {
    name: {
      en: `${mode.toUpperCase()} — ${station}`,
      zh: `${mode.toUpperCase()} — ${station}`,
      th: `${mode.toUpperCase()} — ${station}`,
    },
    mode,
    source_url: url,
  };
}

function isNamedPoi(entry) {
  if (!entry?.en || !entry?.url) return false;
  const en = entry.en.toLowerCase();
  // Reject vague placeholders that only point at a district page without a named amenity.
  if (en.includes("district schools") || en.includes("district hospitals"))
    return false;
  if (en.includes("district parks") || en.includes("district health"))
    return false;
  if (en.includes("retail corridor") && entry.url.includes("district")) {
    // corridor notes on district wiki are weak — keep only if brand name is clear
    const brands = [
      "central",
      "mall",
      "market",
      "siam",
      "icon",
      "terminal",
      "emquartier",
      "fashion",
      "mbk",
      "paragon",
      "chatuchak",
      "bobae",
      "yaowarat",
      "floating",
      "it square",
      "major",
    ];
    if (!brands.some((b) => en.includes(b))) return false;
  }
  if (en.includes("—") && en.includes("using district")) return false;
  if (en.trim() === "—" || en.includes("samut prakan")) return false;
  return true;
}

const rows = [];
let btsPresent = 0;
let btsAbsent = 0;
let mrtPresent = 0;
let mrtAbsent = 0;

for (const slug of slugs) {
  const path = join(DIST_DIR, `${slug}.json`);
  const pkg = JSON.parse(readFileSync(path, "utf8"));
  const wiki = wikiDistrictUrl(slug);

  const btsList = seed.bts_by_district[slug];
  const mrtList = seed.mrt_by_district[slug];
  const btsKnown = Array.isArray(btsList);
  const mrtKnown = Array.isArray(mrtList);

  const transportation = [];
  if (btsKnown && btsList.length) {
    btsPresent += 1;
    for (const st of btsList) {
      transportation.push(
        transitPoi(
          st,
          "bts",
          seed.sources.bts_sukhumvit || seed.sources.bts_system,
        ),
      );
    }
  } else if (btsKnown && btsList.length === 0) {
    btsAbsent += 1;
  }
  if (mrtKnown && mrtList.length) {
    mrtPresent += 1;
    for (const st of mrtList) {
      transportation.push(
        transitPoi(st, "mrt", seed.sources.mrt_blue || seed.sources.mrt_yellow),
      );
    }
  } else if (mrtKnown && mrtList.length === 0) {
    mrtAbsent += 1;
  }

  // Preserve any prior non-duplicate transit entries that look named
  for (const t of pkg.transportation || []) {
    const key = `${t.mode}|${t.name?.en}`;
    if (
      !transportation.some((x) => `${x.mode}|${x.name?.en}` === key) &&
      t?.name?.en
    ) {
      transportation.push(t);
    }
  }

  const schools = (seed.schools[slug] || [])
    .filter(isNamedPoi)
    .map((e) => poi(e.en, e.th, e.url));
  const hospitals = (seed.hospitals[slug] || [])
    .filter(isNamedPoi)
    .map((e) => poi(e.en, e.th, e.url));
  const shopping = (seed.shopping[slug] || [])
    .filter(isNamedPoi)
    .map((e) => poi(e.en, e.th, e.url));
  const parks = (seed.parks[slug] || [])
    .filter(isNamedPoi)
    .map((e) => poi(e.en, e.th, e.url));

  // Keep prior shopping if seed empty but package had named items
  if (!shopping.length && Array.isArray(pkg.shopping) && pkg.shopping.length) {
    shopping.push(...pkg.shopping);
  }

  pkg.transportation = transportation;
  pkg.schools = schools;
  pkg.hospitals = hospitals;
  pkg.shopping = shopping;
  pkg.parks = parks;

  const dims = {
    bts: {
      present: transportation.some((t) => t.mode === "bts"),
      absence_verified: btsKnown && btsList.length === 0,
    },
    mrt: {
      present: transportation.some((t) => t.mode === "mrt"),
      absence_verified: mrtKnown && mrtList.length === 0,
    },
    schools: { present: schools.length > 0, absence_verified: false },
    hospitals: { present: hospitals.length > 0, absence_verified: false },
    shopping: { present: shopping.length > 0, absence_verified: false },
    parks: { present: parks.length > 0, absence_verified: false },
  };

  function dimClass(d) {
    if (d.present) return "OFFICIAL";
    if (d.absence_verified) return "OFFICIAL_ABSENCE";
    return "UNVERIFIED";
  }

  function dimScore(d) {
    if (d.present || d.absence_verified) return 1;
    return 0;
  }

  const field_evidence = {};
  for (const [k, d] of Object.entries(dims)) {
    field_evidence[k] = {
      field: k,
      evidence_class: dimClass(d),
      provenance: {
        source_type:
          k === "bts" || k === "mrt"
            ? "wikipedia_transit_line_map"
            : "wikipedia_or_official_institution",
        url:
          k === "bts"
            ? seed.sources.bts_system
            : k === "mrt"
              ? seed.sources.mrt_blue
              : wiki,
      },
      verified_at: VERIFIED_AT,
      present: d.present,
      absence_verified: d.absence_verified,
    };
  }

  pkg.field_evidence = field_evidence;
  pkg.district_master = {
    phase: "10-sprint-4",
    verified_at: VERIFIED_AT,
    rule: "named_pois_only_plus_verified_transit_absence",
  };

  // Ensure wiki source present
  if (!pkg.sources.some((s) => s.url === wiki)) {
    pkg.sources.push({
      type: "wikipedia",
      name: `Wikipedia — ${pkg.name?.en || slug} district`,
      url: wiki,
    });
  }

  writeFileSync(path, JSON.stringify(pkg, null, 2) + "\n");

  const score =
    Math.round(
      (Object.values(dims).reduce((a, d) => a + dimScore(d), 0) / 6) * 1000,
    ) / 10;
  rows.push({
    slug,
    bts: dimClass(dims.bts),
    mrt: dimClass(dims.mrt),
    schools: dimClass(dims.schools),
    hospitals: dimClass(dims.hospitals),
    shopping: dimClass(dims.shopping),
    parks: dimClass(dims.parks),
    completeness_pct: score,
    counts: {
      bts: transportation.filter((t) => t.mode === "bts").length,
      mrt: transportation.filter((t) => t.mode === "mrt").length,
      schools: schools.length,
      hospitals: hospitals.length,
      shopping: shopping.length,
      parks: parks.length,
    },
  });
}

rows.sort(
  (a, b) =>
    b.completeness_pct - a.completeness_pct || a.slug.localeCompare(b.slug),
);
const avg =
  Math.round(
    (rows.reduce((a, r) => a + r.completeness_pct, 0) / rows.length) * 10,
  ) / 10;

// S1-compatible score (arrays only; absence does NOT count)
const s1rows = rows.map((r) => {
  let sum = 0;
  if (r.counts.bts) sum += 1;
  if (r.counts.mrt) sum += 1;
  if (r.counts.schools) sum += 1;
  if (r.counts.hospitals) sum += 1;
  if (r.counts.shopping) sum += 1;
  if (r.counts.parks) sum += 1;
  return {
    slug: r.slug,
    pct: Math.round((sum / 6) * 1000) / 10,
  };
});
const s1avg =
  Math.round((s1rows.reduce((a, r) => a + r.pct, 0) / s1rows.length) * 10) /
  10;

const outDir = join(ROOT, "pipelines/factory/district-master");
mkdirSync(outDir, { recursive: true });
writeFileSync(
  join(outDir, "sprint4_field_snapshot.json"),
  JSON.stringify(
    {
      verified_at: VERIFIED_AT,
      avg_completeness_pct_s4_with_absence: avg,
      avg_completeness_pct_s1_formula: s1avg,
      baseline_s1_avg_pct: 3.7,
      target_pct: 90,
      target_met_s4: avg >= 90,
      target_met_s1_formula: s1avg >= 90,
      bts_present_districts: btsPresent,
      bts_absence_verified_districts: btsAbsent,
      mrt_present_districts: mrtPresent,
      mrt_absence_verified_districts: mrtAbsent,
      rows,
      s1_rows: s1rows.sort(
        (a, b) => b.pct - a.pct || a.slug.localeCompare(b.slug),
      ),
    },
    null,
    2,
  ) + "\n",
);

console.log(
  JSON.stringify(
    {
      n: rows.length,
      s4_avg_with_absence: avg,
      s1_avg_arrays_only: s1avg,
      btsPresent,
      btsAbsent,
      mrtPresent,
      mrtAbsent,
      top: rows.slice(0, 5),
    },
    null,
    2,
  ),
);
