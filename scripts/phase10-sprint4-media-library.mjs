#!/usr/bin/env node
/**
 * Phase 10 Sprint 4 — Official Media Library
 *
 * Policy:
 * - Developer logos/favicons: mirror public official-site identity assets (Sprint 2 URLs).
 * - Brochures: mirror only publicly posted official marketing PDFs we already verified.
 * - Galleries / floor plans / heroes: register official URLs as hotlinks.
 *   Do NOT scrape copyrighted photo binaries without license permission.
 * - Never use portal screenshots.
 */
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(process.cwd());
const DOWNLOADED_AT = "2026-07-16";
const LIB = join(ROOT, "content/media/library");
const PUBLIC_DEV = join(ROOT, "public/developers");

function sha256File(buf) {
  return createHash("sha256").update(buf).digest("hex");
}

function extFromUrl(url, contentType) {
  const u = url.split("?")[0].toLowerCase();
  if (u.endsWith(".svg")) return ".svg";
  if (u.endsWith(".webp")) return ".webp";
  if (u.endsWith(".png")) return ".png";
  if (u.endsWith(".jpg") || u.endsWith(".jpeg")) return ".jpg";
  if (u.endsWith(".ico")) return ".ico";
  if (u.endsWith(".pdf")) return ".pdf";
  if (contentType?.includes("svg")) return ".svg";
  if (contentType?.includes("png")) return ".png";
  if (contentType?.includes("webp")) return ".webp";
  if (contentType?.includes("jpeg") || contentType?.includes("jpg"))
    return ".jpg";
  if (contentType?.includes("pdf")) return ".pdf";
  if (contentType?.includes("icon")) return ".ico";
  return ".bin";
}

