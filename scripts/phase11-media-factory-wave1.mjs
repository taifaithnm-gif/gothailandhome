#!/usr/bin/env node
/**
 * Phase 11 Media Factory Wave 1
 *
 * Priority: developer logos → project heroes → galleries → brochures → floor plans
 * Policy: official assets only. No portal watermarks. No screenshots. No fabrication.
 * Binaries mirrored with checksum + license note. Skip unavailable with reasons.
 */
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { join, resolve, extname } from "node:path";

const ROOT = resolve(process.cwd());
const VERIFIED_AT = "2026-07-16";
const PHASE = "11-media-factory-wave1";
const LIB = join(ROOT, "content/media/library");
const PUBLIC_DEV = join(ROOT, "public/developers");
const PUBLIC_PROJ = join(ROOT, "public/projects");
const MAX_GALLERY_IMAGES = 8;

function sha256(buf) {
  return createHash("sha256").update(buf).digest("hex");
}

function extFrom(url, contentType) {
  const u = String(url).split("?")[0].toLowerCase();
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
    signal: AbortSignal.timeout(45000),
    headers: {
      "User-Agent": "GoThailandHomeMediaFactory/1.0 (+official-cache)",
      Accept: "*/*",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (!buf.length) throw new Error("empty body");
  const ct = res.headers.get("content-type") || "";
  // Reject HTML error pages mistaken for assets
  if (ct.includes("text/html") && !url.includes(".html")) {
    throw new Error(`unexpected HTML content-type for asset (${ct})`);
  }
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
    license_note: partial.license_note,
    download_status: partial.download_status,
    verified_at: VERIFIED_AT,
    phase: PHASE,
    notes: partial.notes ?? null,
    ...(partial.gallery_image_urls
      ? { gallery_image_urls: partial.gallery_image_urls }
      : {}),
    ...(partial.mirrored_files ? { mirrored_files: partial.mirrored_files } : {}),
  };
}

const report = {
  phase: PHASE,
  verified_at: VERIFIED_AT,
  logos: { upgraded: [], retained: [], failed: [], skipped: [] },
  heroes: { downloaded: [], skipped: [] },
  galleries: { downloaded: [], partial: [], skipped: [] },
  brochures: { downloaded: [], failed: [], skipped: [] },
  floor_plans: { downloaded: [], skipped: [] },
};

/** Better-than-favicon official identity assets confirmed Wave 1. */
const LOGO_UPGRADES = {
  "ap-thailand": {
    url: "https://www.apthai.com/images/production/AP_Logo.png",
    note: "Upgraded from favicon.ico to official AP_Logo.png on apthai.com",
  },
  "lpn-development": {
    url: "https://www.lpn.co.th/images/layout/logo-2.svg",
    note: "Upgraded from favicon.ico to official layout logo SVG",
  },
  "noble-development": {
    url: "https://www.noblehome.com/images/logo.svg",
    note: "Upgraded from favicon.ico to official Noble logo SVG",
  },
  supalai: {
    url: "https://www.supalai.com/apple-touch-icon.png",
    note: "Upgraded from favicon.ico to official apple-touch-icon (best obtainable brand mark; full vector logo not published at probed paths)",
  },
};

const WEAK_RETAIN = {
  "ananda-development":
    "Incapsula/SPA blocks logo discovery; retain mirrored favicon.ico as best obtainable official identity asset",
  "major-development":
    "major.co.th returns empty shells for logo paths; retain mirrored favicon.ico",
};

