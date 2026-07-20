#!/usr/bin/env node
/**
 * P1-19 — Contact form reliability and failure paths.
 *
 * Deterministic offline checks: validation success/failure/consent/email,
 * duplicate-submit guard, pending state, storage-unavailable → placeholder
 * messaging, and no CRM/email claim or production write. No live network.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  generateLeadReference,
  isValidEmail,
  validateAgencyPartnership,
  validateContactBasics,
  validateDeveloperPartnership,
  validateListPropertyExtras,
  validateSupportMessage,
} from "../src/lib/marketplace/form-validation.ts";

const root = process.cwd();

function read(rel) {
  return readFileSync(resolve(root, rel), "utf8");
}

function ok(message) {
  console.log(`PASS: ${message}`);
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

const ENTRY_FORMS = [
  "src/components/marketplace/find-my-home-form.tsx",
  "src/components/marketplace/list-your-property-form.tsx",
  "src/components/marketplace/developer-partnership-form.tsx",
  "src/components/marketplace/agency-partnership-form.tsx",
  "src/components/property/viewing-request-form.tsx",
];

check("reliability:deterministic success and failure validation", () => {
  assert.equal(
    validateContactBasics({
      name: "Ada",
      phone: "+66900000000",
      email: "",
      consent: true,
    }).ok,
    true,
  );
  const missing = validateContactBasics({
    name: "",
    phone: "",
    email: "",
    consent: true,
  });
  assert.equal(missing.ok, false);
  assert.equal(missing.code, "name_and_contact_required");

  const support = validateSupportMessage({
    name: "Ada",
    email: "ada@example.com",
    message: "Help",
    consent: true,
  });
  assert.equal(support.ok, true);
  assert.equal(
    validateSupportMessage({
      name: "Ada",
      email: "ada@example.com",
      message: "",
      consent: true,
    }).code,
    "message_required",
  );
});

check("reliability:consent is required across channels", () => {
  for (const result of [
    validateContactBasics({
      name: "Ada",
      phone: "1",
      email: "",
      consent: false,
    }),
    validateDeveloperPartnership({
      company: "Co",
      representative: "Rep",
      phone: "1",
      email: "",
      consent: false,
    }),
    validateAgencyPartnership({
      agencyName: "Agency",
      representative: "Rep",
      phone: "1",
      email: "",
      consent: false,
    }),
    validateSupportMessage({
      name: "Ada",
      email: "ada@example.com",
      message: "Hi",
      consent: false,
    }),
  ]) {
    assert.equal(result.ok, false);
    assert.equal(result.code, "consent_required");
  }
});

check("reliability:invalid email rejected deterministically", () => {
  assert.equal(isValidEmail("not-an-email"), false);
  assert.equal(isValidEmail("ada@example.com"), true);
  assert.equal(
    validateContactBasics({
      name: "Ada",
      phone: "",
      email: "bad",
      consent: true,
    }).code,
    "invalid_email",
  );
});

check("reliability:list-property requires authorization + fields", () => {
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
      price: "",
      authorization: true,
    }).code,
    "price_required",
  );
  assert.equal(
    validateListPropertyExtras({
      project: "P",
      price: "1",
      authorization: false,
    }).code,
    "authorization_required",
  );
  assert.equal(
    validateListPropertyExtras({
      project: "P",
      price: "1",
      authorization: true,
    }).ok,
    true,
  );
});

check("reliability:lead reference format is stable", () => {
  const ref = generateLeadReference("FMH");
  assert.match(ref, /^GTH-FMH-[0-9A-Z]+$/);
});

check("reliability:submit control guards duplicate submissions", () => {
  const kit = read("src/components/marketplace/form-kit.tsx");
  assert.ok(kit.includes("disabled={pending}"), "submit disabled while pending");
  assert.ok(kit.includes("aria-busy={pending}"), "aria-busy pending state");
  assert.ok(
    kit.includes("if (pending) event.preventDefault()"),
    "duplicate submit guard",
  );
  assert.ok(
    kit.includes('role="status"') && kit.includes('aria-live="polite"'),
    "pending status is announced",
  );
});

check("reliability:entry forms use shared failure + pending controls", () => {
  for (const file of ENTRY_FORMS) {
    const src = read(file);
    assert.ok(src.includes("form-kit"), `${file} imports form-kit`);
    assert.ok(src.includes("FormFailureBanner"), `${file} failure state`);
    assert.ok(src.includes("FormSubmitButton"), `${file} pending/submit`);
    assert.ok(src.includes("useActionState"), `${file} single action state`);
    assert.ok(
      !src.includes("FormSuccessState"),
      `${file} success routes to shared lead page`,
    );
  }
});

check("reliability:storage-unavailable fails closed to placeholder", () => {
  const leads = read("src/lib/marketplace/leads.ts");
  assert.ok(
    leads.includes("if (!hasSupabaseEnv())"),
    "no storage → fail closed",
  );
  assert.ok(leads.includes("if (!input.consent)"), "server re-checks consent");

  const actions = read("src/app/[lang]/marketplace/actions.ts");
  assert.ok(
    actions.includes('result.ok ? "stored" : "placeholder"'),
    "failed storage becomes placeholder, never a false stored claim",
  );
  assert.ok(actions.includes("buildLeadSuccessPath"), "routes to shared result");
});

check("reliability:placeholder/storage messaging is accurate", () => {
  const result = read("src/components/leads/lead-result.tsx");
  assert.ok(
    result.includes('mode === "stored" ? leads.modeStored : leads.modePlaceholder'),
    "success panel shows mode-accurate note",
  );
  for (const locale of ["en", "zh", "th"]) {
    const dict = JSON.parse(read(`src/dictionaries/${locale}.json`));
    assert.ok(dict.leads.modeStored, `${locale}.leads.modeStored`);
    assert.ok(dict.leads.modePlaceholder, `${locale}.leads.modePlaceholder`);
    assert.ok(
      dict.marketplace.errors.storage_unavailable,
      `${locale}.marketplace.errors.storage_unavailable`,
    );
  }
});

check("reliability:no CRM/email claim or production write", () => {
  const actions = read("src/app/[lang]/marketplace/actions.ts");
  assert.ok(/No email|no CRM|placeholder/i.test(actions), "actions disclaim CRM");
  const leads = read("src/lib/marketplace/leads.ts");
  assert.ok(
    !/nodemailer|sendgrid|resend|sendMail|smtp/i.test(leads),
    "no email transport in lead layer",
  );
  for (const locale of ["en", "zh", "th"]) {
    const dict = JSON.parse(read(`src/dictionaries/${locale}.json`));
    assert.ok(
      /no email|not an automated|邮件|CRM|อีเมล/i.test(
        dict.marketplace.nextSteps,
      ),
      `${locale} next-steps disclaims automated email/CRM`,
    );
  }
});

check("reliability:required files exist", () => {
  for (const file of [
    ...ENTRY_FORMS,
    "src/components/marketplace/form-kit.tsx",
    "src/lib/marketplace/form-validation.ts",
    "src/lib/marketplace/leads.ts",
    "src/app/[lang]/marketplace/actions.ts",
    "src/app/[lang]/leads/success/page.tsx",
    "src/app/[lang]/leads/error/page.tsx",
  ]) {
    assert.ok(existsSync(resolve(root, file)), file);
  }
});

if (process.exitCode) {
  console.log(JSON.stringify({ ok: false }));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true }));
