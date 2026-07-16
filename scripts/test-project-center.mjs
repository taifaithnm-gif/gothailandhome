#!/usr/bin/env node
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

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

check("project page is project-center", () => {
  const src = readFileSync(
    resolve(root, "src/app/[lang]/projects/[slug]/page.tsx"),
    "utf8",
  );
  assert.ok(src.includes('data-slot="project-center"'));
  assert.ok(src.includes("Breadcrumb"));
  for (const id of [
    "overview",
    "listings",
    "map",
    "facilities",
    "nearby",
    "developer",
    "verification",
    "related-projects",
    "find-my-home",
    "platform-support",
  ]) {
    assert.ok(src.includes(`id="${id}"`), id);
  }
  assert.ok(src.includes("EmptyState"));
  assert.ok(src.includes("relatedEmpty"));
});

check("dictionary centerEyebrow en/zh/th", () => {
  for (const locale of ["en", "zh", "th"]) {
    const dict = JSON.parse(
      readFileSync(resolve(root, `src/dictionaries/${locale}.json`), "utf8"),
    );
    assert.ok(dict.projectLanding.centerEyebrow);
    assert.ok(dict.projectLanding.relatedEmpty);
  }
});

check("project page exists", () => {
  assert.ok(
    existsSync(resolve(root, "src/app/[lang]/projects/[slug]/page.tsx")),
  );
});

if (process.exitCode) {
  console.log(JSON.stringify({ ok: false }));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true }));
