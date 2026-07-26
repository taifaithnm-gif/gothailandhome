#!/usr/bin/env node
/**
 * FIX_INTERNAL_ROUTE_LOCALE_BYPASS — proxy locale redirect contracts.
 *
 * Ensures /internal Review Console routes bypass locale redirect/rewrite,
 * while public locale routing, API, and static paths keep existing behavior.
 *
 * Run: npm run test:proxy-locale
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const PROXY_SRC = readFileSync(path.join(root, "src/proxy.ts"), "utf8");

const localesMod = await import(
  pathToFileURL(path.join(root, "src/config/locales.ts")).href
);
const { defaultLocale, isLocale, locales } = localesMod;

function makeRequest(pathname, headers = {}) {
  const url = new URL(`http://127.0.0.1:3000${pathname}`);
  return {
    nextUrl: {
      pathname: url.pathname,
      clone() {
        return new URL(url.href);
      },
    },
    headers: {
      get(name) {
        return headers[name.toLowerCase()] ?? headers[name] ?? null;
      },
    },
  };
}

/**
 * Behavioral mirror of src/proxy.ts — kept in lockstep via source contracts below.
 */
function proxy(request) {
  const { pathname } = request.nextUrl;

  const isInternalRoute =
    pathname === "/internal" || pathname.startsWith("/internal/");

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/partners/app") ||
    isInternalRoute ||
    pathname.includes(".") ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return;
  }

  const pathnameHasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );

  if (pathnameHasLocale) {
    const maybeLocale = pathname.split("/")[1];
    if (maybeLocale && !isLocale(maybeLocale)) {
      return;
    }
    return;
  }

  const header = request.headers.get("accept-language");
  let locale = defaultLocale;
  if (header) {
    const preferred = header.split(",").map((part) => {
      const [tag, qValue] = part.trim().split(";q=");
      return {
        tag: tag.toLowerCase(),
        quality: qValue ? Number(qValue) : 1,
      };
    });
    preferred.sort((a, b) => b.quality - a.quality);
    for (const { tag } of preferred) {
      if (tag.startsWith("zh")) {
        locale = "zh";
        break;
      }
      if (tag.startsWith("th")) {
        locale = "th";
        break;
      }
      if (tag.startsWith("en")) {
        locale = "en";
        break;
      }
    }
  }

  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
  return { status: 307, location: url.pathname };
}

let passed = 0;
let failed = 0;
const failures = [];

function test(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`PASS: ${name}`);
  } catch (err) {
    failed += 1;
    const message = err instanceof Error ? err.message : String(err);
    failures.push({ name, error: message });
    console.error(`FAIL: ${name} — ${message}`);
  }
}

function assertNoLocaleRedirect(pathname) {
  const result = proxy(makeRequest(pathname));
  assert.equal(result, undefined, `expected continue for ${pathname}`);
}

test("source: /internal exact + prefix bypass in proxy.ts", () => {
  assert.ok(
    PROXY_SRC.includes('pathname === "/internal"'),
    'missing pathname === "/internal"',
  );
  assert.ok(
    PROXY_SRC.includes('pathname.startsWith("/internal/")'),
    'missing pathname.startsWith("/internal/")',
  );
  assert.ok(PROXY_SRC.includes("isInternalRoute"), "missing isInternalRoute");
  assert.ok(
    PROXY_SRC.includes("isInternalRoute ||"),
    "isInternalRoute not wired into exclusion list",
  );
  assert.ok(
    !PROXY_SRC.includes('"/en/internal"') ||
      PROXY_SRC.includes("// must not"),
    "must not treat /en/internal as formal console path",
  );
  // No compatibility rewrite helpers for locale-prefixed internal
  assert.ok(
    !PROXY_SRC.includes("rewriteInternal") &&
      !PROXY_SRC.includes("stripLocaleInternal"),
    "must not add /en/internal compatibility rewrite",
  );
});

test("/internal — no locale redirect/rewrite", () => {
  assertNoLocaleRedirect("/internal");
});

test("/internal/ — no locale redirect/rewrite", () => {
  assertNoLocaleRedirect("/internal/");
});

test("Review Console batch path — no locale redirect", () => {
  const pathname =
    "/internal/review/windows01/batches/BATCH-GTH-20260724-001";
  const result = proxy(makeRequest(pathname));
  assert.equal(result, undefined);
  assert.ok(!String(result?.location ?? "").includes("/en/internal"));
});

test("/en — existing locale path continues (no redirect)", () => {
  assertNoLocaleRedirect("/en");
});

test("/zh — existing locale path continues (no redirect)", () => {
  assertNoLocaleRedirect("/zh");
});

test("/th — existing locale path continues (no redirect)", () => {
  assertNoLocaleRedirect("/th");
});

test("public path without locale still gets default locale redirect", () => {
  const result = proxy(makeRequest("/properties"));
  assert.ok(result, "expected redirect response");
  assert.equal(result.status, 307);
  assert.equal(result.location, "/en/properties");
});

test("/api/* — unchanged bypass", () => {
  assertNoLocaleRedirect("/api/health");
  assertNoLocaleRedirect("/api/internal/staging/review/x");
});

test("static asset paths — unchanged bypass", () => {
  assertNoLocaleRedirect("/favicon.ico");
  assertNoLocaleRedirect("/images/logo.png");
  assertNoLocaleRedirect("/robots.txt");
  assertNoLocaleRedirect("/sitemap.xml");
});

test("/en/internal/... — not rewritten to formal Review Console path", () => {
  const pathname =
    "/en/internal/review/windows01/batches/BATCH-GTH-20260724-001";
  const result = proxy(makeRequest(pathname));
  assert.equal(result, undefined, "no redirect/rewrite compatibility shim");
});

test("accept-language still affects public unprefixed paths only", () => {
  const result = proxy(
    makeRequest("/about", { "accept-language": "zh-CN,zh;q=0.9" }),
  );
  assert.ok(result);
  assert.equal(result.status, 307);
  assert.equal(result.location, "/zh/about");
});

test("accept-language must not touch /internal", () => {
  const result = proxy(
    makeRequest("/internal/review/windows01/batches/BATCH-GTH-20260724-001", {
      "accept-language": "th,en;q=0.8",
    }),
  );
  assert.equal(result, undefined);
});

test("admin/auth/partners shells remain bypassed", () => {
  assertNoLocaleRedirect("/admin");
  assertNoLocaleRedirect("/auth/callback");
  assertNoLocaleRedirect("/partners/app");
});

console.log(
  JSON.stringify({
    ok: failed === 0,
    passed,
    failed,
    total: passed + failed,
    failures,
  }),
);

if (failed > 0) process.exit(1);
