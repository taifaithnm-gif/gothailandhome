/** DATA_STANDARD validators for Property Factory M1 */
import { createHash } from "node:crypto";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCHEMA_DIR = resolve(__dirname, "../schemas");
const ROOT = resolve(__dirname, "../../..");
const PUBLIC_DIR = join(ROOT, "public");

const SOURCE_ALLOW = new Set([
  "propertyhub",
  "ddproperty",
  "livinginsider",
  "hipflat",
  "dotproperty",
  "fazwaz",
  "official_developer",
  "official_website",
  "facebook",
  "google_maps",
  "other_public_portal",
  "public_portal",
  "wikipedia",
  "bma",
  "PropertyHub",
]);

const TRANSIT_TAGS = new Set([
  "bts",
  "mrt",
  "mrt-orange",
  "mrt-yellow",
  "mrt-blue",
  "mrt-purple",
  "mrt-pink",
  "mrt-brown-planned",
  "arl",
  "boat",
  "expressway",
]);

const DATE_RE = /^\d{4}-\d{2}-\d{2}(T[\d:.+-Z]+)?$/;

export function listingFingerprint(listing) {
  const basis =
    listing.duplicate_fingerprint ||
    listing.external_ref ||
    listing.listing_url ||
    [
      listing.project_slug || "",
      listing.listing_type || "",
      listing.floor_label || "",
      listing.area_sqm ?? "",
      listing.bedrooms ?? "",
      listing.price_thb ?? "",
    ].join("|");
  return createHash("sha256").update(String(basis).toLowerCase()).digest("hex");
}

export function validateCaptureDate(value, label) {
  const errors = [];
  if (value == null || value === "") {
    errors.push(`${label}: required capture/update date`);
    return errors;
  }
  if (!DATE_RE.test(String(value))) {
    errors.push(`${label}: expected YYYY-MM-DD or ISO-8601`);
  }
  return errors;
}

/** Resolve public site paths (/foo) or leave remote URLs alone. */
export function resolveMediaPath(pathOrUrl) {
  if (!pathOrUrl || typeof pathOrUrl !== "string") return null;
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return { kind: "url", value: pathOrUrl, fsPath: null };
  }
  const cleaned = pathOrUrl.startsWith("/") ? pathOrUrl.slice(1) : pathOrUrl;
  return {
    kind: "file",
    value: pathOrUrl.startsWith("/") ? pathOrUrl : `/${cleaned}`,
    fsPath: join(PUBLIC_DIR, cleaned),
  };
}

export function validateMediaPathOrUrl(pathOrUrl, label) {
  const errors = [];
  const warnings = [];
  const resolved = resolveMediaPath(pathOrUrl);
  if (!resolved) {
    errors.push(`${label}: path or url required`);
    return { errors, warnings };
  }
  if (resolved.kind === "url") {
    if (!/^https?:\/\//i.test(resolved.value)) {
      errors.push(`${label}: invalid url`);
    }
    return { errors, warnings };
  }
  if (!existsSync(resolved.fsPath)) {
    errors.push(`${label}: media file missing at public${resolved.value}`);
  }
  return { errors, warnings };
}

export function createAjv() {
  const ajv = new Ajv2020({
    allErrors: true,
    strict: false,
    validateFormats: true,
  });
  addFormats(ajv);
  for (const file of readdirSync(SCHEMA_DIR)) {
    if (!file.endsWith(".json")) continue;
    const schema = JSON.parse(readFileSync(join(SCHEMA_DIR, file), "utf8"));
    ajv.addSchema(schema, schema.$id || file);
  }
  return ajv;
}

const ajv = createAjv();

export function validateSchema(schemaId, data) {
  const validate = ajv.getSchema(schemaId);
  if (!validate) {
    return {
      ok: false,
      errors: [`Schema not found: ${schemaId}`],
      warnings: [],
    };
  }
  const ok = validate(data);
  return {
    ok: Boolean(ok),
    errors: ok
      ? []
      : (validate.errors || []).map(
          (e) => `${e.instancePath || "/"} ${e.message}`,
        ),
    warnings: [],
  };
}

