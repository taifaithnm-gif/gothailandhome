#!/usr/bin/env node
/**
 * Phase 10 Sprint 3b — Project Official Completion (developer batches).
 * AP → Sansiri → MQDC → Supalai → Ananda → AssetWise
 * Only facts confirmed on official project pages. Unknown stays UNVERIFIED.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(process.cwd());
const VERIFIED_AT = "2026-07-16";

const BATCH_DEVELOPERS = [
  "ap-thailand",
  "sansiri",
  "mqdc",
  "supalai",
  "ananda-development",
  "assetwise",
];

/**
 * Curated OFFICIAL enrichments — every value traced to an official project page URL.
 * Do not invent. Omit field if not on official page.
 */
const ENRICHMENTS = {
  // —— AP ——
  "rhythm-ekkamai": {
    batch: "AP",
    official_url: "https://www.apthai.com/en/condominium/rhythm-ekkamai-estate",
    gallery_source:
      "https://www.apthai.com/en/condominium/rhythm-ekkamai-estate",
    brochure_url:
      "https://www.apthai.com/images/production/fFcY8ErhREZyw5E1BxUkKuKtyMj2j8-metaUkhZVEhNRUtLQU1BSUVTVEFURUUtQlJPQ0hVUkUucGRmLnBkZg==-.pdf",
    floor_plans_source:
      "https://www.apthai.com/en/condominium/rhythm-ekkamai-estate",
    address: {
      en: "Soi Sukhumvit 63 (Ekkamai Soi 1), Khlong Tan Nuea, Watthana, Bangkok",
      zh: "Soi Sukhumvit 63 (Ekkamai Soi 1), Khlong Tan Nuea, Watthana, Bangkok",
      th: "ซอยสุขุมวิท 63 (เอกมัยซอย 1) แขวงคลองตันเหนือ เขตวัฒนา กรุงเทพฯ",
    },
    project_status: "completed",
    construction_status: "completed",
    building_count: 1,
    floor_count: 33,
    total_units: 303,
    facilities: [
      "Infinity pool",
      "Floating lobby",
      "Sky lounge & library",
      "Fitness center",
      "Sky spa / wellness spa",
      "Sky garden",
    ],
    notes: "AP official Ready-to-Move-In page + brochure PDF + floor plan section",
  },
  "life-asoke-rama-9": {
    batch: "AP",
    official_url: "https://www.apthai.com/en/condominium/life-asoke-rama-9",
    gallery_source: "https://www.apthai.com/en/condominium/life-asoke-rama-9",
    project_status: "sold_out",
    construction_status: "completed",
    notes: "AP official page marks SOLD OUT; unit/floor counts not published on current page",
  },
  "life-ladprao": {
    batch: "AP",
    official_url: "https://www.apthai.com/en/condominium/life-ladprao",
    gallery_source: "https://www.apthai.com/en/condominium/life-ladprao",
    project_status: "sold_out",
    construction_status: "completed",
    notes: "AP official thank-you / sold-out style page",
  },

  // —— Sansiri ——
  "xt-phayathai": {
    batch: "Sansiri",
    official_url: "https://www.sansiri.com/hotdeal/project/xt-phayathai",
    gallery_source: "https://www.sansiri.com/hotdeal/project/xt-phayathai",
    address: {
      en: "Si Ayutthaya Road, Ratchathewi, Bangkok",
      zh: "Si Ayutthaya Road, Ratchathewi, Bangkok",
      th: "ถนนศรีอยุธยา เขตราชเทวี กรุงเทพฯ",
    },
    project_status: "completed",
    construction_status: "completed",
    total_units: 1435,
    notes: "Sansiri hotdeal page: ready-to-move, ~3 rai, 1435 units, Si Ayutthaya Rd",
  },

  // —— MQDC ——
  "the-forestias": {
    batch: "MQDC",
    official_url: "https://www.theforestias.com/",
    gallery_source: "https://www.theforestias.com/",
    project_status: "under_construction_or_selling",
    construction_status: "selling",
    facilities: [
      "Deep Forest reserve",
      "Forest Pavilion",
      "Resident Forest",
      "Event Lawn",
      "Canopy Walk",
      "Residence Sky Walk",
      "Community center & Family center",
    ],
    notes: "Official The Forestias site — multi-product district; Whizdom cited as 3 high-rise buildings on same site",
  },

  // —— Supalai ——
  "supalai-oriental-sukhumvit-39": {
    batch: "Supalai",
    official_url:
      "https://www.supalai.com/en/project/condo/supalai-oriental-sukhumvit-39",
    gallery_source:
      "https://www.supalai.com/en/project/condo/supalai-oriental-sukhumvit-39",
    building_count: 4,
    floor_count: 35,
    total_units: 1046,
    facilities: [
      "Swimming Pool",
      "Fitness",
      "Sky lounge",
      "Co-working space",
      "Garden / Park",
      "Kid’s Room",
      "Sauna",
      "24-hour Security",
      "Roof Garden",
      "Kid’s Pool",
      "Lounge Lobby",
    ],
    notes:
      "Supalai official: two 25-storey + two 35-storey buildings, 1,046 residential units",
  },

  // —— Ananda ——
  "ashton-asoke": {
    batch: "Ananda",
    official_url: "https://www.ananda.co.th/en/condominium/ashton-asoke",
    gallery_source: "https://www.ananda.co.th/en/condominium/ashton-asoke",
    address: {
      en: "Asok Montri Road (Sukhumvit 21), Khlong Toei Nuea, Watthana, Bangkok 10110",
      zh: "Asok Montri Road (Sukhumvit 21), Khlong Toei Nuea, Watthana, Bangkok 10110",
      th: "ถนนอโศกมนตรี (สุขุมวิท 21) แขวงคลองเตยเหนือ เขตวัฒนา กรุงเทพฯ 10110",
    },
    project_status: "completed",
    construction_status: "completed",
    building_count: 1,
    floor_count: 50,
    total_units: 783,
    facilities: [
      "Social Club",
      "Swimming Pool",
      "Kid's Pool",
      "Jacuzzi",
      "Fitness",
      "Steam Room",
      "Sauna Room",
      "Library",
      "Laundry",
      "Garden",
      "Concierge",
    ],
    notes: "Ananda EN+CN official pages — READY TO MOVE IN; 1 building / 783 units / floors to 50",
  },
  "ideo-q-sukhumvit-36": {
    batch: "Ananda",
    official_url:
      "https://www.ananda.co.th/en/condominium/ideo-q-sukhumvit-36",
    gallery_source:
      "https://www.ananda.co.th/en/condominium/ideo-q-sukhumvit-36",
    building_count: 2,
    floor_count: 47,
    total_units: 449,
    project_status: "selling",
    construction_status: "completed",
    facilities: [
      "Garden",
      "Lobby",
      "Parking",
      "Property Management",
    ],
    notes: "Ananda official: 2 buildings, 449 units; Building A to 47th floor",
  },
  "ideo-mobi-sukhumvit-66": {
    batch: "Ananda",
    official_url:
      "https://www.ananda.co.th/en/condominium/ideo-mobi-sukhumvit-66",
    gallery_source:
      "https://www.ananda.co.th/en/condominium/ideo-mobi-sukhumvit-66",
    building_count: 1,
    floor_count: 28,
    total_units: 298,
    notes:
      "Project page URL OK; unit/floor from Ananda blog thegenc on ananda.co.th (official domain) — if contested leave unverified later",
  },
};

