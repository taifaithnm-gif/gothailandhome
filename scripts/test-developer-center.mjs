#!/usr/bin/env node
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

const root = process.cwd();

function ok(msg) {
  console.log(`PASS: ${msg}`);
}
function check(name, fn) {
  try {
    fn();
    ok(name);
  } catch (error) {
    console.error(`FAIL: ${name} — ${error.message}`);
    process.exitCode = 1;
  }
}

check("developer center component + page exist", () => {
  assert.ok(
    existsSync(resolve(root, "src/components/developer/developer-center.tsx")),
  );
  assert.ok(
    existsSync(resolve(root, "src/app/[lang]/developers/[slug]/page.tsx")),
  );
});

check("required section ids present", () => {
  const src = readFileSync(
    resolve(root, "src/components/developer/developer-center.tsx"),
    "utf8",
  );
  for (const id of [
    "overview",
    "projects",
    "listings",
    "company",
    "official-website",
    "verification",
    "partnership",
    "related-developers",
    "platform-support",
  ]) {
    assert.ok(src.includes(`id="${id}"`), id);
  }
  assert.ok(src.includes("developer-logo-placeholder"));
  assert.ok(src.includes("hasVerifiedOfficialLogo"));
  assert.ok(src.includes("PlatformCustomerSuccess"));
});

check("all logo meta remain placeholder (no fake official logos)", () => {
  const dir = join(root, "public/developers");
  const metas = readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => join(dir, d.name, "logo.meta.json"))
    .filter((p) => existsSync(p));
  assert.ok(metas.length >= 20);
  for (const metaPath of metas) {
    const meta = JSON.parse(readFileSync(metaPath, "utf8"));
    assert.equal(
      String(meta.status).toLowerCase(),
      "placeholder",
      metaPath,
    );
  }
});

check("dictionary developer center keys en/zh/th", () => {
  for (const locale of ["en", "zh", "th"]) {
    const dict = JSON.parse(
      readFileSync(resolve(root, `src/dictionaries/${locale}.json`), "utf8"),
    );
    for (const key of [
      "centerEyebrow",
      "currentListings",
      "company",
      "officialWebsite",
      "verification",
      "relatedDevelopers",
      "contactPlatform",
      "logoMissing",
    ]) {
      assert.ok(dict.developers[key], `${locale}.${key}`);
    }
  }
});

if (process.exitCode) {
  console.log(JSON.stringify({ ok: false }));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true }));