export function validateCoordinates(lat, lng, label = "coordinates") {
  const errors = [];
  const warnings = [];
  if (lat == null && lng == null) return { errors, warnings };
  if (lat == null || lng == null) {
    errors.push(`${label}: latitude and longitude must both be set`);
    return { errors, warnings };
  }
  if (typeof lat !== "number" || typeof lng !== "number") {
    errors.push(`${label}: must be numbers`);
    return { errors, warnings };
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    errors.push(`${label}: out of WGS84 range`);
  }
  // Thailand soft bounds
  if (lat < 5 || lat > 21 || lng < 97 || lng > 106) {
    warnings.push(`${label}: outside typical Thailand bounds`);
  }
  // Bangkok soft bounds
  if (lat >= 13.4 && lat <= 14.1 && lng >= 100.2 && lng <= 100.95) {
    // ok bangkok
  }
  return { errors, warnings };
}

export function validateSourceCode(source, label = "source") {
  const errors = [];
  if (!source) {
    errors.push(`${label}: missing`);
    return errors;
  }
  const normalized = String(source).toLowerCase().replace(/\s+/g, "");
  const ok =
    SOURCE_ALLOW.has(source) ||
    SOURCE_ALLOW.has(normalized) ||
    [...SOURCE_ALLOW].some(
      (s) => s.toLowerCase() === String(source).toLowerCase(),
    );
  if (!ok) errors.push(`${label}: not in allow-list (${source})`);
  return errors;
}

export function validateSourcesArray(sources, label = "sources") {
  const errors = [];
  if (!Array.isArray(sources) || sources.length < 1) {
    errors.push(`${label}: at least one source required`);
    return errors;
  }
  for (const [i, s] of sources.entries()) {
    if (!s?.url || !/^https?:\/\//i.test(s.url)) {
      errors.push(`${label}[${i}]: valid http(s) url required`);
    }
    if (s?.type) {
      errors.push(...validateSourceCode(s.type, `${label}[${i}].type`));
    }
  }
  return errors;
}

export function validateRequiredFields(obj, fields, label) {
  const errors = [];
  for (const field of fields) {
    const value = field.split(".").reduce((a, k) => a?.[k], obj);
    if (value == null || value === "") {
      errors.push(`${label} missing required field: ${field}`);
    }
  }
  return errors;
}

export function validateI18n(obj, label) {
  const errors = [];
  if (!obj || typeof obj !== "object") {
    errors.push(`${label}: i18n object required`);
    return errors;
  }
  for (const loc of ["en", "zh", "th"]) {
    if (!obj[loc] || typeof obj[loc] !== "string") {
      errors.push(`${label}.${loc}: required non-empty string`);
    }
  }
  return errors;
}

export function validateImages(images, { requireCover = false } = {}) {
  const errors = [];
  const warnings = [];
  if (!images) return { errors, warnings };
  if (!Array.isArray(images)) {
    errors.push("images: must be array");
    return { errors, warnings };
  }
  let hasCover = false;
  const urls = new Set();
  for (const [i, img] of images.entries()) {
    const ref = img?.url || img?.path;
    if (!ref) {
      errors.push(`images[${i}]: url or path required`);
      continue;
    }
    const media = validateMediaPathOrUrl(ref, `images[${i}]`);
    errors.push(...media.errors);
    warnings.push(...media.warnings);
    if (ref && urls.has(ref)) {
      warnings.push(`images[${i}]: duplicate url/path`);
    }
    if (ref) urls.add(ref);
    if (img.role === "cover" || img.role === "hero") hasCover = true;
    if (img.rights_note === "unknown") {
      warnings.push(`images[${i}]: rights_note=unknown (soft)`);
    }
  }
  if (requireCover && images.length && !hasCover) {
    warnings.push("images: no cover role (soft)");
  }
  return { errors, warnings };
}

export function validateLocaleCompleteness(
  obj,
  fields,
  label,
  { required = false } = {},
) {
  const errors = [];
  const warnings = [];
  for (const field of fields) {
    const value = field.split(".").reduce((a, k) => a?.[k], obj);
    const i18nErrors = validateI18n(value, `${label}.${field}`);
    if (required) errors.push(...i18nErrors);
    else warnings.push(...i18nErrors.map((e) => `${e} (soft)`));
  }
  if (obj?.locale_status) {
    for (const loc of ["en", "zh", "th"]) {
      const status = obj.locale_status[loc];
      if (required && status && status !== "complete") {
        errors.push(
          `${label}.locale_status.${loc}: must be complete when publish_ready`,
        );
      }
    }
  }
  return { errors, warnings };
}