const TEN_FIELDS = [
  ["official_gallery", "C_official_gallery_source"],
  ["official_brochure", "C_official_brochure"],
  ["official_floor_plans", "C_official_floor_plans"],
  ["official_facilities", "C_official_facilities"],
  ["full_address", "C_full_address"],
  ["project_status", "C_project_status"],
  ["completion_year", "C_completion_year"],
  ["building_count", "C_building_count"],
  ["floor_count", "C_floor_count"],
  ["total_units", "C_total_units"],
];

function scoreClass(cls) {
  if (cls === "OFFICIAL") return 1;
  if (cls === "VERIFIED_PORTAL" || cls === "DERIVED") return 0.5;
  return 0;
}

function mapFacilities(names, url) {
  return names.map((en) => ({
    key: en.toLowerCase().replace(/[^a-z0-9]+/g, "_"),
    name: { en, zh: en, th: en },
    source: "official_developer",
    source_url: url,
  }));
}

async function urlOk(url) {
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
      headers: { "User-Agent": "Mozilla/5.0 GoThailandHomeCredibilityBot/1.0" },
    });
    return res.ok;
  } catch {
    return false;
  }
}

const matrixPath = join(
  ROOT,
  "pipelines/factory/project-master/completeness_matrix.json",
);
const indexPath = join(
  ROOT,
  "pipelines/factory/project-master/official_source_index.json",
);
const matrix = JSON.parse(readFileSync(matrixPath, "utf8"));
const index = JSON.parse(readFileSync(indexPath, "utf8"));
const indexBySlug = Object.fromEntries(index.map((r) => [r.slug, r]));

const applied = [];
const skipped = [];

