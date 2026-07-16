#!/usr/bin/env node
/**
 * Marketplace form validation + shared kit presence checks.
 * Run: node scripts/test-marketplace-form-validation.mjs
 */
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

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

const mod = await import(
  pathToFileURL(resolve(root, "src/lib/marketplace/form-validation.ts")).href
);

const {
  validateContactBasics,
  validateDeveloperPartnership,
  validateAgencyPartnership,
  validateListPropertyExtras,
  generateLeadReference,
  isValidEmail,
} = mod;

check("contact basics require name + channel", () => {
  assert.equal(
    validateContactBasics({
      name: "",
      phone: "",
      email: "",
      consent: true,
    }).ok,
    false,
  );
  assert.equal(
    validateContactBasics({
      name: "Ada",
      phone: "+66",
      email: "",
      consent: true,
    }).ok,
    true,
  );
});

check("consent required", () => {
  const r = validateContactBasics({
    name: "Ada",
    phone: "1",
    email: "",
    consent: false,
  });
  assert.equal(r.ok, false);
  assert.equal(r.code, "consent_required");
});

check("invalid email rejected", () => {
  assert.equal(isValidEmail("not-an-email"), false);
  const r = validateContactBasics({
    name: "Ada",
    phone: "",
    email: "bad",
    consent: true,
  });
  assert.equal(r.ok, false);
  assert.equal(r.code, "invalid_email");
});

check("developer partnership requires company + rep + channel", () => {
  const r = validateDeveloperPartnership({
    company: "Co",
    representative: "Rep",
    phone: "",
    email: "",
    consent: true,
  });
  assert.equal(r.ok, false);
  assert.equal(r.code, "company_contact_required");
});

check("agency partnership requires agency + rep + channel", () => {
  const r = validateAgencyPartnership({
    agencyName: "Agency",
    representative: "Rep",
    phone: "1",
    email: "",
    consent: true,
  });
  assert.equal(r.ok, true);
});

check("list property extras", () => {
  assert.equal(
    validateListPropertyExtras({
      project: "",
      price: "1",
      authorization: true,
    }).code,
    "project_required",
  );
  assert.equal(
    validateListPropertyExtras({
      project: "P",
      price: "1",
      authorization: false,
    }).code,
    "authorization_required",
  );
});

check("reference generator format", () => {
  const ref = generateLeadReference("FMH");
  assert.match(ref, /^GTH-FMH-/);
});

check("form kit exists", () => {
  assert.ok(existsSync(resolve(root, "src/components/marketplace/form-kit.tsx")));
});

check("five entry forms use form-kit", () => {
  const files = [
    "src/components/marketplace/find-my-home-form.tsx",
    "src/components/marketplace/list-your-property-form.tsx",
    "src/components/marketplace/developer-partnership-form.tsx",
    "src/components/marketplace/agency-partnership-form.tsx",
    "src/components/property/viewing-request-form.tsx",
  ];
  for (const file of files) {
    const src = readFileSync(resolve(root, file), "utf8");
    assert.ok(src.includes("form-kit"), `${file} must import form-kit`);
    assert.ok(src.includes("FormSuccessState"), `${file} success state`);
    assert.ok(src.includes("FormFailureBanner"), `${file} failure state`);
    assert.ok(src.includes("FormSubmitButton"), `${file} loading/submit`);
  }
});

check("dictionary error keys en/zh/th", () => {
  for (const locale of ["en", "zh", "th"]) {
    const dict = JSON.parse(
      readFileSync(resolve(root, `src/dictionaries/${locale}.json`), "utf8"),
    );
    for (const key of [
      "name_and_contact_required",
      "consent_required",
      "authorization_required",
      "invalid_email",
    ]) {
      assert.ok(dict.marketplace.errors[key], `${locale} missing ${key}`);
    }
  }
});

check("Apple not in marketplace form components", () => {
  const files = [
    "src/components/marketplace/find-my-home-form.tsx",
    "src/components/marketplace/list-your-property-form.tsx",
    "src/components/marketplace/developer-partnership-form.tsx",
    "src/components/marketplace/agency-partnership-form.tsx",
    "src/components/property/viewing-request-form.tsx",
    "src/components/marketplace/form-kit.tsx",
  ];
  for (const file of files) {
    const src = readFileSync(resolve(root, file), "utf8");
    assert.ok(!/\bApple\b/.test(src), `${file} must not mention Apple`);
  }
});

if (process.exitCode) {
  console.log(JSON.stringify({ ok: false }));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true }));
