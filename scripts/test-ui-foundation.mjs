#!/usr/bin/env node
/**
 * Lightweight Alpha UI foundation checks (a11y landmarks + tokens present).
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function fail(msg) {
  console.error(`FAIL: ${msg}`);
  process.exitCode = 1;
}
function ok(msg) {
  console.log(`PASS: ${msg}`);
}

const root = process.cwd();
const required = [
  "src/styles/design-tokens.css",
  "src/components/ui/button.tsx",
  "src/components/ui/field.tsx",
  "src/components/ui/card.tsx",
  "src/components/ui/badge.tsx",
  "src/components/ui/states.tsx",
  "src/components/ui/breadcrumb.tsx",
  "src/components/marketplace/contact-blocks.tsx",
  "src/components/marketplace/form-kit.tsx",
];

for (const file of required) {
  if (!existsSync(resolve(root, file))) fail(`missing ${file}`);
  else ok(`exists ${file}`);
}

const tokens = readFileSync(resolve(root, "src/styles/design-tokens.css"), "utf8");
for (const key of [
  "--success",
  "--warning",
  "--danger",
  "--evidence-official",
  "--text-h1",
  "--container",
  "--section-y",
]) {
  if (!tokens.includes(key)) fail(`token missing ${key}`);
  else ok(`token ${key}`);
}

const button = readFileSync(resolve(root, "src/components/ui/button.tsx"), "utf8");
for (const variant of ["primary", "secondary", "ghost", "danger"]) {
  if (!button.includes(`${variant}:`)) fail(`button variant missing ${variant}`);
  else ok(`button ${variant}`);
}

const header = readFileSync(
  resolve(root, "src/components/layout/site-header.tsx"),
  "utf8",
);
if (!header.includes('aria-label="Primary"')) fail("header primary nav landmark");
else ok("header primary nav landmark");
if (!header.includes("mobile-nav")) fail("mobile nav id missing");
else ok("mobile nav present");

const footer = readFileSync(
  resolve(root, "src/components/layout/site-footer.tsx"),
  "utf8",
);
if (!footer.includes("<footer")) fail("footer element missing");
else ok("footer element present");

const breadcrumb = readFileSync(
  resolve(root, "src/components/ui/breadcrumb.tsx"),
  "utf8",
);
if (!breadcrumb.includes('aria-label="Breadcrumb"')) fail("breadcrumb a11y");
else ok("breadcrumb a11y");

const blocks = readFileSync(
  resolve(root, "src/components/marketplace/contact-blocks.tsx"),
  "utf8",
);
const listingFn = blocks.slice(
  blocks.indexOf("export function ListingContact"),
  blocks.indexOf("export function PlatformCustomerSuccess"),
);
if (listingFn.includes("getPlatformCustomerSuccessContacts")) {
  fail("ListingContact must not pull platform CS");
} else {
  ok("contact separation ListingContact vs Platform CS");
}

if (process.exitCode) {
  console.log(JSON.stringify({ ok: false }));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true }));