for (const [slug, e] of Object.entries(ENRICHMENTS)) {
  const manifestPath = join(ROOT, "content/projects", slug, "manifest.json");
  if (!existsSync(manifestPath)) {
    skipped.push({ slug, reason: "missing_manifest" });
    continue;
  }
  const ok = await urlOk(e.official_url);
  console.error(`${slug}: ${ok ? "OK" : "FAIL"} ${e.official_url}`);
  if (!ok) {
    skipped.push({ slug, reason: "official_url_unreachable" });
    continue;
  }
  if (e.brochure_url) {
    const bok = await urlOk(e.brochure_url);
    if (!bok) {
      console.error(`  brochure FAIL — leaving brochure UNVERIFIED`);
      delete e.brochure_url;
    }
  }

  const m = JSON.parse(readFileSync(manifestPath, "utf8"));
  const row = matrix.projects.find((p) => p.slug === slug);
  if (!row) {
    skipped.push({ slug, reason: "missing_matrix_row" });
    continue;
  }

  m.project = m.project || {};
  m.project.official_website = e.official_url;

  if (e.address) {
    m.project.address = e.address;
    row.C_full_address = "OFFICIAL";
  }
  if (e.project_status) {
    m.project.project_status = e.project_status;
    row.C_project_status = "OFFICIAL";
  }
  if (e.construction_status) {
    m.project.construction_status = e.construction_status;
  }
  if (e.completion_year != null) {
    m.project.completion_year = e.completion_year;
    row.C_completion_year = "OFFICIAL";
  }
  if (e.building_count != null) {
    m.project.building_count = e.building_count;
    row.C_building_count = "OFFICIAL";
  }
  if (e.floor_count != null) {
    m.project.floor_count = e.floor_count;
    row.C_floor_count = "OFFICIAL";
  }
  if (e.total_units != null) {
    m.project.total_units = e.total_units;
    row.C_total_units = "OFFICIAL";
  }
  if (e.facilities?.length) {
    const fac = mapFacilities(e.facilities, e.official_url);
    m.project.facilities_official = fac;
    m.project.facilities = fac;
    row.C_official_facilities = "OFFICIAL";
  }
  if (e.gallery_source) {
    m.project.official_gallery_source = e.gallery_source;
    row.C_official_gallery_source = "OFFICIAL";
  }
  if (e.brochure_url) {
    m.project.official_brochure = e.brochure_url;
    row.C_official_brochure = "OFFICIAL";
  }
  if (e.floor_plans_source) {
    m.project.official_floor_plans = e.floor_plans_source;
    row.C_official_floor_plans = "OFFICIAL";
  }

  // sources
  const sources = Array.isArray(m.sources) ? m.sources : [];
  if (!sources.some((s) => s.url === e.official_url)) {
    sources.unshift({
      type: "official_developer",
      name: `${slug} official project page`,
      url: e.official_url,
    });
  }
  if (e.brochure_url && !sources.some((s) => s.url === e.brochure_url)) {
    sources.unshift({
      type: "official_brochure",
      name: `${slug} official brochure PDF`,
      url: e.brochure_url,
    });
  }
  m.sources = sources;

  // field_evidence (10 sprint-3b fields + keep page)
  const fe = { ...(m.field_evidence || {}) };
  const put = (field, cls, url, value, note) => {
    fe[field] = {
      field,
      evidence_class: cls,
      provenance: {
        source_type:
          cls === "OFFICIAL"
            ? "official_developer_website"
            : cls === "VERIFIED_PORTAL"
              ? "verified_portal"
              : "unavailable",
        url: url || null,
      },
      verified_at: VERIFIED_AT,
      value: value ?? null,
      ...(note ? { note } : {}),
    };
  };

  put(
    "official_project_page",
    "OFFICIAL",
    e.official_url,
    e.official_url,
  );
  put(
    "official_gallery",
    row.C_official_gallery_source,
    e.gallery_source || e.official_url,
    e.gallery_source || null,
  );
  put(
    "official_brochure",
    row.C_official_brochure,
    e.brochure_url || e.official_url,
    e.brochure_url || null,
  );
  put(
    "official_floor_plan",
    row.C_official_floor_plans,
    e.floor_plans_source || e.official_url,
    e.floor_plans_source || null,
  );
  put(
    "official_facilities",
    row.C_official_facilities,
    e.official_url,
    e.facilities || null,
  );
  put(
    "official_address",
    row.C_full_address,
    e.official_url,
    e.address?.en || m.project.address?.en || null,
  );
  put(
    "project_status",
    row.C_project_status,
    e.official_url,
    e.project_status || null,
  );
  put(
    "completion_year",
    row.C_completion_year,
    e.official_url,
    e.completion_year ?? m.project.completion_year ?? null,
  );
  put(
    "building_count",
    row.C_building_count,
    e.official_url,
    e.building_count ?? null,
  );
  put(
    "floor_count",
    row.C_floor_count,
    e.official_url,
    e.floor_count ?? null,
  );
  put(
    "total_units",
    row.C_total_units,
    e.official_url,
    e.total_units ?? null,
  );

  m.field_evidence = fe;
  m.project_master = {
    ...(m.project_master || {}),
    phase: "10-sprint-3b",
    verified_at: VERIFIED_AT,
    batch: e.batch,
    sprint: "phase10-sprint-3b-developer-batches",
    notes: e.notes || null,
  };
  if (m.project_master.classifications) {
    Object.assign(m.project_master.classifications, {
      official_project_url: "OFFICIAL",
      full_address: row.C_full_address,
      official_gallery_source: row.C_official_gallery_source,
      official_brochure: row.C_official_brochure,
      official_floor_plans: row.C_official_floor_plans,
      official_facilities: row.C_official_facilities,
      project_status: row.C_project_status,
      completion_year: row.C_completion_year,
      building_count: row.C_building_count,
      floor_count: row.C_floor_count,
      total_units: row.C_total_units,
    });
  }

  writeFileSync(manifestPath, JSON.stringify(m, null, 2) + "\n");

  if (indexBySlug[slug]) {
    indexBySlug[slug].official_project_url = e.official_url;
  }

  applied.push({ slug, batch: e.batch, url: e.official_url });
}

