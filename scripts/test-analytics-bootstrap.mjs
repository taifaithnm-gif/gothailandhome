#!/usr/bin/env node
/**
 * P1-31 — Consent-aware frontend analytics bootstrap.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();

function read(rel) {
  return readFileSync(resolve(root, rel), "utf8");
}

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

check("analytics-bootstrap:modules and UI exist", () => {
  for (const file of [
    "src/lib/analytics/adapter.ts",
    "src/lib/analytics/consent.ts",
    "src/lib/analytics/types.ts",
    "src/components/analytics/analytics-provider.tsx",
    "src/components/analytics/consent-banner.tsx",
    "src/components/analytics/page-view-tracker.tsx",
  ]) {
    assert.ok(existsSync(resolve(root, file)), file);
  }
});

check("analytics-bootstrap:no network script before consent", () => {
  const adapter = read("src/lib/analytics/adapter.ts");
  assert.ok(adapter.includes("isAnalyticsConsentGranted()"), "consent gate");
  assert.ok(adapter.includes("googletagmanager.com/gtag/js"), "ga loader path");
  assert.ok(
    adapter.indexOf("if (!isAnalyticsConsentGranted()) return") <
      adapter.indexOf("loadGa4Script"),
    "consent before script load",
  );
  const placeholders = read("src/components/ads/ads-tracking-placeholders.tsx");
  assert.ok(!placeholders.includes("dangerouslySetInnerHTML"), "no inline gtag bootstrap");
  assert.ok(placeholders.includes("consent-gated"), "placeholders inert");
});

check("analytics-bootstrap:missing IDs inert + fake adapter", () => {
  const adapter = read("src/lib/analytics/adapter.ts");
  assert.ok(adapter.includes('return "fake"'), "fake adapter");
  assert.ok(adapter.includes("fakeAnalyticsSink"), "fake sink");
  assert.ok(adapter.includes("PLACEHOLDER"), "placeholder ID rejected");
});

check("analytics-bootstrap:layout wires provider banner pageview", () => {
  const layout = read("src/app/[lang]/layout.tsx");
  assert.ok(layout.includes("AnalyticsProvider"));
  assert.ok(layout.includes("AnalyticsConsentBanner"));
  assert.ok(layout.includes("AnalyticsPageView"));
});

check("analytics-bootstrap:env example documents GA id", () => {
  const env = read(".env.example");
  assert.ok(env.includes("NEXT_PUBLIC_GA_MEASUREMENT_ID"));
});

check("analytics-bootstrap:dictionary consent copy en zh th", () => {
  for (const locale of ["en", "zh", "th"]) {
    const dict = JSON.parse(read(`src/dictionaries/${locale}.json`));
    assert.ok(dict.analytics.consentTitle, `${locale}.consentTitle`);
    assert.ok(dict.analytics.grant, `${locale}.grant`);
    assert.ok(dict.analytics.deny, `${locale}.deny`);
  }
});

check("analytics-bootstrap:provider failure isolated", () => {
  const adapter = read("src/lib/analytics/adapter.ts");
  assert.ok(adapter.includes("catch"), "swallows provider errors");
});

if (process.exitCode) {
  console.log(JSON.stringify({ ok: false }));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true }));