async function mirrorDeveloperLogo(slug, url, copyright, note) {
  const outDir = join(LIB, "developers", slug);
  mkdirSync(outDir, { recursive: true });
  mkdirSync(join(PUBLIC_DEV, slug), { recursive: true });
  const { buf, contentType, finalUrl } = await download(url);
  const ext = extFrom(finalUrl || url, contentType);
  const filename = `logo${ext}`;
  const relLib = `content/media/library/developers/${slug}/${filename}`;
  writeFileSync(join(ROOT, relLib), buf);
  const checksum = sha256(buf);
  const pubName = `official-logo${ext}`;
  const relPub = `public/developers/${slug}/${pubName}`;
  writeFileSync(join(ROOT, relPub), buf);
  const rec = assetRecord({
    id: `developer:${slug}:logo`,
    class: "developer_logo",
    entity_type: "developer",
    entity_slug: slug,
    role: "logo",
    official_url: finalUrl || url,
    copyright_source: copyright,
    downloaded_date: VERIFIED_AT,
    checksum_sha256: checksum,
    local_storage_path: relLib,
    rights_note: "mirrored_to_storage",
    license_note:
      "Official website identity asset mirrored for catalog use. Trademark remains with rights holder.",
    download_status: "downloaded",
    notes: `${note || ""} Public delivery: /developers/${slug}/${pubName}`.trim(),
  });
  writeFileSync(join(outDir, "logo.asset.json"), JSON.stringify(rec, null, 2) + "\n");

  const metaPath = join(PUBLIC_DEV, slug, "logo.meta.json");
  const meta = existsSync(metaPath)
    ? JSON.parse(readFileSync(metaPath, "utf8"))
    : { slug };
  meta.status = "official_cached";
  meta.official_logo_url = finalUrl || url;
  meta.cached_local_path = `/${relPub.replace(/^public\//, "")}`;
  meta.library_path = relLib;
  meta.checksum_sha256 = checksum;
  meta.downloaded_date = VERIFIED_AT;
  meta.copyright_source = copyright;
  meta.license_note = rec.license_note;
  meta.phase = PHASE;
  writeFileSync(metaPath, JSON.stringify(meta, null, 2) + "\n");

  const manPath = join(ROOT, "content/developers", slug, "manifest.json");
  if (existsSync(manPath)) {
    const m = JSON.parse(readFileSync(manPath, "utf8"));
    m.logo_url = `/${relPub.replace(/^public\//, "")}`;
    m.logo_source = {
      ...(m.logo_source || {}),
      status: "official",
      official_logo_url: finalUrl || url,
      cached_path: m.logo_url,
      checksum_sha256: checksum,
      downloaded_date: VERIFIED_AT,
    };
    if (m.field_evidence?.official_logo) {
      m.field_evidence.official_logo.value = finalUrl || url;
      m.field_evidence.official_logo.verified_at = VERIFIED_AT;
    }
    writeFileSync(manPath, JSON.stringify(m, null, 2) + "\n");
  }
  return rec;
}

// —— 1) Developer logos ——
console.log("=== 1) Developer logos ===");
const developerSlugs = readdirSync(join(ROOT, "content/developers")).filter(
  (d) => existsSync(join(ROOT, "content/developers", d, "manifest.json")),
);

for (const slug of developerSlugs) {
  const manifest = JSON.parse(
    readFileSync(join(ROOT, "content/developers", slug, "manifest.json"), "utf8"),
  );
  const copyright = `© ${manifest.name?.en || slug} — official website identity asset`;
  if (LOGO_UPGRADES[slug]) {
    try {
      await mirrorDeveloperLogo(
        slug,
        LOGO_UPGRADES[slug].url,
        copyright,
        LOGO_UPGRADES[slug].note,
      );
      report.logos.upgraded.push({ slug, url: LOGO_UPGRADES[slug].url });
      console.log("UPGRADE", slug);
    } catch (err) {
      report.logos.failed.push({
        slug,
        url: LOGO_UPGRADES[slug].url,
        reason: String(err.message || err),
      });
      console.log("FAIL upgrade", slug, err.message);
    }
    continue;
  }
  const logoAsset = join(LIB, "developers", slug, "logo.asset.json");
  if (existsSync(logoAsset)) {
    const a = JSON.parse(readFileSync(logoAsset, "utf8"));
    const ok =
      a.download_status === "downloaded" &&
      a.local_storage_path &&
      existsSync(join(ROOT, a.local_storage_path));
    report.logos.retained.push({
      slug,
      url: a.official_url,
      checksum_sha256: a.checksum_sha256,
      note: WEAK_RETAIN[slug] || "Already mirrored official identity asset",
      weak_favicon: Boolean(WEAK_RETAIN[slug]),
      ok,
    });
    // Ensure license_note present
    if (!a.license_note) {
      a.license_note =
        "Official website identity asset mirrored for catalog use. Trademark remains with rights holder.";
      a.phase = PHASE;
      a.verified_at = VERIFIED_AT;
      writeFileSync(logoAsset, JSON.stringify(a, null, 2) + "\n");
    }
  } else {
    report.logos.skipped.push({ slug, reason: "No logo.asset.json" });
  }
}