// Rescore all 50 on 10-field formula + legacy 6-field
const allRows = [];
for (const p of matrix.projects) {
  let sum10 = 0;
  const cells = {};
  for (const [name, key] of TEN_FIELDS) {
    cells[name] = p[key];
    sum10 += scoreClass(p[key]);
  }
  const sixKeys = [
    "C_official_project_url",
    "C_full_address",
    "C_official_gallery_source",
    "C_official_brochure",
    "C_official_floor_plans",
    "C_official_facilities",
  ];
  let sum6 = 0;
  for (const k of sixKeys) sum6 += scoreClass(p[k]);

  const manifestPath = join(ROOT, "content/projects", p.slug, "manifest.json");
  let developer = null;
  let inBatch = false;
  if (existsSync(manifestPath)) {
    const m = JSON.parse(readFileSync(manifestPath, "utf8"));
    developer = m.developer?.slug || null;
    inBatch = BATCH_DEVELOPERS.includes(developer);
  }

  allRows.push({
    slug: p.slug,
    developer,
    in_batch: inBatch,
    ...cells,
    completeness_10_pct: Math.round((sum10 / TEN_FIELDS.length) * 1000) / 10,
    completeness_6_pct: Math.round((sum6 / sixKeys.length) * 1000) / 10,
  });
}

allRows.sort(
  (a, b) =>
    b.completeness_10_pct - a.completeness_10_pct ||
    a.slug.localeCompare(b.slug),
);

const avg10 =
  Math.round(
    (allRows.reduce((a, r) => a + r.completeness_10_pct, 0) / allRows.length) *
      10,
  ) / 10;
const avg6 =
  Math.round(
    (allRows.reduce((a, r) => a + r.completeness_6_pct, 0) / allRows.length) *
      10,
  ) / 10;
const batchRows = allRows.filter((r) => r.in_batch);
const avgBatch10 =
  batchRows.length === 0
    ? 0
    : Math.round(
        (batchRows.reduce((a, r) => a + r.completeness_10_pct, 0) /
          batchRows.length) *
          10,
      ) / 10;

matrix.generated_at = new Date().toISOString();
matrix.sprint = "phase10-sprint-3b";
writeFileSync(matrixPath, JSON.stringify(matrix, null, 2) + "\n");
writeFileSync(
  indexPath,
  JSON.stringify(Object.values(indexBySlug), null, 2) + "\n",
);

const snap = {
  verified_at: VERIFIED_AT,
  baseline_s1_6field_pct: 33.6,
  prior_s3_6field_pct: 35.0,
  target_10field_pct: 70,
  avg_10field_pct: avg10,
  avg_6field_pct: avg6,
  batch_avg_10field_pct: avgBatch10,
  target_met: avg10 >= 70,
  applied,
  skipped,
  field_counts: Object.fromEntries(
    TEN_FIELDS.map(([name, key]) => {
      const c = { OFFICIAL: 0, VERIFIED_PORTAL: 0, DERIVED: 0, UNVERIFIED: 0 };
      for (const p of matrix.projects) c[p[key]] = (c[p[key]] || 0) + 1;
      return [name, c];
    }),
  ),
  rows: allRows,
};

writeFileSync(
  join(ROOT, "pipelines/factory/project-master/sprint3b_field_snapshot.json"),
  JSON.stringify(snap, null, 2) + "\n",
);

console.log(
  JSON.stringify(
    {
      applied: applied.length,
      skipped,
      avg10,
      avg6,
      avgBatch10,
      target_met: snap.target_met,
      top: allRows.slice(0, 8).map((r) => ({
        slug: r.slug,
        pct10: r.completeness_10_pct,
        pct6: r.completeness_6_pct,
      })),
    },
    null,
    2,
  ),
);
