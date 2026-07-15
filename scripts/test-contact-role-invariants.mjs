#!/usr/bin/env node
/**
 * Contact-role invariant tests — Apple must be Platform Customer Success only.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const LISTING_OWNER_ROLES = new Set([
  "listing_contact",
  "project_contact",
  "developer_contact",
  "agency_contact",
]);

const CONTACT_ROLES = new Set([
  "listing_contact",
  "project_contact",
  "developer_contact",
  "agency_contact",
  "platform_customer_success",
]);

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
}

function ok(message) {
  console.log(`PASS: ${message}`);
}

const config = JSON.parse(
  readFileSync(resolve(process.cwd(), "config/contacts.json"), "utf8"),
);

let failures = 0;
const originalExit = process.exitCode;
process.exitCode = 0;

const contacts = config.contacts || [];
for (const contact of contacts) {
  if (!CONTACT_ROLES.has(contact.contact_role)) {
    fail(`${contact.id} has unknown contact_role=${contact.contact_role}`);
    failures += 1;
  }
}

const apple = contacts.find((c) => c.id === "apple");
if (!apple) {
  fail('contact id "apple" missing');
  failures += 1;
} else {
  if (apple.contact_role !== "platform_customer_success") {
    fail(
      `apple.contact_role must be platform_customer_success (got ${apple.contact_role})`,
    );
    failures += 1;
  } else {
    ok("apple is platform_customer_success");
  }
  if (LISTING_OWNER_ROLES.has(apple.contact_role)) {
    fail("apple must not be a listing/project/developer/agency contact");
    failures += 1;
  } else {
    ok("apple is not a listing-owner role");
  }
  const roleEn = (apple.role && apple.role.en) || "";
  if (/listing owner|agent of record/i.test(roleEn)) {
    fail("apple display role claims listing ownership");
    failures += 1;
  } else {
    ok("apple display role is non-owner");
  }
}

const platform = contacts.filter(
  (c) => c.contact_role === "platform_customer_success" && c.active !== false,
);
if (platform.length < 1) {
  fail("no active platform_customer_success contacts");
  failures += 1;
} else {
  ok(`${platform.length} platform_customer_success contact(s)`);
}

if (failures === 0) {
  console.log(JSON.stringify({ ok: true, failures: 0 }));
} else {
  console.log(JSON.stringify({ ok: false, failures }));
  process.exitCode = 1;
}

if (originalExit && !process.exitCode) process.exitCode = originalExit;