export function validateMediaManifest(data) {
  const result = validateSchema(
    "https://gothailandhome.com/schemas/media.manifest.json",
    data,
  );
  const errors = [...result.errors];
  const warnings = [...result.warnings];
  if (!data?.entity_slug) errors.push("entity_slug: required");
  if (!Array.isArray(data?.items) || data.items.length < 1) {
    errors.push("items: at least one media item required");
  } else {
    for (const [i, item] of data.items.entries()) {
      const media = validateMediaPathOrUrl(item.path, `items[${i}].path`);
      errors.push(...media.errors);
      warnings.push(...media.warnings);
      if (item.alt) {
        errors.push(...validateI18n(item.alt, `items[${i}].alt`));
      }
    }
  }
  if (data?.collected_at) {
    errors.push(...validateCaptureDate(data.collected_at, "collected_at"));
  }
  return { ok: errors.length === 0, errors, warnings };
}

/** Detect duplicate keys within a listing batch */
export function detectListingDuplicates(listings) {
  const errors = [];
  const warnings = [];
  const byRef = new Map();
  const byUrl = new Map();
  const byFp = new Map();
  for (const [i, listing] of listings.entries()) {
    const ref = listing.external_ref;
    const url = listing.listing_url;
    const fp = listingFingerprint(listing);
    if (ref) {
      if (byRef.has(ref)) {
        errors.push(
          `duplicate external_ref ${ref} at indexes ${byRef.get(ref)} and ${i}`,
        );
      } else byRef.set(ref, i);
    }
    if (url) {
      if (byUrl.has(url)) {
        errors.push(
          `duplicate listing_url at indexes ${byUrl.get(url)} and ${i}`,
        );
      } else byUrl.set(url, i);
    }
    if (byFp.has(fp)) {
      errors.push(
        `duplicate fingerprint ${fp.slice(0, 12)}… at indexes ${byFp.get(fp)} and ${i}`,
      );
    } else byFp.set(fp, i);
    if (!ref && !url) {
      errors.push(`listing[${i}]: needs external_ref or listing_url`);
    }
  }
  return { errors, warnings };
}

export function validateTransitTags(tags, label = "transit_tags") {
  const warnings = [];
  if (!tags) return { errors: [], warnings };
  for (const t of tags) {
    if (!TRANSIT_TAGS.has(t)) {
      warnings.push(`${label}: unknown tag ${t}`);
    }
  }
  return { errors: [], warnings };
}

export function validateDeveloperPackage(data) {
  const result = validateSchema(
    "https://gothailandhome.com/schemas/developer.manifest.json",
    data,
  );
  const errors = [...result.errors];
  const warnings = [...result.warnings];
  errors.push(...validateSourcesArray(data.sources, "sources"));
  errors.push(...validateI18n(data.name, "name"));
  if (!data.slug) errors.push("slug: required");
  if (!data.verification_status) {
    errors.push("verification_status: required");
  } else if (
    ![
      "unverified",
      "platform_verified",
      "official_developer",
      "rejected",
      "expired",
    ].includes(data.verification_status)
  ) {
    warnings.push(
      `verification_status: uncommon value ${data.verification_status}`,
    );
  }
  if (data.publish_ready) {
    if (!data.website && !data.facebook_url) {
      errors.push("publish_ready requires website or facebook_url");
    }
    errors.push(...validateI18n(data.seo?.title, "seo.title"));
    errors.push(...validateI18n(data.seo?.description, "seo.description"));
  }
  if (data.listed_company) {
    if (!data.listed_company.exchange || !data.listed_company.ticker) {
      errors.push("listed_company requires exchange and ticker");
    }
    if (!data.listed_company.profile_url) {
      warnings.push("listed_company.profile_url missing (soft)");
    }
  }
  return { ok: errors.length === 0, errors, warnings };
}

export function validateDistrictPackage(data) {
  const result = validateSchema(
    "https://gothailandhome.com/schemas/district.package.json",
    data,
  );
  const errors = [...result.errors];
  const warnings = [...result.warnings];
  errors.push(...validateSourcesArray(data.sources, "sources"));
  errors.push(...validateI18n(data.name, "name"));
  if (data.metadata?.latitude != null || data.metadata?.longitude != null) {
    const c = validateCoordinates(
      data.metadata.latitude,
      data.metadata.longitude,
      "metadata",
    );
    errors.push(...c.errors);
    warnings.push(...c.warnings);
  }
  if (data.publish_ready) {
    errors.push(...validateI18n(data.seo?.title, "seo.title"));
    errors.push(...validateI18n(data.seo?.description, "seo.description"));
    const locale = validateLocaleCompleteness(
      data,
      ["name", "seo.title", "seo.description"],
      "district",
      { required: true },
    );
    errors.push(...locale.errors);
    warnings.push(...locale.warnings);
  }
  // No fabricated yield numbers
  const inv = JSON.stringify(data.investment_summary || {});
  if (/\d+(\.\d+)?\s*%/.test(inv) && !/sourced|source/i.test(inv)) {
    warnings.push(
      "investment_summary: percentage-like figure without explicit source note",
    );
  }
  if (data.collected_at) {
    errors.push(...validateCaptureDate(data.collected_at, "collected_at"));
  }
  return { ok: errors.length === 0, errors, warnings };
}

