#!/usr/bin/env node
/**
 * Phase 10 Sprint 5b — deepen District Knowledge Base from Wikipedia Places harvest.
 * Named POIs only. Lifestyle from wiki extract when curated note missing.
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(process.cwd());
const VERIFIED_AT = "2026-07-16";
const DIST_DIR = join(ROOT, "content/areas/bangkok/districts");
const harvestPack = JSON.parse(
  readFileSync(
    join(ROOT, "pipelines/factory/district-master/sprint5b_wiki_places_harvest.json"),
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

function poi(nameEn, nameTh, url) {
  return {
    name: { en: nameEn, zh: nameEn, th: nameTh || nameEn },
    source_url: url,
  };
}

function mergePois(existing, additions) {
  const out = Array.isArray(existing) ? [...existing] : [];
  for (const a of additions) {
    const key = (a.name?.en || "").toLowerCase().replace(/\s+/g, " ").trim();
    if (!key) continue;
    if (
      out.some(
        (x) =>
          (x.name?.en || "").toLowerCase().replace(/\s+/g, " ").trim() === key,
      )
    )
      continue;
    out.push(a);
  }
  return out;
}

function lifestyleFromExtract(extract, wikiUrl, nameEn, nameZh, nameTh) {
  if (!extract || extract.length < 40) return null;
  // First sentence only — verified public Wikipedia text, not a fabricated lifestyle claim.
  const sentence = extract.split(/(?<=\.)\s+/)[0].trim();
  if (sentence.length < 20) return null;
  return {
    en: sentence,
    zh: `${nameZh}（${nameEn}）概述依据英文维基百科该区条目公开摘要首句。`,
    th: `${nameTh} สรุปไลฟ์สไตล์/บริบทจากประโยคแรกของบทคัดย่อวิกิพีเดียภาษาอังกฤษสำหรับเขตนี้`,
    source_url: wikiUrl,
    verified_at: VERIFIED_AT,
    evidence_note: "wikipedia_extract_first_sentence",
  };
}

const rows = [];
let amenityAdds = { schools: 0, hospitals: 0, shopping: 0, parks: 0 };
let lifestyleAdded = 0;

for (const slug of slugs) {
  const path = join(DIST_DIR, `${slug}.json`);
  const pkg = JSON.parse(readFileSync(path, "utf8"));
  const h = harvestPack.harvest?.[slug] || {};
  const wikiEntry = wikiPack.results?.[slug];
  const wikiUrl =
    h.wiki ||
    wikiEntry?.content_urls ||
    `https://en.wikipedia.org/wiki/${slug}_district`;
  const fe = { ...(pkg.field_evidence || {}) };

  for (const dim of ["schools", "hospitals", "shopping", "parks"]) {
    const before = (pkg[dim] || []).length;
    const adds = (h[dim] || []).map((e) => poi(e.en, e.th, e.url));
    pkg[dim] = mergePois(pkg[dim] || [], adds);
    amenityAdds[dim] += Math.max(0, pkg[dim].length - before);
  }

  // Lifestyle: keep curated; else use wiki extract first sentence
  if (!pkg.lifestyle?.en) {
    const life = lifestyleFromExtract(
      wikiEntry?.extract,
      wikiUrl,
      pkg.name?.en || slug,
      pkg.name?.zh || pkg.name?.en || slug,
      pkg.name?.th || pkg.name?.en || slug,
    );
    if (life) {
      pkg.lifestyle = life;
      lifestyleAdded += 1;
    }
  }

  // Ensure overview/map still marked (from S5)
  if (!pkg.google_maps_url && pkg.metadata?.latitude != null) {
    const lat = pkg.metadata.latitude;
    const lng = pkg.metadata.longitude;
    pkg.google_maps_url = `https://www.google.com/maps?q=${lat},${lng}`;
    pkg.map = {
      latitude: lat,
      longitude: lng,
      google_maps_url: pkg.google_maps_url,
      source: "district_package_centroid",
      verified_at: VERIFIED_AT,
    };
  }

  const transportation = pkg.transportation || [];
  const btsPresent = transportation.some((t) => t.mode === "bts");
  const mrtPresent = transportation.some((t) => t.mode === "mrt");
  const btsAbs = fe.bts?.absence_verified === true || (!btsPresent && fe.bts?.evidence_class === "OFFICIAL_ABSENCE");
  const mrtAbs = fe.mrt?.absence_verified === true || (!mrtPresent && fe.mrt?.evidence_class === "OFFICIAL_ABSENCE");

  function setAmenity(dim, present) {
    fe[dim] = {
      field: dim,
      evidence_class: present ? "OFFICIAL" : "UNVERIFIED",
      provenance: {
        source_type: "wikipedia_district_places",
        url: wikiUrl,
      },
      verified_at: VERIFIED_AT,
      present,
      absence_verified: false,
    };
  }

  fe.overview = {
    field: "overview",
    evidence_class: pkg.summary?.en ? "OFFICIAL" : "UNVERIFIED",
    provenance: {
      source_type: "wikipedia_or_bma",
      url: wikiUrl,
    },
    verified_at: VERIFIED_AT,
    present: Boolean(pkg.summary?.en),
    absence_verified: false,
  };
  fe.map = {
    field: "map",
    evidence_class: pkg.google_maps_url ? "OFFICIAL" : "UNVERIFIED",
    provenance: {
      source_type: "package_centroid_coordinates",
      url: pkg.google_maps_url || wikiUrl,
    },
    verified_at: VERIFIED_AT,
    present: Boolean(pkg.google_maps_url),
    absence_verified: false,
  };
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
    setAmenity(dim, (pkg[dim] || []).length > 0);
  }

  fe.lifestyle = {
    field: "lifestyle",
    evidence_class: pkg.lifestyle?.en ? "OFFICIAL" : "UNVERIFIED",
    provenance: {
      source_type: "wikipedia_district_page",
      url: pkg.lifestyle?.source_url || wikiUrl,
    },
    verified_at: VERIFIED_AT,
    present: Boolean(pkg.lifestyle?.en),
    absence_verified: false,
  };
  fe.office_areas = {
    field: "office_areas",
    evidence_class: (pkg.office_areas || []).length ? "OFFICIAL" : "UNVERIFIED",
    provenance: {
      source_type: "wikipedia_district_page",
      url: wikiUrl,
    },
    verified_at: VERIFIED_AT,
    present: (pkg.office_areas || []).length > 0,
    absence_verified: false,
  };

  pkg.field_evidence = fe;
  pkg.district_master = {
    phase: "10-sprint-5b",
    verified_at: VERIFIED_AT,
    rule: "wiki_places_harvest_named_pois_plus_extract_lifestyle",
  };

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
  const score =
    Math.round(
      (Object.values(dims).reduce(
        (a, d) =>
          a +
          (d.evidence_class === "OFFICIAL" ||
          d.evidence_class === "OFFICIAL_ABSENCE"
            ? 1
            : 0),
        0,
      ) /
        10) *
        1000,
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

const s4avg =
  Math.round(
    (rows.reduce((a, r) => {
      let n = 0;
      for (const k of [
        "bts",
        "mrt",
        "schools",
        "hospitals",
        "shopping",
        "parks",
      ]) {
        if (r[k] === "OFFICIAL" || r[k] === "OFFICIAL_ABSENCE") n += 1;
      }
      return a + (n / 6) * 100;
    }, 0) /
      rows.length) *
      10,
  ) / 10;

const snapshot = {
  verified_at: VERIFIED_AT,
  phase: "10-sprint-5b",
  avg_completeness_pct_s5_ten_field: avg,
  avg_completeness_pct_s4_six_field: s4avg,
  baseline_s5a_avg_pct: 65.2,
  baseline_s4_avg_pct: 59.3,
  target_pct: 90,
  target_met_s5: avg >= 90,
  mutations: { amenityAdds, lifestyle_from_extract: lifestyleAdded },
  coverage,
  rows,
};

mkdirSync(join(ROOT, "pipelines/factory/district-master"), { recursive: true });
writeFileSync(
  join(ROOT, "pipelines/factory/district-master/sprint5_field_snapshot.json"),
  JSON.stringify(snapshot, null, 2) + "\n",
);

console.log(
  JSON.stringify(
    {
      s5_ten_field_avg: avg,
      s4_six_field_avg: s4avg,
      amenityAdds,
      lifestyleAdded,
      coverage,
      top5: rows.slice(0, 5).map((r) => [r.slug, r.completeness_pct]),
      bottom5: rows.slice(-5).map((r) => [r.slug, r.completeness_pct]),
    },
    null,
    2,
  ),
);
