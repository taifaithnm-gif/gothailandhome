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

check("knowledge routes exist", () => {
  for (const file of [
    "src/app/[lang]/knowledge/page.tsx",
    "src/app/[lang]/knowledge/glossary/page.tsx",
    "src/app/[lang]/knowledge/bangkok-districts/page.tsx",
    "src/lib/knowledge/glossary.ts",
  ]) {
    assert.ok(existsSync(resolve(root, file)), file);
  }
});

check("glossary terms.json has controlled sections", () => {
  const terms = JSON.parse(
    readFileSync(resolve(root, "content/glossary/terms.json"), "utf8"),
  );
  for (const key of [
    "transit_tags",
    "facilities",
    "schools",
    "hospitals",
    "shopping",
    "property_types",
  ]) {
    assert.ok(Array.isArray(terms[key]) && terms[key].length > 0, key);
    for (const term of terms[key]) {
      assert.ok(term.code);
      assert.ok(term.name?.en || term.name?.th || term.name?.zh);
    }
  }
});

check("bangkok district glossary has 50 rows", () => {
  const data = JSON.parse(
    readFileSync(
      resolve(root, "content/glossary/districts-bangkok.json"),
      "utf8",
    ),
  );
  assert.equal(data.districts.length, 50);
});

check("dictionary knowledge keys", () => {
  for (const locale of ["en", "zh", "th"]) {
    const dict = JSON.parse(
      readFileSync(resolve(root, `src/dictionaries/${locale}.json`), "utf8"),
    );
    assert.ok(dict.knowledge.title);
    assert.ok(dict.nav.knowledge);
    assert.ok(dict.meta.knowledgeTitle);
  }
});

check("sitemap includes knowledge + marketplace paths", () => {
  const src = readFileSync(resolve(root, "src/app/sitemap.ts"), "utf8");
  assert.ok(src.includes("/knowledge"));
  assert.ok(src.includes("/knowledge/glossary"));
  assert.ok(src.includes("/marketplace"));
});

check("hub does not invent yields", () => {
  const hub = readFileSync(
    resolve(root, "src/app/[lang]/knowledge/page.tsx"),
    "utf8",
  );
  assert.ok(hub.includes("k.notice") || hub.includes("notice"));
  const en = JSON.parse(
    readFileSync(resolve(root, "src/dictionaries/en.json"), "utf8"),
  );
  assert.ok(/No invented|no invented/i.test(en.knowledge.notice));
});

if (process.exitCode) {
  console.log(JSON.stringify({ ok: false }));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true }));