// —— 2–5) Project media from existing asset sidecars + manifests ——
console.log("=== 2–5) Project media ===");

function gatherProjects() {
  return readdirSync(join(ROOT, "content/projects")).filter((d) =>
    existsSync(join(ROOT, "content/projects", d, "manifest.json")),
  );
}

function loadAsset(slug, role) {
  const p = join(LIB, "projects", slug, `${role}.asset.json`);
  if (!existsSync(p)) return null;
  return { path: p, data: JSON.parse(readFileSync(p, "utf8")) };
}

function isDirectMediaUrl(url) {
  if (!url) return false;
  if (/\.(jpg|jpeg|png|webp|svg|gif|pdf)(\?|$)/i.test(url)) return true;
  // Official CDNs sometimes omit extensions (e.g. MQDC corecms asset IDs)
  if (/corecms\.mqdc\.com\/assets\//i.test(url)) return true;
  if (/cdn\.assetwise\.co\.th\/wp-content\/uploads\//i.test(url)) return true;
  if (/\/wp-content\/uploads\//i.test(url) && !/\.html?(\?|$)/i.test(url))
    return true;
  return false;
}

function isPdfUrl(url) {
  return Boolean(url && /\.pdf(\?|$)/i.test(url));
}

async function mirrorFile(url, absPath) {
  const { buf, contentType, finalUrl } = await download(url);
  mkdirSync(join(absPath, ".."), { recursive: true });
  writeFileSync(absPath, buf);
  return { buf, contentType, finalUrl, checksum: sha256(buf) };
}

const projects = gatherProjects();

// Brochures (PDF only)
for (const slug of projects) {
  const man = JSON.parse(
    readFileSync(join(ROOT, "content/projects", slug, "manifest.json"), "utf8"),
  );
  const existing = loadAsset(slug, "brochure");
  const url =
    (existing?.data?.official_url && isPdfUrl(existing.data.official_url)
      ? existing.data.official_url
      : null) ||
    (man.media_library?.brochure?.official_url &&
    isPdfUrl(man.media_library.brochure.official_url)
      ? man.media_library.brochure.official_url
      : null) ||
    (typeof man.project?.official_brochure === "string" &&
    isPdfUrl(man.project.official_brochure)
      ? man.project.official_brochure
      : null);

  if (!url) {
    if (existing?.data?.official_url && !isPdfUrl(existing.data.official_url)) {
      report.brochures.skipped.push({
        slug,
        reason: "Official brochure control/page only — no direct PDF URL",
        url: existing.data.official_url,
      });
    } else {
      report.brochures.skipped.push({
        slug,
        reason: "No official brochure PDF URL registered",
      });
    }
    continue;
  }

  const rel = `content/media/library/projects/${slug}/brochure.pdf`;
  if (existsSync(join(ROOT, rel)) && existing?.data?.download_status === "downloaded") {
    report.brochures.downloaded.push({
      slug,
      url,
      checksum_sha256: existing.data.checksum_sha256,
      already: true,
    });
    continue;
  }

  try {
    const abs = join(ROOT, rel);
    const { checksum, finalUrl } = await mirrorFile(url, abs);
    mkdirSync(join(PUBLIC_PROJ, slug), { recursive: true });
    writeFileSync(join(PUBLIC_PROJ, slug, "brochure.pdf"), readFileSync(abs));
    const copyright =
      existing?.data?.copyright_source ||
      `© ${man.developer?.name?.en || man.developer?.slug || "developer"} / ${slug} — official brochure PDF`;
    const rec = assetRecord({
      id: `project:${slug}:brochure`,
      class: "brochure",
      entity_type: "project",
      entity_slug: slug,
      role: "brochure",
      official_url: finalUrl || url,
      copyright_source: copyright,
      downloaded_date: VERIFIED_AT,
      checksum_sha256: checksum,
      local_storage_path: rel,
      rights_note: "mirrored_to_storage",
      license_note:
        "Official marketing PDF mirrored for catalog. Redistribution/commercial use subject to rights holder terms.",
      download_status: "downloaded",
      notes: `Public path /projects/${slug}/brochure.pdf`,
    });
    mkdirSync(join(LIB, "projects", slug), { recursive: true });
    writeFileSync(
      join(LIB, "projects", slug, "brochure.asset.json"),
      JSON.stringify(rec, null, 2) + "\n",
    );
    man.media_library = {
      ...(man.media_library || {}),
      brochure: {
        ...(man.media_library?.brochure || {}),
        ...rec,
      },
    };
    man.project = man.project || {};
    man.project.official_brochure = finalUrl || url;
    man.project.brochure_local_path = `/projects/${slug}/brochure.pdf`;
    writeFileSync(
      join(ROOT, "content/projects", slug, "manifest.json"),
      JSON.stringify(man, null, 2) + "\n",
    );
    report.brochures.downloaded.push({ slug, url: finalUrl || url, checksum_sha256: checksum });
    console.log("BROCHURE", slug);
  } catch (err) {
    report.brochures.failed.push({
      slug,
      url,
      reason: String(err.message || err),
    });
    console.log("FAIL brochure", slug, err.message);
  }
}

// Galleries + heroes from gallery_image_urls
for (const slug of projects) {
  const man = JSON.parse(
    readFileSync(join(ROOT, "content/projects", slug, "manifest.json"), "utf8"),
  );
  const galAsset = loadAsset(slug, "gallery");
  const urls = [
    ...(galAsset?.data?.gallery_image_urls || []),
    ...(man.media_library?.gallery?.gallery_image_urls || []),
  ].filter((u, i, arr) => u && isDirectMediaUrl(u) && arr.indexOf(u) === i);

  if (!urls.length) {
    report.galleries.skipped.push({
      slug,
      reason: galAsset?.data?.official_url
        ? "Official gallery page registered but no direct image URLs"
        : "No official gallery image URLs",
      page: galAsset?.data?.official_url || null,
    });
    // Hero skip if not direct
    const heroAsset = loadAsset(slug, "hero");
    if (heroAsset && !isDirectMediaUrl(heroAsset.data.official_url)) {
      report.heroes.skipped.push({
        slug,
        reason: "Hero points at page/homepage — no direct official image URL",
        url: heroAsset.data.official_url,
      });
    }
    continue;
  }

  const outDir = join(LIB, "projects", slug, "files");
  mkdirSync(outDir, { recursive: true });
  mkdirSync(join(PUBLIC_PROJ, slug), { recursive: true });
  const copyright =
    galAsset?.data?.copyright_source ||
    `© ${man.developer?.name?.en || man.developer?.slug || "developer"} / ${slug} — official project media`;

  const mirrored = [];
  const take = urls.slice(0, MAX_GALLERY_IMAGES);
  for (let i = 0; i < take.length; i++) {
    const url = take[i];
    try {
      const { buf, contentType, finalUrl, checksum } = await (async () => {
        const r = await download(url);
        return { ...r, checksum: sha256(r.buf) };
      })();
      const ext = extFrom(finalUrl || url, contentType);
      const fname = `gallery-${String(i + 1).padStart(2, "0")}${ext}`;
      const rel = `content/media/library/projects/${slug}/files/${fname}`;
      writeFileSync(join(ROOT, rel), buf);
      writeFileSync(join(PUBLIC_PROJ, slug, fname), buf);
      mirrored.push({
        index: i + 1,
        official_url: finalUrl || url,
        local_storage_path: rel,
        public_path: `/projects/${slug}/${fname}`,
        checksum_sha256: checksum,
      });
    } catch (err) {
      mirrored.push({
        index: i + 1,
        official_url: url,
        error: String(err.message || err),
      });
    }
  }

  const okFiles = mirrored.filter((m) => m.checksum_sha256);
  const rec = assetRecord({
    id: `project:${slug}:gallery`,
    class: "gallery",
    entity_type: "project",
    entity_slug: slug,
    role: "gallery",
    official_url: galAsset?.data?.official_url || urls[0],
    copyright_source: copyright,
    downloaded_date: okFiles.length ? VERIFIED_AT : null,
    checksum_sha256: okFiles[0]?.checksum_sha256 || null,
    local_storage_path: okFiles[0]?.local_storage_path || null,
    rights_note: "mirrored_subset_pending_commercial_license",
    license_note:
      "Official CDN/marketing images archived for checksum catalog (subset). Commercial reuse requires rights-holder license. Not portal/watermark sources.",
    download_status: okFiles.length
      ? okFiles.length < urls.length
        ? "partial_downloaded_pending_license"
        : "downloaded_pending_license"
      : "download_failed",
    gallery_image_urls: urls,
    mirrored_files: mirrored,
    notes: `Mirrored ${okFiles.length}/${urls.length} official gallery URLs (cap ${MAX_GALLERY_IMAGES}).`,
  });
  mkdirSync(join(LIB, "projects", slug), { recursive: true });
  writeFileSync(
    join(LIB, "projects", slug, "gallery.asset.json"),
    JSON.stringify(rec, null, 2) + "\n",
  );

  if (okFiles.length) {
    report.galleries.downloaded.push({
      slug,
      mirrored: okFiles.length,
      available: urls.length,
    });
  } else {
    report.galleries.skipped.push({
      slug,
      reason: "All gallery image downloads failed",
    });
  }

  // Hero = first successful gallery image
  if (okFiles[0]) {
    const heroSrc = okFiles[0];
    const heroExt = extname(heroSrc.local_storage_path);
    const heroRel = `content/media/library/projects/${slug}/hero${heroExt}`;
    writeFileSync(join(ROOT, heroRel), readFileSync(join(ROOT, heroSrc.local_storage_path)));
    writeFileSync(
      join(PUBLIC_PROJ, slug, `hero${heroExt}`),
      readFileSync(join(ROOT, heroSrc.local_storage_path)),
    );
    const heroRec = assetRecord({
      id: `project:${slug}:hero`,
      class: "hero",
      entity_type: "project",
      entity_slug: slug,
      role: "hero",
      official_url: heroSrc.official_url,
      copyright_source: copyright,
      downloaded_date: VERIFIED_AT,
      checksum_sha256: heroSrc.checksum_sha256,
      local_storage_path: heroRel,
      rights_note: "mirrored_from_official_gallery_pending_commercial_license",
      license_note:
        "Hero derived from first official gallery image. Commercial reuse requires rights-holder license.",
      download_status: "downloaded_pending_license",
      notes: "Selected from official gallery_image_urls[0] successful mirror",
    });
    writeFileSync(
      join(LIB, "projects", slug, "hero.asset.json"),
      JSON.stringify(heroRec, null, 2) + "\n",
    );
    report.heroes.downloaded.push({
      slug,
      url: heroSrc.official_url,
      checksum_sha256: heroSrc.checksum_sha256,
    });
    console.log("GALLERY+HERO", slug, okFiles.length);
  }

  man.media_library = {
    ...(man.media_library || {}),
    gallery: { ...(man.media_library?.gallery || {}), ...rec },
    ...(okFiles[0]
      ? {
          hero: JSON.parse(
            readFileSync(join(LIB, "projects", slug, "hero.asset.json"), "utf8"),
          ),
        }
      : {}),
  };
  writeFileSync(
    join(ROOT, "content/projects", slug, "manifest.json"),
    JSON.stringify(man, null, 2) + "\n",
  );
}

// Floor plans — only direct media URLs
for (const slug of projects) {
  const fp = loadAsset(slug, "floor_plans");
  if (!fp) {
    report.floor_plans.skipped.push({
      slug,
      reason: "No floor_plans.asset.json",
    });
    continue;
  }
  const urls = [
    ...(fp.data.floor_plan_urls || []),
    ...(fp.data.gallery_image_urls || []),
  ].filter((u) => isDirectMediaUrl(u));
  if (!urls.length) {
    report.floor_plans.skipped.push({
      slug,
      reason: "Floor-plan section/page only — no direct official image/PDF URLs",
      page: fp.data.official_url || null,
    });
    // stamp license note on existing record
    fp.data.license_note =
      fp.data.license_note ||
      "Official floor-plan section hotlinked; binary mirror skipped pending direct asset URL + license.";
    fp.data.phase = PHASE;
    fp.data.verified_at = VERIFIED_AT;
    writeFileSync(fp.path, JSON.stringify(fp.data, null, 2) + "\n");
    continue;
  }

  const outDir = join(LIB, "projects", slug, "files");
  mkdirSync(outDir, { recursive: true });
  const mirrored = [];
  for (let i = 0; i < Math.min(urls.length, MAX_GALLERY_IMAGES); i++) {
    try {
      const { buf, contentType, finalUrl } = await download(urls[i]);
      const checksum = sha256(buf);
      const ext = extFrom(finalUrl || urls[i], contentType);
      const fname = `floor-plan-${String(i + 1).padStart(2, "0")}${ext}`;
      const rel = `content/media/library/projects/${slug}/files/${fname}`;
      writeFileSync(join(ROOT, rel), buf);
      mirrored.push({
        official_url: finalUrl || urls[i],
        local_storage_path: rel,
        checksum_sha256: checksum,
      });
    } catch (err) {
      mirrored.push({ official_url: urls[i], error: String(err.message || err) });
    }
  }
  const ok = mirrored.filter((m) => m.checksum_sha256);
  const rec = assetRecord({
    ...fp.data,
    downloaded_date: ok[0] ? VERIFIED_AT : null,
    checksum_sha256: ok[0]?.checksum_sha256 || null,
    local_storage_path: ok[0]?.local_storage_path || null,
    rights_note: "mirrored_subset_pending_commercial_license",
    license_note:
      "Official floor-plan assets archived for checksum catalog. Commercial reuse requires license.",
    download_status: ok.length
      ? "downloaded_pending_license"
      : "download_failed",
    mirrored_files: mirrored,
    verified_at: VERIFIED_AT,
    phase: PHASE,
  });
  writeFileSync(fp.path, JSON.stringify(rec, null, 2) + "\n");
  if (ok.length) {
    report.floor_plans.downloaded.push({ slug, mirrored: ok.length });
  } else {
    report.floor_plans.skipped.push({
      slug,
      reason: "Floor-plan URL downloads failed",
    });
  }
}

// Mark remaining heroes without direct media as skipped if not already
for (const slug of projects) {
  if (report.heroes.downloaded.some((h) => h.slug === slug)) continue;
  if (report.heroes.skipped.some((h) => h.slug === slug)) continue;
  const hero = loadAsset(slug, "hero");
  if (!hero) {
    report.heroes.skipped.push({ slug, reason: "No hero.asset.json" });
  } else if (!isDirectMediaUrl(hero.data.official_url)) {
    report.heroes.skipped.push({
      slug,
      reason: "No direct official hero image URL (page/hotlink only)",
      url: hero.data.official_url,
    });
    hero.data.license_note =
      hero.data.license_note ||
      "Hero remains hotlink/placeholder pending licensed official hero binary.";
    hero.data.phase = PHASE;
    hero.data.verified_at = VERIFIED_AT;
    writeFileSync(hero.path, JSON.stringify(hero.data, null, 2) + "\n");
  }
}

const summary = {
  phase: PHASE,
  verified_at: VERIFIED_AT,
  counts: {
    logos_upgraded: report.logos.upgraded.length,
    logos_retained: report.logos.retained.length,
    logos_failed: report.logos.failed.length,
    heroes_downloaded: report.heroes.downloaded.length,
    heroes_skipped: report.heroes.skipped.length,
    galleries_downloaded: report.galleries.downloaded.length,
    galleries_skipped: report.galleries.skipped.length,
    brochures_downloaded: report.brochures.downloaded.length,
    brochures_failed: report.brochures.failed.length,
    brochures_skipped: report.brochures.skipped.length,
    floor_plans_downloaded: report.floor_plans.downloaded.length,
    floor_plans_skipped: report.floor_plans.skipped.length,
  },
  report,
};

mkdirSync(join(ROOT, "pipelines/factory/media-library"), { recursive: true });
writeFileSync(
  join(ROOT, "pipelines/factory/media-library/wave1_media_factory_snapshot.json"),
  JSON.stringify(summary, null, 2) + "\n",
);

// Refresh catalog.json lightly
const catalog = {
  generated_at: new Date().toISOString(),
  phase: PHASE,
  policy: {
    logos: "mirror_official_site_identity_assets",
    brochures: "mirror_official_marketing_pdfs",
    galleries_heroes_floorplans:
      "mirror_direct_official_cdn_urls_with_pending_commercial_license_checksum_archive",
    forbidden: ["portal_screenshots", "portal_watermarked_images", "fabricated_assets"],
  },
  counts: summary.counts,
};
writeFileSync(
  join(LIB, "catalog.json"),
  JSON.stringify(catalog, null, 2) + "\n",
);

console.log("\n=== SUMMARY ===");
console.log(JSON.stringify(summary.counts, null, 2));
