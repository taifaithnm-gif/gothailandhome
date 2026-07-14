#!/usr/bin/env node
/**
 * Investigate Wave1 empty projects (no listings.json / empty harvest).
 * Light PropertyHub probes only — does NOT harvest listings into packages.
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = join(ROOT, "pipelines/factory/wave1-hardening");
mkdirSync(OUT, { recursive: true });

const UA =
  "Mozilla/5.0 (compatible; GoThailandHomeFactory/1.0; +https://gothailandhome.com)";

const PH_SLUG_OVERRIDE = {
  "xt-huai-khwang": "xt-huaikwang",
  "condo-u-sukhumvit-62-1": "condo-u-sukhumvit-62",
  "origin-plug-play-sukhumvit-101": "origin-plug-play-project-sukhumvit-101",
  "knightbridge-collage-ramkhamhaeng": "knightbridge-collage-ramkhamhaeng",
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function probe(url) {
  try {
    const res = await fetch(url, {
      headers: { "user-agent": UA, accept: "text/html" },
      redirect: "follow",
    });
    const text = res.ok ? await res.text() : "";
    const hasNext = text.includes('id="__NEXT_DATA__"');
    let nextData = null;
    if (hasNext) {
      const m = text.match(
        /<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s,
      );
      if (m) {
        try {
          nextData = JSON.parse(m[1]);
        } catch {
          nextData = null;
        }
      }
    }
    const hrefs = new Set();
    const re = /href="(\/en\/listings\/[^"#?\s]+)"/g;
    let hm;
    while ((hm = re.exec(text))) hrefs.add(hm[1]);
    const pageProps = nextData?.props?.pageProps || {};
    return {
      ok: res.ok,
      status: res.status,
      finalUrl: res.url,
      has_next_data: hasNext,
      listing_href_count: hrefs.size,
      next_keys: Object.keys(pageProps).slice(0, 20),
      project_name:
        pageProps?.project?.name ||
        pageProps?.projectInfo?.name ||
        pageProps?.project?.projectInfo?.name ||
        null,
    };
  } catch (err) {
    return { ok: false, status: 0, error: String(err.message || err) };
  }
}

function classify(probeResult, packageName) {
  if (probeResult.error) return "blocked_or_network_error";
  if (probeResult.status === 404) return "project_removed_or_wrong_url";
  if (probeResult.status === 403 || probeResult.status === 429)
    return "blocked_page";
  if (!probeResult.ok) return `http_${probeResult.status}`;
  if (!probeResult.has_next_data) return "source_page_changed_or_parser_failure";
  if (probeResult.listing_href_count === 0) {
    if (
      probeResult.project_name &&
      packageName &&
      !String(probeResult.project_name)
        .toLowerCase()
        .includes(String(packageName).toLowerCase().slice(0, 8))
    ) {
      return "project_name_mismatch_or_wrong_slug";
    }
    return "true_no_active_listing_or_empty_sale_rent_tabs";
  }
  return "parser_or_pagination_failure_listings_present_but_prior_harvest_empty";
}

const empty = [];
for (const d of readdirSync(join(ROOT, "content/projects")).sort()) {
  const mf = join(ROOT, "content/projects", d, "manifest.json");
  if (!existsSync(mf)) continue;
  const lf = join(ROOT, "content/projects", d, "listings.json");
  let n = 0;
  if (existsSync(lf)) {
    n = (JSON.parse(readFileSync(lf, "utf8")).listings || []).length;
  }
  if (n > 0) continue;
  const m = JSON.parse(readFileSync(mf, "utf8"));
  empty.push({ slug: d, manifest: m });
}

const results = [];
for (const { slug, manifest } of empty) {
  const phSlug = PH_SLUG_OVERRIDE[slug] || slug;
  const primary = `https://propertyhub.in.th/en/condo/${phSlug}`;
  const sale = `${primary}/sale`;
  const rent = `${primary}/for-rent`;
  process.stderr.write(`Probe ${slug}...\n`);
  const primaryProbe = await probe(primary);
  await sleep(400);
  const saleProbe = await probe(sale);
  await sleep(400);
  const rentProbe = await probe(rent);
  await sleep(400);

  const best =
    [saleProbe, rentProbe, primaryProbe].sort(
      (a, b) => (b.listing_href_count || 0) - (a.listing_href_count || 0),
    )[0] || primaryProbe;

  const classification = classify(best, manifest.project?.name?.en);

  results.push({
    slug,
    name_en: manifest.project?.name?.en || null,
    district: manifest.location?.district_slug || null,
    developer: manifest.developer?.slug || null,
    official_website: manifest.project?.official_website || null,
    ph_slug_used: phSlug,
    ph_slug_override: Boolean(PH_SLUG_OVERRIDE[slug]),
    urls: { primary, sale, rent },
    probes: { primary: primaryProbe, sale: saleProbe, rent: rentProbe },
    classification,
    evidence: {
      max_listing_hrefs: best.listing_href_count,
      http_status_primary: primaryProbe.status,
      has_next_data: best.has_next_data,
      next_project_name: best.project_name,
    },
  });
}

const summary = {
  generated_at: new Date().toISOString(),
  empty_count: results.length,
  by_classification: {},
  results,
};
for (const r of results) {
  summary.by_classification[r.classification] =
    (summary.by_classification[r.classification] || 0) + 1;
}

writeFileSync(
  join(OUT, "empty-projects-investigation.json"),
  JSON.stringify(summary, null, 2),
);
console.log(
  JSON.stringify(
    {
      empty_count: summary.empty_count,
      by_classification: summary.by_classification,
      out: join(OUT, "empty-projects-investigation.json"),
    },
    null,
    2,
  ),
);