export function validateProjectPackage(data) {
  const result = validateSchema(
    "https://gothailandhome.com/schemas/project.manifest.json",
    data,
  );
  const errors = [...result.errors];
  const warnings = [...result.warnings];
  errors.push(...validateSourcesArray(data.sources, "sources"));
  errors.push(
    ...validateRequiredFields(
      data,
      [
        "slug",
        "developer.slug",
        "location.city_slug",
        "location.district_slug",
      ],
      "project",
    ),
  );
  if (data.location?.city_slug === "bangkok" && !data.location?.district_slug) {
    errors.push("bangkok projects require district_slug");
  }
  const lat = data.project?.latitude;
  const lng = data.project?.longitude;
  const c = validateCoordinates(lat, lng, "project");
  errors.push(...c.errors);
  warnings.push(...c.warnings);
  if (
    data.publish_ready &&
    !data.project?.google_maps_url &&
    lat == null &&
    !data.project?.official_website
  ) {
    errors.push(
      "publish_ready requires google_maps_url, coordinates, or official_website",
    );
  }
  const tt = validateTransitTags(data.project?.transit_tags);
  warnings.push(...tt.warnings);
  if (data.media?.items) {
    const img = validateImages(data.media.items, { requireCover: true });
    errors.push(...img.errors);
    warnings.push(...img.warnings);
  }
  for (const field of ["hero_image_path", "og_image_path"]) {
    const path = data.project?.[field];
    if (path) {
      const media = validateMediaPathOrUrl(path, `project.${field}`);
      errors.push(...media.errors);
      warnings.push(...media.warnings);
    }
  }
  if (data.collected_at) {
    errors.push(...validateCaptureDate(data.collected_at, "collected_at"));
  }
  if (data.publish_ready) {
    const locale = validateLocaleCompleteness(
      data,
      ["project.name"],
      "project",
      { required: true },
    );
    // project.name may live under project.name
    if (data.project?.name) {
      errors.push(...validateI18n(data.project.name, "project.name"));
    } else if (data.name) {
      errors.push(...validateI18n(data.name, "name"));
    } else {
      errors.push("publish_ready requires project.name EN/ZH/TH");
    }
    if (data.seo?.title) {
      errors.push(...validateI18n(data.seo.title, "seo.title"));
    }
    if (data.seo?.description) {
      errors.push(...validateI18n(data.seo.description, "seo.description"));
    }
    warnings.push(...locale.warnings);
  }
  return { ok: errors.length === 0, errors, warnings };
}

export function validateListingRecord(listing, index = 0) {
  const result = validateSchema(
    "https://gothailandhome.com/schemas/listing.record.json",
    listing,
  );
  const errors = result.errors.map((e) => `listing[${index}] ${e}`);
  const warnings = [];
  errors.push(
    ...validateSourceCode(listing.source, `listing[${index}].source`),
  );
  if (!listing.listing_url || !/^https?:\/\//i.test(listing.listing_url)) {
    errors.push(`listing[${index}]: listing_url required`);
  }
  if (!(listing.price_thb > 0)) {
    errors.push(`listing[${index}]: price_thb must be > 0`);
  }
  errors.push(
    ...validateCaptureDate(
      listing.source_updated_at || listing.collected_at,
      `listing[${index}].source_updated_at`,
    ),
  );
  const c = validateCoordinates(
    listing.latitude,
    listing.longitude,
    `listing[${index}]`,
  );
  errors.push(...c.errors);
  warnings.push(...c.warnings);
  if (listing.latitude == null && listing.longitude == null) {
    warnings.push(
      `listing[${index}]: coordinates missing (soft — inherit from project when applying)`,
    );
  }
  errors.push(
    ...validateI18n(listing.title, `listing[${index}].title`),
    ...validateI18n(listing.summary, `listing[${index}].summary`),
    ...validateI18n(listing.description, `listing[${index}].description`),
  );
  if (listing.publish_ready || listing.verification_status === "verified") {
    const locale = validateLocaleCompleteness(
      listing,
      ["title", "summary", "description"],
      `listing[${index}]`,
      { required: true },
    );
    errors.push(...locale.errors);
    warnings.push(...locale.warnings);
  }
  if (listing.images) {
    const img = validateImages(listing.images);
    errors.push(...img.errors.map((e) => `listing[${index}] ${e}`));
    warnings.push(...img.warnings.map((w) => `listing[${index}] ${w}`));
  }
  // Attach computed fingerprint for callers/reporting
  listing._computed_fingerprint = listingFingerprint(listing);
  return { ok: errors.length === 0, errors, warnings };
}

