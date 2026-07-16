#!/usr/bin/env node
/**
 * Phase 10 Sprint 5 — District Knowledge Base
 * Adds overview (wiki extract), map URL, lifestyle, office_areas;
 * merges named amenity gaps. No invented stats.
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(process.cwd());
const VERIFIED_AT = "2026-07-16";
const DIST_DIR = join(ROOT, "content/areas/bangkok/districts");
const seed = JSON.parse(
  readFileSync(
    join(ROOT, "pipelines/factory/district-master/sprint5_knowledge_seed.json"),
    "utf8",
  ),
);
const wikiPack = JSON.parse(
  readFileSync(
    join(ROOT, "pipelines/factory/district-master/sprint5_wiki_summaries.json"),
    "utf8",
  ),
);

const slugs = readdirSync(DIST_DIR)
  .filter((f) => f.endsWith(".json"))
  .map((f) => f.replace(/\.json$/, ""));

function wikiDistrictUrl(slug) {
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

function isNamedPoi(entry) {
  if (!entry?.en || !entry?.url) return false;
  const en = entry.en.toLowerCase();
  if (en.includes("medical notes") || en.includes("retail notes")) return false;
  if (en.includes("green space notes") || en.includes("schools (")) return false;
  if (en.includes("district schools") || en.includes("district hospitals"))
    return false;
  if (en.includes("district parks") || en.includes("education notes"))
    return false;
  if (en.trim() === "—" || en.includes("samut prakan")) return false;
  // Require a proper noun-ish name (capitalized word not only district slug words)
  if (en.includes("notes (wikipedia)")) return false;
  return true;
}

function mergePois(existing, additions) {
  const out = Array.isArray(existing) ? [...existing] : [];
  for (const a of additions) {
    const key = (a.name?.en || "").toLowerCase();
    if (!key) continue;
    if (out.some((x) => (x.name?.en || "").toLowerCase() === key)) continue;
    out.push(a);
  }
  return out;
}

function translateOverview(extract, nameEn, nameZh, nameTh) {
  // Honest: keep EN from Wikipedia; ZH/TH are factual parallel statements, not full literary translations.
  const en = extract.trim();
  const zh = `${nameZh}（${nameEn}）为曼谷大都会管理局下辖的行政区（เขต）。概述依据英文维基百科该区条目公开摘要。`;
  const th = `${nameTh} เป็นเขตการปกครองของกรุงเทพมหานคร สรุปภาพรวมอ้างอิงจากบทคัดย่อสาธารณะของวิกิพีเดียภาษาอังกฤษสำหรับเขตนี้`;
  return { en, zh, th };
}

const rows = [];
let overviewUpgraded = 0;
let mapsAdded = 0;
let lifestyleAdded = 0;
let officeAdded = 0;

for (const slug of slugs) {
  const path = join(DIST_DIR, `${slug}.json`);
  const pkg = JSON.parse(readFileSync(path, "utf8"));
  const wiki = wikiDistrictUrl(slug);
  const wikiEntry = wikiPack.results?.[slug];
  const fe = { ...(pkg.field_evidence || {}) };

  // --- Overview ---
  let overviewOk = Boolean(pkg.summary?.en);
  if (wikiEntry?.extract && wikiEntry.extract.length > 40) {
    pkg.summary = translateOverview(
      wikiEntry.extract,
      pkg.name?.en || slug,
      pkg.name?.zh || pkg.name?.en || slug,
      pkg.name?.th || pkg.name?.en || slug,
    );
    pkg.overview_source = {
      type: "wikipedia_rest_summary",
      url: wikiEntry.content_urls || wiki,
      verified_at: VERIFIED_AT,
    };
    overviewOk = true;
    overviewUpgraded += 1;
  }
  fe.overview = {
    field: "overview",
    evidence_class: overviewOk ? "OFFICIAL" : "UNVERIFIED",
    provenance: {
      source_type: "wikipedia_or_bma",
      url: wikiEntry?.content_urls || wiki,
    },
    verified_at: VERIFIED_AT,
    present: overviewOk,
    absence_verified: false,
  };

  // --- Map ---
  const lat = pkg.metadata?.latitude;
  const lng = pkg.metadata?.longitude;
  let mapOk = false;
  if (lat != null && lng != null) {
    pkg.google_maps_url = `https://www.google.com/maps?q=${lat},${lng}`;
    pkg.map = {
      latitude: lat,
      longitude: lng,
      google_maps_url: pkg.google_maps_url,
      source: "district_package_centroid",
      verified_at: VERIFIED_AT,
    };
    mapOk = true;
    mapsAdded += 1;
  }
  fe.map = {
    field: "map",
    evidence_class: mapOk ? "OFFICIAL" : "UNVERIFIED",
    provenance: {
      source_type: "package_centroid_coordinates",
      url: pkg.google_maps_url || wiki,
    },
    verified_at: VERIFIED_AT,
    present: mapOk,
    absence_verified: false,
  };

  // --- Amenity gap merges (named only) ---
  for (const dim of ["schools", "hospitals", "shopping", "parks"]) {
    const gap = (seed.amenity_gaps?.[dim]?.[slug] || [])
      .filter(isNamedPoi)
      .map((e) => poi(e.en, e.th, e.url));
    pkg[dim] = mergePois(pkg[dim] || [], gap);
  }

  // Preserve transit evidence from Sprint 4
  const transportation = pkg.transportation || [];
  const btsPresent = transportation.some((t) => t.mode === "bts");
  const mrtPresent = transportation.some((t) => t.mode === "mrt");
  const btsAbs = fe.bts?.absence_verified === true;
  const mrtAbs = fe.mrt?.absence_verified === true;

  function amenityClass(arr, prev) {
    if (arr.length > 0) return "OFFICIAL";
    if (prev?.absence_verified) return "OFFICIAL_ABSENCE";
    return "UNVERIFIED";
  }

  fe.bts = {
    field: "bts",
    evidence_class: btsPresent
      ? "OFFICIAL"
      : btsAbs
        ? "OFFICIAL_ABSENCE"
        : "UNVERIFIED",
    provenance: fe.bts?.provenance || {
      source_type: "wikipedia_transit_line_map",
      url: "https://en.wikipedia.org/wiki/BTS_Skytrain",
    },
    verified_at: VERIFIED_AT,
    present: btsPresent,
    absence_verified: !btsPresent && btsAbs,
  };
  fe.mrt = {
    field: "mrt",
    evidence_class: mrtPresent
      ? "OFFICIAL"
      : mrtAbs
        ? "OFFICIAL_ABSENCE"
        : "UNVERIFIED",
    provenance: fe.mrt?.provenance || {
      source_type: "wikipedia_transit_line_map",
      url: "https://en.wikipedia.org/wiki/Blue_Line_(Bangkok)",
    },
    verified_at: VERIFIED_AT,
    present: mrtPresent,
    absence_verified: !mrtPresent && mrtAbs,
  };

  for (const dim of ["schools", "hospitals", "shopping", "parks"]) {
    const arr = pkg[dim] || [];
    fe[dim] = {
      field: dim,
      evidence_class: amenityClass(arr, fe[dim]),
      provenance: {
        source_type: "wikipedia_or_official_institution",
        url: wiki,
      },
      verified_at: VERIFIED_AT,
      present: arr.length > 0,
      absence_verified: false,
    };
  }

  // --- Lifestyle ---
  const life = seed.lifestyle?.[slug];
  if (life?.en && life?.source_url) {
    pkg.lifestyle = {
      en: life.en,
      zh: life.zh || life.en,
      th: life.th || life.en,
      source_url: life.source_url,
      verified_at: VERIFIED_AT,
    };
    lifestyleAdded += 1;
  }
  fe.lifestyle = {
    field: "lifestyle",
    evidence_class: pkg.lifestyle?.en ? "OFFICIAL" : "UNVERIFIED",
    provenance: {
      source_type: "wikipedia_district_page",
      url: pkg.lifestyle?.source_url || wiki,
    },
    verified_at: VERIFIED_AT,
    present: Boolean(pkg.lifestyle?.en),
    absence_verified: false,
  };

  // --- Office areas ---
  const offices = (seed.office_areas?.[slug] || [])
    .filter(isNamedPoi)
    .map((e) => poi(e.en, e.th, e.url));
  if (offices.length) {
    pkg.office_areas = offices;
    officeAdded += 1;
  }
  fe.office_areas = {
    field: "office_areas",
    evidence_class: (pkg.office_areas || []).length ? "OFFICIAL" : "UNVERIFIED",
    provenance: {
      source_type: "wikipedia_district_page",
      url: wiki,
    },
    verified_at: VERIFIED_AT,
    present: (pkg.office_areas || []).length > 0,
    absence_verified: false,
  };

  pkg.field_evidence = fe;
  pkg.district_master = {
    phase: "10-sprint-5",
    verified_at: VERIFIED_AT,
    rule: "knowledge_base_overview_map_lifestyle_office_named_pois",
  };

  if (!pkg.sources.some((s) => s.url === wiki || s.url === wikiEntry?.content_urls)) {
    pkg.sources.push({
      type: "wikipedia",
      name: `Wikipedia — ${pkg.name?.en || slug} district`,
      url: wikiEntry?.content_urls || wiki,
    });
  }

  writeFileSync(path, JSON.stringify(pkg, null, 2) + "\n");

  const dims = {
    overview: fe.overview,
    map: fe.map,
    bts: fe.bts,
    mrt: fe.mrt,
    schools: fe.schools,
    hospitals: fe.hospitals,
    shopping: fe.shopping,
    parks: fe.parks,
    lifestyle: fe.lifestyle,
    office_areas: fe.office_areas,
  };

  function dimScore(d) {
    if (d.evidence_class === "OFFICIAL" || d.evidence_class === "OFFICIAL_ABSENCE")
      return 1;
    return 0;
  }

  const score =
    Math.round(
      (Object.values(dims).reduce((a, d) => a + dimScore(d), 0) / 10) * 1000,
    ) / 10;

  rows.push({
    slug,
    overview: dims.overview.evidence_class,
    map: dims.map.evidence_class,
    bts: dims.bts.evidence_class,
    mrt: dims.mrt.evidence_class,
    schools: dims.schools.evidence_class,
    hospitals: dims.hospitals.evidence_class,
    shopping: dims.shopping.evidence_class,
    parks: dims.parks.evidence_class,
    lifestyle: dims.lifestyle.evidence_class,
    office_areas: dims.office_areas.evidence_class,
    completeness_pct: score,
    counts: {
      schools: (pkg.schools || []).length,
      hospitals: (pkg.hospitals || []).length,
      shopping: (pkg.shopping || []).length,
      parks: (pkg.parks || []).length,
      office_areas: (pkg.office_areas || []).length,
      has_lifestyle: Boolean(pkg.lifestyle?.en),
      has_map: Boolean(pkg.google_maps_url),
      has_overview: Boolean(pkg.summary?.en),
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

// Legacy S4 six-amenity formula for comparison
const s4avg =
  Math.round(
    (rows.reduce((a, r) => {
      let n = 0;
      for (const k of ["bts", "mrt", "schools", "hospitals", "shopping", "parks"]) {
        if (r[k] === "OFFICIAL" || r[k] === "OFFICIAL_ABSENCE") n += 1;
      }
      return a + (n / 6) * 100;
    }, 0) /
      rows.length) *
      10,
  ) / 10;

const coverage = {};
for (const k of [
  "overview",
  "map",
  "bts",
  "mrt",
  "schools",
  "hospitals",
  "shopping",
  "parks",
  "lifestyle",
  "office_areas",
]) {
  coverage[k] = {
    OFFICIAL: rows.filter((r) => r[k] === "OFFICIAL").length,
    OFFICIAL_ABSENCE: rows.filter((r) => r[k] === "OFFICIAL_ABSENCE").length,
    UNVERIFIED: rows.filter((r) => r[k] === "UNVERIFIED").length,
  };
}

const outDir = join(ROOT, "pipelines/factory/district-master");
mkdirSync(outDir, { recursive: true });
const snapshot = {
  verified_at: VERIFIED_AT,
  phase: "10-sprint-5",
  avg_completeness_pct_s5_ten_field: avg,
  avg_completeness_pct_s4_six_field: s4avg,
  baseline_s4_avg_pct: 59.3,
  baseline_s1_avg_pct: 3.7,
  target_pct: 90,
  target_met_s5: avg >= 90,
  mutations: {
    overview_upgraded: overviewUpgraded,
    maps_added: mapsAdded,
    lifestyle_added: lifestyleAdded,
    office_districts: officeAdded,
  },
  coverage,
  rows,
};
writeFileSync(
  join(outDir, "sprint5_field_snapshot.json"),
  JSON.stringify(snapshot, null, 2) + "\n",
);

console.log(
  JSON.stringify(
    {
      n: rows.length,
      s5_ten_field_avg: avg,
      s4_six_field_avg: s4avg,
      overviewUpgraded,
      mapsAdded,
      lifestyleAdded,
      officeAdded,
      coverage,
      top: rows.slice(0, 8),
      bottom: rows.slice(-5),
    },
    null,
    2,
  ),
);
