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

check("lead foundation modules exist", () => {
  for (const file of [
    "src/lib/leads/channels.ts",
    "src/lib/leads/urls.ts",
    "src/lib/leads/index.ts",
    "src/components/leads/lead-result.tsx",
    "src/app/[lang]/leads/success/page.tsx",
    "src/app/[lang]/leads/error/page.tsx",
  ]) {
    assert.ok(existsSync(resolve(root, file)), file);
  }
});

check("five channels defined", () => {
  const src = readFileSync(resolve(root, "src/lib/leads/channels.ts"), "utf8");
  for (const channel of [
    "find_my_home",
    "list_your_property",
    "viewing_request",
    "developer_partnership",
    "agency_partnership",
  ]) {
    assert.ok(src.includes(`"${channel}"`), channel);
  }
  assert.ok(!src.includes("platform_support"), "PCS is not an entry channel");
});

check("success/error pages are noindex", () => {
  for (const file of [
    "src/app/[lang]/leads/success/page.tsx",
    "src/app/[lang]/leads/error/page.tsx",
  ]) {
    const src = readFileSync(resolve(root, file), "utf8");
    assert.ok(src.includes("index: false"), file);
  }
});

check("dictionary leads keys", () => {
  for (const locale of ["en", "zh", "th"]) {
    const dict = JSON.parse(
      readFileSync(resolve(root, `src/dictionaries/${locale}.json`), "utf8"),
    );
    assert.ok(dict.leads.successTitle);
    assert.ok(dict.leads.errorTitle);
    assert.ok(dict.meta.leadSuccessTitle);
  }
});

check("no CRM/email automation claims in lead layer", () => {
  const result = readFileSync(
    resolve(root, "src/components/leads/lead-result.tsx"),
    "utf8",
  );
  assert.ok(result.includes("LeadSuccessPanel"));
  assert.ok(result.includes("LeadErrorPanel"));
  const actions = readFileSync(
    resolve(root, "src/app/[lang]/marketplace/actions.ts"),
    "utf8",
  );
  assert.ok(/No email|no CRM|placeholder/i.test(actions));
});

if (process.exitCode) {
  console.log(JSON.stringify({ ok: false }));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true }));