export function validateListingBatch(pkg) {
  const listings = pkg.listings || pkg;
  if (!Array.isArray(listings)) {
    return { ok: false, errors: ["listings array required"], warnings: [] };
  }
  const errors = [];
  const warnings = [];
  const dup = detectListingDuplicates(listings);
  errors.push(...dup.errors);
  warnings.push(...dup.warnings);
  for (const [i, listing] of listings.entries()) {
    const r = validateListingRecord(listing, i);
    errors.push(...r.errors);
    warnings.push(...r.warnings);
  }
  return { ok: errors.length === 0, errors, warnings };
}

export function loadJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

export function detectPackageKind(targetPath) {
  const abs = resolve(ROOT, targetPath);
  if (!existsSync(abs)) return { kind: null, abs };
  const st = statSync(abs);
  if (st.isDirectory()) {
    if (existsSync(join(abs, "manifest.json"))) {
      const m = loadJson(join(abs, "manifest.json"));
      if (m.project || m.location) return { kind: "project", abs, manifest: m };
      return { kind: "developer", abs, manifest: m };
    }
    return { kind: "dir", abs };
  }
  if (
    abs.includes(`${join("areas", "bangkok", "districts")}`) ||
    abs.includes("/areas/bangkok/districts/")
  ) {
    return { kind: "district", abs, data: loadJson(abs) };
  }
  if (abs.includes("/listings/") || abs.includes(`${join("listings")}`)) {
    return { kind: "listings", abs, data: loadJson(abs) };
  }
  const data = loadJson(abs);
  if (data.city_slug && data.metadata) return { kind: "district", abs, data };
  if (data.listings) return { kind: "listings", abs, data };
  if (data.entity_type && Array.isArray(data.items)) {
    return { kind: "media", abs, data };
  }
  if (data.project) return { kind: "project-file", abs, data };
  if (data.name && data.seo && data.slug)
    return { kind: "developer-file", abs, data };
  return { kind: "unknown", abs, data };
}

export function validatePath(targetPath) {
  const detected = detectPackageKind(targetPath);
  if (!detected.kind) {
    return {
      ok: false,
      errors: [`Path not found: ${targetPath}`],
      warnings: [],
    };
  }
  if (detected.kind === "project") {
    const result = validateProjectPackage(detected.manifest);
    const errors = [...result.errors];
    const warnings = [...result.warnings];
    const listingsPath = join(detected.abs, "listings.json");
    if (existsSync(listingsPath)) {
      const batch = validateListingBatch(loadJson(listingsPath));
      errors.push(...batch.errors);
      warnings.push(...batch.warnings);
    }
    const mediaPath = join(detected.abs, "media.json");
    if (existsSync(mediaPath)) {
      const media = validateMediaManifest(loadJson(mediaPath));
      errors.push(...media.errors);
      warnings.push(...media.warnings);
    }
    return { ok: errors.length === 0, errors, warnings };
  }
  if (detected.kind === "developer") {
    return validateDeveloperPackage(detected.manifest);
  }
  if (detected.kind === "district") {
    return validateDistrictPackage(detected.data);
  }
  if (detected.kind === "listings") {
    return validateListingBatch(detected.data);
  }
  if (detected.kind === "media") {
    return validateMediaManifest(detected.data);
  }
  if (detected.kind === "developer-file") {
    return validateDeveloperPackage(detected.data);
  }
  if (detected.kind === "project-file") {
    return validateProjectPackage(detected.data);
  }
  return {
    ok: false,
    errors: [`Unable to detect package kind for ${targetPath}`],
    warnings: [],
  };
}

export { ROOT, SOURCE_ALLOW, TRANSIT_TAGS, PUBLIC_DIR };
