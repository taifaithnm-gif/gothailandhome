#!/usr/bin/env node
/**
 * Developer Factory V1 — generate enriched developer packages.
 * Usage: node pipelines/factory/generate-developers-v1.mjs
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  readdirSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { DEVELOPERS_V1 } from "./lib/developers-v1.mjs";

const ROOT = resolve(process.cwd());
const COLLECTED = "2026-07-14";

function loadProjectCityMap() {
  const map = new Map();
  const dir = join(ROOT, "content/projects");
  if (!existsSync(dir)) return map;
  for (const slug of readdirSync(dir)) {
    const manifestPath = join(dir, slug, "manifest.json");
    if (!existsSync(manifestPath)) continue;
    try {
      const m = JSON.parse(readFileSync(manifestPath, "utf8"));
      map.set(slug, {
        city: m.location?.city_slug || null,
        district: m.location?.district_slug || null,
        name: m.project?.name || null,
        developer: m.developer?.slug || null,
      });
    } catch {
      // skip
    }
  }
  return map;
}

function projectsForDeveloper(devSlug, projectMap) {
  const bangkok = [];
  const pattaya = [];
  const phuket = [];
  for (const [slug, meta] of projectMap.entries()) {
    if (meta.developer !== devSlug) continue;
    const entry = {
      slug,
      name: meta.name,
      source: "content/projects factory package",
    };
    if (meta.city === "bangkok") bangkok.push(entry);
    else if (meta.city === "pattaya") pattaya.push(entry);
    else if (meta.city === "phuket") phuket.push(entry);
  }
  return { bangkok, pattaya, phuket };
}

function logoSvg(slug, nameEn) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" role="img" aria-label="${nameEn} logo placeholder">
  <rect width="512" height="512" fill="#0f3d38"/>
  <text x="256" y="240" text-anchor="middle" fill="#f4f7f6" font-family="Arial, Helvetica, sans-serif" font-size="28">${escapeXml(nameEn)}</text>
  <text x="256" y="290" text-anchor="middle" fill="#9cbcb5" font-family="Arial, Helvetica, sans-serif" font-size="16">Official logo pending rights-cleared export</text>
  <text x="256" y="330" text-anchor="middle" fill="#9cbcb5" font-family="Arial, Helvetica, sans-serif" font-size="14">${escapeXml(slug)}</text>
</svg>
`;
}

function escapeXml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function buildManifest(dev, projects) {
  const verification_status =
    dev.listed || (dev.sources || []).some((s) => s.type === "official_developer")
      ? "platform_verified"
      : "unverified";

  return {
    slug: dev.slug,
    collected_at: COLLECTED,
    publish_ready: true,
    verification_status,
    sources: dev.sources,
    name: dev.name,
    legal_name: dev.legal_name,
    description: dev.profile,
    company_profile: dev.profile,
    established_year: dev.established_year,
    headquarters: dev.headquarters,
    listed_company: dev.listed,
    major_brands: dev.major_brands,
    major_projects: {
      bangkok: projects.bangkok,
      pattaya: projects.pattaya,
      phuket: projects.phuket,
    },
    website: dev.website,
    facebook_url: dev.facebook_url,
    google_maps_url: null,
    social_links: dev.social,
    contact: dev.contact,
    logo_path: `/developers/${dev.slug}/logo.svg`,
    logo_url: `/developers/${dev.slug}/logo.svg`,
    phone: dev.contact?.phone ?? null,
    email: dev.contact?.email ?? null,
    seo: {
      title: {
        en: `${dev.name.en} Developer | GoThailandHome`,
        zh: `${dev.name.zh}开发商 | GoThailandHome`,
        th: `ผู้พัฒนา ${dev.name.th} | GoThailandHome`,
      },
      description: {
        en: `Official profile for ${dev.name.en}${dev.listed ? ` (SET:${dev.listed.ticker})` : ""}. Sourced from the developer website${dev.listed ? " and SET factsheet" : ""}.`,
        zh: `${dev.name.zh}开发商资料${dev.listed ? `（SET:${dev.listed.ticker}）` : ""}，来源为官方网站${dev.listed ? "与 SET" : ""}。`,
        th: `โปรไฟล์ผู้พัฒนา ${dev.name.th}${dev.listed ? ` (SET:${dev.listed.ticker})` : ""} อ้างอิงเว็บไซต์ทางการ${dev.listed ? " และ SET" : ""}`,
      },
    },
    locale_status: { en: "complete", zh: "complete", th: "complete" },
    project_slugs: [
      ...projects.bangkok.map((p) => p.slug),
      ...projects.pattaya.map((p) => p.slug),
      ...projects.phuket.map((p) => p.slug),
    ],
  };
}

function buildProfileMarkdown(manifest) {
  const L = manifest.listed_company;
  const lines = [
    `# ${manifest.name.en}`,
    ``,
    `- **Slug:** \`${manifest.slug}\``,
    `- **Chinese name:** ${manifest.name.zh}`,
    `- **Thai name:** ${manifest.name.th}`,
    `- **Legal name (EN):** ${manifest.legal_name.en}`,
    `- **Verification:** ${manifest.verification_status}`,
    `- **Website:** ${manifest.website}`,
    `- **Established year:** ${manifest.established_year ?? "not asserted (pending sourced establish date)"}`,
    `- **Headquarters:** ${manifest.headquarters.en}`,
    `- **Listed company:** ${L ? `${L.exchange}:${L.ticker}` : "not asserted"}`,
    L?.profile_url ? `- **SET profile:** ${L.profile_url}` : null,
    `- **Logo:** ${manifest.logo_path}`,
    ``,
    `## Company profile`,
    ``,
    manifest.company_profile.en,
    ``,
    `## Major brands`,
    ``,
    ...(manifest.major_brands.length
      ? manifest.major_brands.map((b) => `- ${b.name} — ${b.source_url}`)
      : ["- None listed in this package"]),
    ``,
    `## Major Bangkok projects (factory inventory)`,
    ``,
    ...(manifest.major_projects.bangkok.length
      ? manifest.major_projects.bangkok.map(
          (p) => `- [${p.slug}](../../projects/${p.slug}/) — ${p.name?.en || p.slug}`,
        )
      : ["- None in current factory inventory"]),
    ``,
    `## Major Pattaya projects (factory inventory)`,
    ``,
    ...(manifest.major_projects.pattaya.length
      ? manifest.major_projects.pattaya.map((p) => `- ${p.slug}`)
      : ["- None in current factory inventory"]),
    ``,
    `## Major Phuket projects (factory inventory)`,
    ``,
    ...(manifest.major_projects.phuket.length
      ? manifest.major_projects.phuket.map((p) => `- ${p.slug}`)
      : ["- None in current factory inventory"]),
    ``,
    `## Social links`,
    ``,
    ...Object.entries(manifest.social_links || {}).map(
      ([k, v]) => `- **${k}:** ${v}`,
    ),
    ``,
    `## Contact`,
    ``,
    `- Phone: ${manifest.contact?.phone ?? "null"}`,
    `- Email: ${manifest.contact?.email ?? "null"}`,
    `- LINE: ${manifest.contact?.line ?? "null"}`,
    `- WhatsApp: ${manifest.contact?.whatsapp ?? "null"}`,
    ``,
    `## SEO`,
    ``,
    `- Title (EN): ${manifest.seo.title.en}`,
    `- Description (EN): ${manifest.seo.description.en}`,
    ``,
    `## Sources`,
    ``,
    ...manifest.sources.map((s) => `- ${s.name}: ${s.url}`),
    ``,
  ].filter((x) => x !== null);
  return lines.join("\n");
}

function buildReadme(manifest) {
  return `# Developer package: ${manifest.slug}

## Compliance metadata

| Field | Value |
| --- | --- |
| slug | \`${manifest.slug}\` |
| verification_status | \`${manifest.verification_status}\` |
| publish_ready | \`${manifest.publish_ready}\` |
| collected_at | \`${manifest.collected_at}\` |
| logo | \`${manifest.logo_path}\` |

## Files

| File | Purpose |
| --- | --- |
| \`manifest.json\` | Structured DATA_STANDARD developer package |
| \`profile.md\` | Human-readable developer knowledge base |
| \`README.md\` | This compliance sheet |

## Rules

- Official sources only (see \`manifest.json\` → \`sources\`)
- No fabricated years, tickers, phones, or project cities
- Pattaya/Phuket project lists reflect **factory inventory only**, not a claim of full market portfolio
- Logo SVG under \`public/developers/${manifest.slug}/\` is a **placeholder** until a rights-cleared official logo export is mirrored; see \`logo.meta.json\`

## SEO fields

Present in \`manifest.json\` → \`seo.title\` / \`seo.description\` (en/zh/th).
`;
}

function main() {
  if (DEVELOPERS_V1.length !== 20) {
    console.error(`Expected 20 developers, got ${DEVELOPERS_V1.length}`);
    process.exit(1);
  }

  const projectMap = loadProjectCityMap();
  const index = [];

  for (const dev of DEVELOPERS_V1) {
    const projects = projectsForDeveloper(dev.slug, projectMap);
    const manifest = buildManifest(dev, projects);

    const contentDir = join(ROOT, "content/developers", dev.slug);
    mkdirSync(contentDir, { recursive: true });
    writeFileSync(
      join(contentDir, "manifest.json"),
      JSON.stringify(manifest, null, 2) + "\n",
    );
    writeFileSync(join(contentDir, "profile.md"), buildProfileMarkdown(manifest));
    writeFileSync(join(contentDir, "README.md"), buildReadme(manifest));

    const mediaDir = join(ROOT, "public/developers", dev.slug);
    mkdirSync(mediaDir, { recursive: true });
    writeFileSync(join(mediaDir, "logo.svg"), logoSvg(dev.slug, dev.name.en));
    writeFileSync(
      join(mediaDir, "logo.meta.json"),
      JSON.stringify(
        {
          slug: dev.slug,
          status: "placeholder",
          note: "Placeholder SVG only. Replace with rights-cleared official logo export. Do not treat this glyph as the registered trademark.",
          official_website: dev.website,
          public_path: `/developers/${dev.slug}/logo.svg`,
          collected_at: COLLECTED,
        },
        null,
        2,
      ) + "\n",
    );

    index.push({
      slug: manifest.slug,
      name: manifest.name,
      legal_name: manifest.legal_name,
      website: manifest.website,
      established_year: manifest.established_year,
      headquarters: manifest.headquarters,
      listed_company: manifest.listed_company,
      verification_status: manifest.verification_status,
      logo_path: manifest.logo_path,
      project_counts: {
        bangkok: projects.bangkok.length,
        pattaya: projects.pattaya.length,
        phuket: projects.phuket.length,
      },
      content_path: `content/developers/${dev.slug}/`,
    });
  }

  index.sort((a, b) => a.slug.localeCompare(b.slug));

  const indexPath = join(ROOT, "content/developers/DEVELOPER_INDEX.json");
  writeFileSync(
    indexPath,
    JSON.stringify(
      {
        version: "1.0",
        generated_at: COLLECTED,
        count: index.length,
        developers: index,
      },
      null,
      2,
    ) + "\n",
  );

  const dirMd = [
    `# Developer Directory V1`,
    ``,
    `Generated ${COLLECTED}. Official sources only. Count: **${index.length}**.`,
    ``,
    `| Slug | English | Chinese | Thai | SET | Verification | Bangkok projects |`,
    `| --- | --- | --- | --- | --- | --- | ---: |`,
    ...index.map((d) => {
      const set = d.listed_company
        ? `${d.listed_company.exchange}:${d.listed_company.ticker}`
        : "—";
      return `| [${d.slug}](./${d.slug}/) | ${d.name.en} | ${d.name.zh} | ${d.name.th} | ${set} | ${d.verification_status} | ${d.project_counts.bangkok} |`;
    }),
    ``,
    `## Notes`,
    ``,
    `- Structured JSON: \`content/developers/<slug>/manifest.json\``,
    `- Markdown profile: \`content/developers/<slug>/profile.md\``,
    `- Package README: \`content/developers/<slug>/README.md\``,
    `- Logos: \`public/developers/<slug>/logo.svg\` (placeholder until cleared export)`,
    `- Machine index: \`content/developers/DEVELOPER_INDEX.json\``,
    ``,
  ].join("\n");

  writeFileSync(join(ROOT, "content/developers/DEVELOPER_DIRECTORY.md"), dirMd);

  // Update content/developers/README.md
  writeFileSync(
    join(ROOT, "content/developers/README.md"),
    `# Developers

Developer Factory V1 knowledge base packages.

## Layout

\`\`\`text
content/developers/
  DEVELOPER_INDEX.json
  DEVELOPER_DIRECTORY.md
  <slug>/
    README.md          # compliance metadata
    manifest.json      # structured package
    profile.md         # markdown knowledge base
public/developers/<slug>/
  logo.svg
  logo.meta.json
\`\`\`

## Validation

\`\`\`bash
npm run factory:validate -- --developers
\`\`\`

## Rules

- Official website and/or SET factsheet sources required
- No fabricated establish years, tickers, contacts, or market portfolios
- Project city buckets use **imported factory packages only**
`,
  );

  console.log(
    JSON.stringify(
      {
        developers: index.length,
        index: "content/developers/DEVELOPER_INDEX.json",
        directory: "content/developers/DEVELOPER_DIRECTORY.md",
      },
      null,
      2,
    ),
  );
}

main();
