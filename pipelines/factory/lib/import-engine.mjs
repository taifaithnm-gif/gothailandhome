/**
 * Import Pipeline V2 engine — validate → plan → apply → resume → rollback
 * Uses filesystem batch ledgers under content/_runs/ (no marketplace tables).
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  readdirSync,
} from "node:fs";
import { join, resolve, basename } from "node:path";
import { createClient } from "@supabase/supabase-js";
import {
  ROOT,
  validatePath,
  validateDeveloperPackage,
  validateDistrictPackage,
  validateProjectPackage,
  loadJson,
  detectPackageKind,
} from "./validate.mjs";

function loadEnvLocal() {
  try {
    const text = readFileSync(resolve(ROOT, ".env.local"), "utf8");
    for (const line of text.split("\n")) {
      if (!line || line.startsWith("#") || !line.includes("=")) continue;
      const i = line.indexOf("=");
      const key = line.slice(0, i);
      let value = line.slice(i + 1);
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // ignore
  }
}

loadEnvLocal();

const RUNS = join(ROOT, "content/_runs");
mkdirSync(RUNS, { recursive: true });

function newBatchId(prefix = "batch") {
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  return `${prefix}-${ts}`;
}

function writeBatch(batch) {
  writeFileSync(
    join(RUNS, `${batch.id}.json`),
    JSON.stringify(batch, null, 2) + "\n",
  );
}

function readBatch(id) {
  const path = join(RUNS, `${id}.json`);
  if (!existsSync(path)) throw new Error(`Batch not found: ${id}`);
  return loadJson(path);
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function planPath(targetPath) {
  const v = validatePath(targetPath);
  if (!v.ok) {
    return { ok: false, mode: "dry-run", validation: v, actions: [] };
  }
  const detected = detectPackageKind(targetPath);
  const actions = [];
  if (detected.kind === "district") {
    actions.push({
      entity: "district",
      key: detected.data.slug,
      action: "upsert",
    });
  } else if (
    detected.kind === "developer" ||
    detected.kind === "developer-file"
  ) {
    const m = detected.manifest || detected.data;
    actions.push({ entity: "developer", key: m.slug, action: "upsert" });
  } else if (detected.kind === "project") {
    actions.push({
      entity: "developer",
      key: detected.manifest.developer.slug,
      action: "upsert",
    });
    actions.push({
      entity: "project",
      key: detected.manifest.slug,
      action: "upsert",
    });
  } else if (detected.kind === "listings") {
    for (const l of detected.data.listings || []) {
      actions.push({
        entity: "listing",
        key: l.external_ref || l.listing_url,
        action: "upsert",
      });
    }
  }
  return {
    ok: true,
    mode: "dry-run",
    path: targetPath,
    kind: detected.kind,
    validation: v,
    counts: {
      upsert: actions.length,
      unchanged: 0,
    },
    actions,
  };
}

async function upsertDistrict(supabase, data) {
  const { data: city, error: cityErr } = await supabase
    .from("cities")
    .select("id")
    .eq("slug", data.city_slug)
    .maybeSingle();
  if (cityErr) throw cityErr;
  if (!city) throw new Error(`City not found: ${data.city_slug}`);

  const row = {
    city_id: city.id,
    slug: data.slug,
    name_en: data.name.en,
    name_zh: data.name.zh,
    name_th: data.name.th,
    seo_title_en: data.seo?.title?.en,
    seo_title_zh: data.seo?.title?.zh,
    seo_title_th: data.seo?.title?.th,
    seo_description_en: data.seo?.description?.en,
    seo_description_zh: data.seo?.description?.zh,
    seo_description_th: data.seo?.description?.th,
    summary_en: data.summary?.en,
    summary_zh: data.summary?.zh,
    summary_th: data.summary?.th,
    is_active: data.publish_ready !== false,
    sort_order: data.metadata?.district_code || 0,
  };
  const { error } = await supabase.from("districts").upsert(row, {
    onConflict: "slug",
  });
  if (error) throw error;
  return { key: data.slug, action: "upsert" };
}

async function upsertDeveloper(supabase, data) {
  const row = {
    slug: data.slug,
    name_en: data.name.en,
    name_zh: data.name.zh,
    name_th: data.name.th,
    website: data.website,
    seo_title_en: data.seo?.title?.en,
    seo_title_zh: data.seo?.title?.zh,
    seo_title_th: data.seo?.title?.th,
    seo_description_en: data.seo?.description?.en,
    seo_description_zh: data.seo?.description?.zh,
    seo_description_th: data.seo?.description?.th,
    is_published: data.publish_ready !== false,
  };
  // optional columns from phase4
  if (data.facebook_url !== undefined) row.facebook_url = data.facebook_url;
  if (data.description) {
    row.description_en = data.description.en;
    row.description_zh = data.description.zh;
    row.description_th = data.description.th;
  }
  const { error } = await supabase.from("developers").upsert(row, {
    onConflict: "slug",
  });
  if (error) throw error;
  return { key: data.slug, action: "upsert" };
}

async function upsertProject(supabase, manifest) {
  // Ensure developer
  if (manifest.developer) {
    await upsertDeveloper(supabase, {
      slug: manifest.developer.slug,
      name: manifest.developer.name,
      website: manifest.developer.website || manifest.project?.official_website,
      seo: {
        title: {
          en: `${manifest.developer.name.en} | GoThailandHome`,
          zh: `${manifest.developer.name.zh} | GoThailandHome`,
          th: `${manifest.developer.name.th} | GoThailandHome`,
        },
        description: {
          en: `Developer ${manifest.developer.name.en}`,
          zh: `开发商 ${manifest.developer.name.zh}`,
          th: `ผู้พัฒนา ${manifest.developer.name.th}`,
        },
      },
      publish_ready: true,
    });
  }

  const { data: developer } = await supabase
    .from("developers")
    .select("id")
    .eq("slug", manifest.developer.slug)
    .maybeSingle();

  let cityId = null;
  let districtId = null;
  if (manifest.location?.city_slug) {
    const { data: city } = await supabase
      .from("cities")
      .select("id")
      .eq("slug", manifest.location.city_slug)
      .maybeSingle();
    cityId = city?.id || null;
  }
  if (manifest.location?.district_slug) {
    const { data: district } = await supabase
      .from("districts")
      .select("id")
      .eq("slug", manifest.location.district_slug)
      .maybeSingle();
    districtId = district?.id || null;
  }

  // location row
  const locSlug =
    manifest.location?.slug ||
    `${manifest.location?.district_slug || "bangkok"}-${manifest.slug}`;
  const locRow = {
    slug: locSlug,
    name_en: manifest.location.name.en,
    name_zh: manifest.location.name.zh,
    name_th: manifest.location.name.th,
    city_en: manifest.location.city?.en || "Bangkok",
    city_zh: manifest.location.city?.zh || "曼谷",
    city_th: manifest.location.city?.th || "กรุงเทพมหานคร",
    province_en: manifest.location.province?.en || "Bangkok",
    province_zh: manifest.location.province?.zh || "曼谷",
    province_th: manifest.location.province?.th || "กรุงเทพมหานคร",
    country_code: "TH",
    city_id: cityId,
    district_id: districtId,
  };
  const { data: location, error: locErr } = await supabase
    .from("locations")
    .upsert(locRow, { onConflict: "slug" })
    .select("id")
    .maybeSingle();
  if (locErr) throw locErr;

  const p = manifest.project;
  const projectRow = {
    slug: manifest.slug,
    developer_id: developer?.id || null,
    location_id: location?.id || null,
    name_en: p.name.en,
    name_zh: p.name.zh,
    name_th: p.name.th,
    description_en: p.description?.en || null,
    description_zh: p.description?.zh || null,
    description_th: p.description?.th || null,
    city_id: cityId,
    district_id: districtId,
    transit_tags: p.transit_tags || [],
  };

  // Best-effort optional columns from phase4
  const optional = {
    address_en: p.address?.en,
    address_zh: p.address?.zh,
    address_th: p.address?.th,
    postal_code: p.postal_code,
    latitude: p.latitude,
    longitude: p.longitude,
    google_maps_url: p.google_maps_url,
    official_website: p.official_website,
    seo_title_en: p.seo?.title?.en,
    seo_title_zh: p.seo?.title?.zh,
    seo_title_th: p.seo?.title?.th,
    seo_description_en: p.seo?.description?.en,
    seo_description_zh: p.seo?.description?.zh,
    seo_description_th: p.seo?.description?.th,
    status: manifest.publish_ready === false ? "draft" : "published",
  };
  Object.assign(projectRow, optional);

  let { error } = await supabase
    .from("property_projects")
    .upsert(projectRow, { onConflict: "slug" });
  if (error && /column/.test(error.message || "")) {
    // retry minimal columns
    const minimal = {
      slug: manifest.slug,
      developer_id: developer?.id || null,
      location_id: location?.id || null,
      name_en: p.name.en,
      name_zh: p.name.zh,
      name_th: p.name.th,
      description_en: p.description?.en || null,
      description_zh: p.description?.zh || null,
      description_th: p.description?.th || null,
      city_id: cityId,
      district_id: districtId,
      transit_tags: p.transit_tags || [],
    };
    ({ error } = await supabase
      .from("property_projects")
      .upsert(minimal, { onConflict: "slug" }));
  }
  if (error) throw error;
  return { key: manifest.slug, action: "upsert" };
}

export async function applyPath(targetPath, { batchId } = {}) {
  const plan = await planPath(targetPath);
  if (!plan.ok) return { ...plan, mode: "apply" };

  const supabase = getSupabase();
  const batch = {
    id: batchId || newBatchId(basename(targetPath).replace(/\W+/g, "-")),
    started_at: new Date().toISOString(),
    finished_at: null,
    mode: "apply",
    path: targetPath,
    status: "running",
    items: [],
    snapshot: [],
  };

  if (!supabase) {
    batch.status = "blocked";
    batch.error =
      "Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY — dry-run plan only";
    batch.plan = plan;
    batch.finished_at = new Date().toISOString();
    writeBatch(batch);
    return { ok: false, batch_id: batch.id, ...batch };
  }

  const detected = detectPackageKind(targetPath);
  try {
    if (detected.kind === "district") {
      const r = await upsertDistrict(supabase, detected.data);
      batch.items.push({ ...r, status: "ok" });
      batch.snapshot.push({ entity: "district", key: r.key });
    } else if (
      detected.kind === "developer" ||
      detected.kind === "developer-file"
    ) {
      const data = detected.manifest || detected.data;
      const r = await upsertDeveloper(supabase, data);
      batch.items.push({ ...r, status: "ok" });
      batch.snapshot.push({ entity: "developer", key: r.key });
    } else if (detected.kind === "project") {
      const r = await upsertProject(supabase, detected.manifest);
      batch.items.push({ ...r, status: "ok" });
      batch.snapshot.push({ entity: "project", key: r.key });
    } else if (detected.kind === "listings") {
      // Delegate listing apply to existing v1 importer for project packages
      batch.items.push({
        entity: "listings",
        key: targetPath,
        status: "skipped",
        note: "Use v1 content:import for listing batches in M1; V2 validates only",
      });
    }
    batch.status = "completed";
  } catch (err) {
    batch.status = "failed";
    batch.error = String(err?.message || err);
    batch.items.push({ status: "error", error: batch.error });
  }
  batch.finished_at = new Date().toISOString();
  writeBatch(batch);
  return {
    ok: batch.status === "completed",
    batch_id: batch.id,
    status: batch.status,
    items: batch.items,
    error: batch.error,
  };
}

export async function planWave(name = "bangkok-w1") {
  const actions = [];
  const errors = [];
  const districtDir = join(ROOT, "content/areas/bangkok/districts");
  for (const f of readdirSync(districtDir).filter((x) => x.endsWith(".json"))) {
    const v = validateDistrictPackage(loadJson(join(districtDir, f)));
    if (!v.ok) errors.push({ file: f, errors: v.errors });
    else actions.push({ entity: "district", key: f.replace(/\.json$/, "") });
  }
  const devDir = join(ROOT, "content/developers");
  for (const slug of readdirSync(devDir)) {
    const manifest = join(devDir, slug, "manifest.json");
    if (!existsSync(manifest)) continue;
    const v = validateDeveloperPackage(loadJson(manifest));
    if (!v.ok) errors.push({ file: slug, errors: v.errors });
    else actions.push({ entity: "developer", key: slug });
  }
  const projDir = join(ROOT, "content/projects");
  for (const slug of readdirSync(projDir)) {
    const manifest = join(projDir, slug, "manifest.json");
    if (!existsSync(manifest)) continue;
    const v = validateProjectPackage(loadJson(manifest));
    if (!v.ok) errors.push({ file: slug, errors: v.errors.slice(0, 8) });
    else actions.push({ entity: "project", key: slug });
  }
  return {
    ok: errors.length === 0,
    wave: name,
    mode: "dry-run",
    counts: {
      districts: actions.filter((a) => a.entity === "district").length,
      developers: actions.filter((a) => a.entity === "developer").length,
      projects: actions.filter((a) => a.entity === "project").length,
      validation_errors: errors.length,
    },
    errors: errors.slice(0, 20),
    actions_sample: actions.slice(0, 10),
  };
}

export async function applyWave(name = "bangkok-w1") {
  const plan = await planWave(name);
  const batch = {
    id: newBatchId(name),
    started_at: new Date().toISOString(),
    wave: name,
    status: "running",
    items: [],
    snapshot: [],
  };
  writeBatch(batch);

  if (!plan.ok) {
    batch.status = "failed";
    batch.error = "Wave validation failed";
    batch.plan = plan;
    batch.finished_at = new Date().toISOString();
    writeBatch(batch);
    return { ok: false, batch_id: batch.id, plan };
  }

  const supabase = getSupabase();
  if (!supabase) {
    batch.status = "blocked";
    batch.error = "Missing Supabase credentials";
    batch.plan = plan;
    batch.finished_at = new Date().toISOString();
    writeBatch(batch);
    return { ok: false, batch_id: batch.id, ...batch };
  }

  // ordered: districts → developers → projects
  const districtDir = join(ROOT, "content/areas/bangkok/districts");
  for (const f of readdirSync(districtDir).filter((x) => x.endsWith(".json"))) {
    try {
      const data = loadJson(join(districtDir, f));
      const r = await upsertDistrict(supabase, data);
      batch.items.push({ entity: "district", ...r, status: "ok" });
      batch.snapshot.push({ entity: "district", key: r.key });
    } catch (err) {
      batch.items.push({
        entity: "district",
        key: f,
        status: "error",
        error: String(err.message || err),
      });
    }
    writeBatch(batch);
  }

  const devDir = join(ROOT, "content/developers");
  for (const slug of readdirSync(devDir)) {
    const manifest = join(devDir, slug, "manifest.json");
    if (!existsSync(manifest)) continue;
    try {
      const r = await upsertDeveloper(supabase, loadJson(manifest));
      batch.items.push({ entity: "developer", ...r, status: "ok" });
      batch.snapshot.push({ entity: "developer", key: r.key });
    } catch (err) {
      batch.items.push({
        entity: "developer",
        key: slug,
        status: "error",
        error: String(err.message || err),
      });
    }
    writeBatch(batch);
  }

  const projDir = join(ROOT, "content/projects");
  for (const slug of readdirSync(projDir)) {
    const manifestPath = join(projDir, slug, "manifest.json");
    if (!existsSync(manifestPath)) continue;
    try {
      const r = await upsertProject(supabase, loadJson(manifestPath));
      batch.items.push({ entity: "project", ...r, status: "ok" });
      batch.snapshot.push({ entity: "project", key: r.key });
    } catch (err) {
      batch.items.push({
        entity: "project",
        key: slug,
        status: "error",
        error: String(err.message || err),
      });
    }
    writeBatch(batch);
  }

  const failed = batch.items.filter((i) => i.status === "error").length;
  batch.status = failed ? "completed_with_errors" : "completed";
  batch.finished_at = new Date().toISOString();
  writeBatch(batch);
  return {
    ok: failed === 0,
    batch_id: batch.id,
    status: batch.status,
    counts: {
      ok: batch.items.filter((i) => i.status === "ok").length,
      error: failed,
    },
  };
}

export async function resumeBatch(batchId) {
  if (!batchId) throw new Error("batch_id required");
  const batch = readBatch(batchId);
  if (batch.status === "completed") {
    return { ok: true, note: "already completed", batch_id: batchId };
  }
  if (batch.wave) {
    return applyWave(batch.wave);
  }
  if (batch.path) {
    return applyPath(batch.path, { batchId: newBatchId("resume") });
  }
  return { ok: false, error: "Batch has no wave/path to resume" };
}

export async function rollbackBatch(batchId) {
  if (!batchId) throw new Error("batch_id required");
  const batch = readBatch(batchId);
  const supabase = getSupabase();
  if (!supabase) {
    return { ok: false, error: "Missing Supabase credentials" };
  }
  const results = [];
  for (const item of batch.snapshot || []) {
    try {
      if (item.entity === "district") {
        await supabase
          .from("districts")
          .update({ is_active: false })
          .eq("slug", item.key);
        results.push({ ...item, rolled_back: "deactivated" });
      } else if (item.entity === "developer") {
        await supabase
          .from("developers")
          .update({ is_published: false })
          .eq("slug", item.key);
        results.push({ ...item, rolled_back: "unpublished" });
      } else if (item.entity === "project") {
        // soft: leave row; mark via description note not available — no delete
        results.push({
          ...item,
          rolled_back: "skipped_no_delete",
          note: "Projects are not hard-deleted; re-import or manual archive",
        });
      }
    } catch (err) {
      results.push({ ...item, error: String(err.message || err) });
    }
  }
  batch.rollback_at = new Date().toISOString();
  batch.rollback_results = results;
  batch.status = "rolled_back";
  writeBatch(batch);
  return { ok: true, batch_id: batchId, results };
}