async function download(url) {
  const res = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(25000),
    headers: { "User-Agent": "GoThailandHomeMediaLibrary/1.0 (+official-cache)" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (!buf.length) throw new Error("empty body");
  const ct = res.headers.get("content-type") || "";
  return { buf, contentType: ct, finalUrl: res.url };
}

function assetRecord(partial) {
  return {
    id: partial.id,
    class: partial.class,
    entity_type: partial.entity_type,
    entity_slug: partial.entity_slug,
    role: partial.role,
    official_url: partial.official_url,
    copyright_source: partial.copyright_source,
    downloaded_date: partial.downloaded_date ?? null,
    checksum_sha256: partial.checksum_sha256 ?? null,
    local_storage_path: partial.local_storage_path ?? null,
    rights_note: partial.rights_note,
    download_status: partial.download_status,
    verified_at: DOWNLOADED_AT,
    notes: partial.notes ?? null,
  };
}

mkdirSync(LIB, { recursive: true });
mkdirSync(join(LIB, "developers"), { recursive: true });
mkdirSync(join(LIB, "projects"), { recursive: true });

const catalog = {
  generated_at: new Date().toISOString(),
  sprint: "phase10-sprint-4-media-library",
  policy: {
    logos: "mirror_official_site_identity_assets",
    brochures: "mirror_only_verified_official_marketing_pdfs",
    galleries_floorplans_heroes:
      "hotlink_register_only_no_binary_scrape_without_license",
    forbidden: ["portal_screenshots", "unlicensed_gallery_scrapes"],
  },
  assets: [],
};

const logoFailures = [];
const logoSuccess = [];

// —— 1) Developer logos / favicons ——
const devDir = join(ROOT, "content/developers");
const developerSlugs = readdirSync(devDir).filter((d) =>
  existsSync(join(devDir, d, "manifest.json")),
);

for (const slug of developerSlugs) {
  const manifest = JSON.parse(
    readFileSync(join(devDir, slug, "manifest.json"), "utf8"),
  );
  const logoUrl =
    manifest.logo_source?.official_logo_url ||
    manifest.field_evidence?.official_logo?.value ||
    null;
  const favUrl =
    manifest.logo_source?.favicon_url ||
    manifest.field_evidence?.favicon?.value ||
    logoUrl;
  const copyright = `© ${manifest.name?.en || slug} — official website identity asset`;
  const outDir = join(LIB, "developers", slug);
  mkdirSync(outDir, { recursive: true });
  mkdirSync(join(PUBLIC_DEV, slug), { recursive: true });

  for (const [role, url] of [
    ["logo", logoUrl],
    ["favicon", favUrl],
  ]) {
    if (!url) {
      catalog.assets.push(
        assetRecord({
          id: `developer:${slug}:${role}`,
          class: role === "logo" ? "developer_logo" : "favicon",
          entity_type: "developer",
          entity_slug: slug,
          role,
          official_url: null,
          copyright_source: copyright,
          rights_note: "unknown",
          download_status: "missing_official_url",
          notes: "No official URL in developer package",
        }),
      );
      continue;
    }
    try {
      const { buf, contentType, finalUrl } = await download(url);
      const ext = extFromUrl(finalUrl || url, contentType);
      const filename = `${role}${ext}`;
      const relLib = `content/media/library/developers/${slug}/${filename}`;
      const absLib = join(ROOT, relLib);
      writeFileSync(absLib, buf);
      const checksum = sha256File(buf);

      // Also place under public for delivery (official cache, not placeholder SVG)
      const pubName = role === "logo" ? `official-logo${ext}` : `favicon${ext}`;
      const relPub = `public/developers/${slug}/${pubName}`;
      writeFileSync(join(ROOT, relPub), buf);

      const rec = assetRecord({
        id: `developer:${slug}:${role}`,
        class: role === "logo" ? "developer_logo" : "favicon",
        entity_type: "developer",
        entity_slug: slug,
        role,
        official_url: finalUrl || url,
        copyright_source: copyright,
        downloaded_date: DOWNLOADED_AT,
        checksum_sha256: checksum,
        local_storage_path: relLib,
        rights_note: "mirrored_to_storage",
        download_status: "downloaded",
        notes: `Public delivery copy: /developers/${slug}/${pubName}. Placeholder SVG retained as non-trademark fallback.`,
      });
      catalog.assets.push(rec);
      writeFileSync(
        join(outDir, `${role}.asset.json`),
        JSON.stringify(rec, null, 2) + "\n",
      );

      if (role === "logo") {
        logoSuccess.push(slug);
        // Update logo.meta.json
        const metaPath = join(PUBLIC_DEV, slug, "logo.meta.json");
        const meta = existsSync(metaPath)
          ? JSON.parse(readFileSync(metaPath, "utf8"))
          : { slug };
        meta.status = "official_cached";
        meta.official_logo_url = finalUrl || url;
        meta.favicon_url = favUrl || url;
        meta.cached_local_path = `/${relPub.replace(/^public\//, "")}`;
        meta.library_path = relLib;
        meta.checksum_sha256 = checksum;
        meta.downloaded_date = DOWNLOADED_AT;
        meta.copyright_source = copyright;
        meta.placeholder_fallback = `/developers/${slug}/logo.svg`;
        meta.note =
          "Official logo cached from developer domain. Local SVG remains non-trademark fallback only.";
        meta.collected_at = DOWNLOADED_AT;
        writeFileSync(metaPath, JSON.stringify(meta, null, 2) + "\n");

        // Point package logo_url at cached official asset when present
        if (manifest.logo_source) {
          manifest.logo_source.status = "official";
          manifest.logo_source.cached_path = `/${relPub.replace(/^public\//, "")}`;
          manifest.logo_source.checksum_sha256 = checksum;
          manifest.logo_source.downloaded_date = DOWNLOADED_AT;
        }
        manifest.logo_url = `/${relPub.replace(/^public\//, "")}`;
        writeFileSync(
          join(devDir, slug, "manifest.json"),
          JSON.stringify(manifest, null, 2) + "\n",
        );
      }
      console.error(`OK ${slug} ${role} ${checksum.slice(0, 12)}…`);
    } catch (err) {
      logoFailures.push({ slug, role, url, error: String(err.message || err) });
      catalog.assets.push(
        assetRecord({
          id: `developer:${slug}:${role}`,
          class: role === "logo" ? "developer_logo" : "favicon",
          entity_type: "developer",
          entity_slug: slug,
          role,
          official_url: url,
          copyright_source: copyright,
          rights_note: "hotlink",
          download_status: "download_failed",
          notes: `Fetch failed: ${err.message || err}`,
        }),
      );
      console.error(`FAIL ${slug} ${role}: ${err.message || err}`);
    }
  }
}

// —— 2) Brochures (verified official PDFs only) ——
const BROCHURES = [
  {
    slug: "rhythm-ekkamai",
    url: "https://www.apthai.com/images/production/fFcY8ErhREZyw5E1BxUkKuKtyMj2j8-metaUkhZVEhNRUtLQU1BSUVTVEFURUUtQlJPQ0hVUkUucGRmLnBkZg==-.pdf",
    copyright_source: "© AP (Thailand) Public Company Limited — official project brochure PDF",
  },
];

const brochureOk = [];
for (const b of BROCHURES) {
  const outDir = join(LIB, "projects", b.slug);
  mkdirSync(outDir, { recursive: true });
  try {
    const { buf, finalUrl } = await download(b.url);
    const rel = `content/media/library/projects/${b.slug}/brochure.pdf`;
    writeFileSync(join(ROOT, rel), buf);
    const checksum = sha256File(buf);
    // public copy
    mkdirSync(join(ROOT, "public/projects", b.slug), { recursive: true });
    const pubRel = `public/projects/${b.slug}/brochure.pdf`;
    writeFileSync(join(ROOT, pubRel), buf);
    const rec = assetRecord({
      id: `project:${b.slug}:brochure`,
      class: "brochure",
      entity_type: "project",
      entity_slug: b.slug,
      role: "brochure",
      official_url: finalUrl || b.url,
      copyright_source: b.copyright_source,
      downloaded_date: DOWNLOADED_AT,
      checksum_sha256: checksum,
      local_storage_path: rel,
      rights_note: "mirrored_to_storage",
      download_status: "downloaded",
      notes: `Public path /projects/${b.slug}/brochure.pdf`,
    });
    catalog.assets.push(rec);
    writeFileSync(
      join(outDir, "brochure.asset.json"),
      JSON.stringify(rec, null, 2) + "\n",
    );
    brochureOk.push(b.slug);

    // Update project manifest brochure path if present
    const mp = join(ROOT, "content/projects", b.slug, "manifest.json");
    if (existsSync(mp)) {
      const m = JSON.parse(readFileSync(mp, "utf8"));
      m.project = m.project || {};
      m.project.official_brochure = finalUrl || b.url;
      m.project.brochure_local_path = `/projects/${b.slug}/brochure.pdf`;
      m.media_library = {
        ...(m.media_library || {}),
        brochure: {
          official_url: finalUrl || b.url,
          local_storage_path: rel,
          checksum_sha256: checksum,
          downloaded_date: DOWNLOADED_AT,
          copyright_source: b.copyright_source,
        },
      };
      writeFileSync(mp, JSON.stringify(m, null, 2) + "\n");
    }
    console.error(`OK brochure ${b.slug}`);
  } catch (err) {
    catalog.assets.push(
      assetRecord({
        id: `project:${b.slug}:brochure`,
        class: "brochure",
        entity_type: "project",
        entity_slug: b.slug,
        role: "brochure",
        official_url: b.url,
        copyright_source: b.copyright_source,
        rights_note: "hotlink",
        download_status: "download_failed",
        notes: String(err.message || err),
      }),
    );
    console.error(`FAIL brochure ${b.slug}: ${err.message || err}`);
  }
}

// —— 3) Galleries / floor plans / heroes — hotlink register only ——
const projectDir = join(ROOT, "content/projects");
const projectSlugs = readdirSync(projectDir).filter((d) =>
  existsSync(join(projectDir, d, "manifest.json")),
);

let galleryHotlinks = 0;
let floorHotlinks = 0;
let heroHotlinks = 0;
let heroPlaceholders = 0;

for (const slug of projectSlugs) {
  const mp = join(projectDir, slug, "manifest.json");
  const m = JSON.parse(readFileSync(mp, "utf8"));
  const outDir = join(LIB, "projects", slug);
  mkdirSync(outDir, { recursive: true });
  const mediaLib = { ...(m.media_library || {}) };
  const copyrightBase = `© ${m.developer?.name?.en || "Developer"} / ${m.project?.name?.en || slug} — official project materials`;

  const galleryUrl =
    m.project?.official_gallery_source ||
    m.field_evidence?.official_gallery?.value ||
    null;
  const galleryClass =
    m.field_evidence?.official_gallery?.evidence_class ||
    m.project_master?.classifications?.official_gallery_source ||
    null;

  if (galleryUrl && (galleryClass === "OFFICIAL" || galleryUrl.startsWith("http"))) {
    const rec = assetRecord({
      id: `project:${slug}:gallery`,
      class: "gallery",
      entity_type: "project",
      entity_slug: slug,
      role: "gallery",
      official_url: galleryUrl,
      copyright_source: copyrightBase,
      downloaded_date: null,
      checksum_sha256: null,
      local_storage_path: null,
      rights_note: "hotlink",
      download_status: "not_downloaded_pending_license",
      notes:
        "Official gallery page/source registered. Image binaries not scraped (no license permission).",
    });
    catalog.assets.push(rec);
    mediaLib.gallery = {
      official_url: galleryUrl,
      copyright_source: copyrightBase,
      downloaded_date: null,
      checksum_sha256: null,
      local_storage_path: null,
      rights_note: "hotlink",
      download_status: "not_downloaded_pending_license",
    };
    galleryHotlinks += 1;
    writeFileSync(
      join(outDir, "gallery.asset.json"),
      JSON.stringify(rec, null, 2) + "\n",
    );
  }

  const floorUrl =
    m.project?.official_floor_plans ||
    m.field_evidence?.official_floor_plan?.value ||
    null;
  if (floorUrl && typeof floorUrl === "string" && floorUrl.startsWith("http")) {
    const rec = assetRecord({
      id: `project:${slug}:floor_plans`,
      class: "floor_plan",
      entity_type: "project",
      entity_slug: slug,
      role: "floor_plans",
      official_url: floorUrl,
      copyright_source: copyrightBase,
      downloaded_date: null,
      checksum_sha256: null,
      local_storage_path: null,
      rights_note: "hotlink",
      download_status: "not_downloaded_pending_license",
      notes:
        "Official floor-plan section/page registered. Plan binaries not scraped without permission.",
    });
    catalog.assets.push(rec);
    mediaLib.floor_plans = {
      official_url: floorUrl,
      copyright_source: copyrightBase,
      downloaded_date: null,
      checksum_sha256: null,
      local_storage_path: null,
      rights_note: "hotlink",
      download_status: "not_downloaded_pending_license",
    };
    floorHotlinks += 1;
    writeFileSync(
      join(outDir, "floor_plans.asset.json"),
      JSON.stringify(rec, null, 2) + "\n",
    );
  }

  // Hero: prefer official project page as source; do not invent hero binary
  const heroOfficial =
    m.project?.official_website ||
    m.field_evidence?.official_project_page?.value ||
    galleryUrl ||
    null;
  const heroPath = m.project?.hero_image_path || null;
  const isPlaceholder =
    !heroPath ||
    String(heroPath).includes("placeholder") ||
    String(heroPath).endsWith(".svg");

  if (heroOfficial) {
    const rec = assetRecord({
      id: `project:${slug}:hero`,
      class: "hero",
      entity_type: "project",
      entity_slug: slug,
      role: "hero",
      official_url: heroOfficial,
      copyright_source: copyrightBase,
      downloaded_date: null,
      checksum_sha256: null,
      local_storage_path: isPlaceholder ? null : heroPath?.replace(/^\//, "public/"),
      rights_note: isPlaceholder ? "hotlink" : "unknown",
      download_status: isPlaceholder
        ? "placeholder_pending_official_mirror"
        : "local_non_official_or_unknown",
      notes: isPlaceholder
        ? `Placeholder remains at ${heroPath || "n/a"}; official hero binary not mirrored without license.`
        : `Existing local hero path ${heroPath}`,
    });
    catalog.assets.push(rec);
    mediaLib.hero = {
      official_url: heroOfficial,
      copyright_source: copyrightBase,
      downloaded_date: null,
      checksum_sha256: null,
      local_storage_path: rec.local_storage_path,
      rights_note: rec.rights_note,
      download_status: rec.download_status,
      placeholder_path: isPlaceholder ? heroPath : null,
    };
    if (isPlaceholder) heroPlaceholders += 1;
    else heroHotlinks += 1;
    writeFileSync(
      join(outDir, "hero.asset.json"),
      JSON.stringify(rec, null, 2) + "\n",
    );
  }

  // Brochure hotlink if official URL but not already downloaded
  const broUrl =
    typeof m.project?.official_brochure === "string"
      ? m.project.official_brochure
      : m.project?.official_brochure?.url || null;
  if (
    broUrl &&
    broUrl.startsWith("http") &&
    !brochureOk.includes(slug) &&
    !mediaLib.brochure
  ) {
    const rec = assetRecord({
      id: `project:${slug}:brochure`,
      class: "brochure",
      entity_type: "project",
      entity_slug: slug,
      role: "brochure",
      official_url: broUrl,
      copyright_source: copyrightBase,
      downloaded_date: null,
      checksum_sha256: null,
      local_storage_path: null,
      rights_note: "hotlink",
      download_status: "not_downloaded_pending_license",
      notes: "Official brochure URL registered; binary not mirrored this sprint.",
    });
    catalog.assets.push(rec);
    mediaLib.brochure = {
      official_url: broUrl,
      copyright_source: copyrightBase,
      downloaded_date: null,
      checksum_sha256: null,
      local_storage_path: null,
      rights_note: "hotlink",
      download_status: "not_downloaded_pending_license",
    };
  }

  m.media_library = mediaLib;
  writeFileSync(mp, JSON.stringify(m, null, 2) + "\n");
}

// livin brochure marked OFFICIAL in matrix but may be page-level — keep hotlink only

writeFileSync(join(LIB, "catalog.json"), JSON.stringify(catalog, null, 2) + "\n");

const summary = {
  verified_at: DOWNLOADED_AT,
  developer_logo_downloaded: logoSuccess.length,
  developer_logo_failed: logoFailures.length,
  brochure_downloaded: brochureOk.length,
  gallery_hotlinks: galleryHotlinks,
  floor_plan_hotlinks: floorHotlinks,
  hero_placeholder_pending: heroPlaceholders,
  total_assets: catalog.assets.length,
  logo_failures: logoFailures,
};

writeFileSync(
  join(ROOT, "pipelines/factory/media-library/sprint4_media_snapshot.json"),
  JSON.stringify(summary, null, 2) + "\n",
);

console.log(JSON.stringify(summary, null, 2));
