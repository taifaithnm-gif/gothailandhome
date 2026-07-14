#!/usr/bin/env node
import fs from "fs";
import path from "path";

function check(m) {
  const gaps = [];
  const p = m.project || {};
  if (!(p.official_website || m.developer?.website)) gaps.push("official_website");
  if (!(p.facebook_url || m.developer?.facebook_url)) gaps.push("facebook");
  if (!p.google_maps_url && (p.latitude == null || p.longitude == null))
    gaps.push("google_maps/coords");
  if (!m.developer?.slug) gaps.push("developer");
  if (!(p.construction_status || p.status)) gaps.push("construction_status");
  if (!(p.completion_year || p.year_completed)) gaps.push("completion_year");
  if (!(Array.isArray(p.facilities) && p.facilities.length)) gaps.push("facilities");
  if (!(p.transit_tags?.length || p.nearby_transit?.length || p.transportation))
    gaps.push("transit");
  if (!(Array.isArray(p.nearby_schools) && p.nearby_schools.length))
    gaps.push("schools");
  if (!(Array.isArray(p.nearby_hospitals) && p.nearby_hospitals.length))
    gaps.push("hospitals");
  if (!((p.nearby_shopping || p.nearby_malls || []).length)) gaps.push("shopping");
  if (!(p.name?.en && p.name?.zh && p.name?.th)) gaps.push("name_i18n");
  if (!(m.seo?.title?.en || p.seo?.title?.en)) gaps.push("seo");
  if (!((m.faq || p.faq || []).length)) gaps.push("faq");
  return gaps;
}

const rows = [];
for (const d of fs.readdirSync("content/projects")) {
  const f = path.join("content/projects", d, "manifest.json");
  if (!fs.existsSync(f)) continue;
  const m = JSON.parse(fs.readFileSync(f, "utf8"));
  const gaps = check(m);
  rows.push({
    slug: m.slug || d,
    district: m.location?.district_slug,
    gaps,
    gapCount: gaps.length,
  });
}
console.log("complete", rows.filter((r) => r.gapCount === 0).length, "/", rows.length);
const freq = {};
for (const r of rows) for (const g of r.gaps) freq[g] = (freq[g] || 0) + 1;
console.log("gapFreq", freq);
const priority = new Set([
  "watthana",
  "huai-khwang",
  "din-daeng",
  "bang-kapi",
  "khlong-toei",
  "phaya-thai",
  "ratchathewi",
  "phra-khanong",
  "suan-luang",
  "bang-na",
  "sathon",
  "bang-rak",
  "pathum-wan",
  "chatuchak",
  "lat-phrao",
]);
console.log("--- priority gaps ---");
for (const r of rows.filter((r) => priority.has(r.district))) {
  if (r.gapCount) console.log(r.slug, r.district, r.gaps.join(","));
}
console.log("--- complete priority ---");
for (const r of rows.filter((r) => priority.has(r.district) && r.gapCount === 0)) {
  console.log(r.slug, r.district);
}
