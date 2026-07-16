#!/usr/bin/env node
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
function ok(m) {
  console.log(`PASS: ${m}`);
}
function check(name, fn) {
  try {
    fn();
    ok(name);
  } catch (e) {
    console.error(`FAIL: ${name} — ${e.message}`);
    process.exitCode = 1;
  }
}

check("buy/rent pages exist", () => {
  assert.ok(existsSync(resolve(root, "src/app/[lang]/buy/page.tsx")));
  assert.ok(existsSync(resolve(root, "src/app/[lang]/rent/page.tsx")));
});

check("header surfaces buy/rent", () => {
  const src = readFileSync(
    resolve(root, "src/components/layout/site-header.tsx"),
    "utf8",
  );
  assert.ok(src.includes('/buy"') || src.includes("/buy"));
  assert.ok(src.includes("/rent"));
});

check("dictionary keys", () => {
  for (const locale of ["en", "zh", "th"]) {
    const dict = JSON.parse(
      readFileSync(resolve(root, `src/dictionaries/${locale}.json`), "utf8"),
    );
    assert.ok(dict.nav.buy);
    assert.ok(dict.nav.rent);
    assert.ok(dict.buyRent.buyTitle);
    assert.ok(dict.meta.buyTitle);
  }
});

if (process.exitCode) {
  console.log(JSON.stringify({ ok: false }));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true }));
