#!/usr/bin/env node
/**
 * Pagination / listing-query invariants (Alpha P0).
 */
import assert from "node:assert/strict";

const DEFAULT_LISTING_PAGE_SIZE = 24;
const MAX_PAGE_SIZE = 48;

function clampPageSize(raw) {
  return Math.min(Math.max(raw ?? DEFAULT_LISTING_PAGE_SIZE, 1), MAX_PAGE_SIZE);
}

function clampPage(raw) {
  const page = Number(raw || 1);
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

function range(page, pageSize) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  return { from, to };
}

function totalPages(total, pageSize) {
  return total === 0 ? 0 : Math.ceil(total / pageSize);
}

function buildHref(params, page) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  if (page > 1) search.set("page", String(page));
  const qs = search.toString();
  return `/en/properties${qs ? `?${qs}` : ""}`;
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

check("default page size is 24", () => {
  assert.equal(clampPageSize(undefined), 24);
});

check("page size capped at 48", () => {
  assert.equal(clampPageSize(999), 48);
});

check("invalid page falls back to 1", () => {
  assert.equal(clampPage("0"), 1);
  assert.equal(clampPage("-3"), 1);
  assert.equal(clampPage("abc"), 1);
  assert.equal(clampPage("2"), 2);
});

check("range for page 1", () => {
  assert.deepEqual(range(1, 24), { from: 0, to: 23 });
});

check("range for page 2", () => {
  assert.deepEqual(range(2, 24), { from: 24, to: 47 });
});

check("1315 rows => 55 pages at size 24", () => {
  assert.equal(totalPages(1315, 24), 55);
});

check("URL omits page=1", () => {
  assert.equal(buildHref({ sort: "newest" }, 1), "/en/properties?sort=newest");
});

check("URL includes page>1", () => {
  assert.equal(
    buildHref({ sort: "price_asc", q: "asoke" }, 3),
    "/en/properties?sort=price_asc&q=asoke&page=3",
  );
});

check("first page never serializes full catalog size", () => {
  const firstPageCount = clampPageSize(undefined);
  assert.ok(firstPageCount < 1315);
  assert.ok(firstPageCount <= 48);
});

if (process.exitCode) {
  console.log(JSON.stringify({ ok: false }));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true }));
