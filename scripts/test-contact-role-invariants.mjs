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

// Display copy must never present Apple / platform CS as listing agent.
try {
  const en = JSON.parse(
    readFileSync(resolve(process.cwd(), "src/dictionaries/en.json"), "utf8"),
  );
  const m = en.marketplace || {};
  if (!/Ask GoThailandHome to help contact the source/i.test(m.escalationCta || "")) {
    fail("escalationCta must ask GoThailandHome to help contact the source");
    failures += 1;
  } else {
    ok("escalation CTA is platform assistance, not listing agent");
  }
  if (/listing agent|listing owner/i.test(m.platformSupportTitle || "")) {
    fail("platformSupportTitle must not claim listing agent/owner");
    failures += 1;
  } else {
    ok("platform support title is not labeled as listing agent");
  }
  if (!m.aiConcierge?.note || !/not a listing agent/i.test(m.aiConcierge.note)) {
    fail("aiConcierge note must state it is not a listing agent");
    failures += 1;
  } else {
    ok("AI concierge copy is non-agent");
  }
  const card = readFileSync(
    resolve(process.cwd(), "src/components/property/listing-contact-card.tsx"),
    "utf8",
  );
  if (!/never silently substitutes Apple/i.test(card)) {
    fail("listing-contact-card missing Apple substitute guard comment/policy");
    failures += 1;
  } else {
    ok("listing-contact-card documents Apple non-substitution");
  }
  if (/agent\.name.*apple|apple.*listingContactRole/i.test(card)) {
    fail("listing-contact-card appears to render Apple as listing agent");
    failures += 1;
  } else {
    ok("listing-contact-card does not hardcode Apple as listing agent");
  }
  const blocks = readFileSync(
    resolve(process.cwd(), "src/components/marketplace/contact-blocks.tsx"),
    "utf8",
  );
  if (!blocks.includes('data-slot="listing-contact"')) {
    fail("ListingContact foundation component missing");
    failures += 1;
  } else {
    ok("ListingContact foundation component present");
  }
  if (!blocks.includes('data-slot="platform-customer-success"')) {
    fail("PlatformCustomerSuccess foundation component missing");
    failures += 1;
  } else {
    ok("PlatformCustomerSuccess foundation component present");
  }
  if (!blocks.includes('data-slot="ai-concierge"')) {
    fail("AiConcierge foundation component missing");
    failures += 1;
  } else {
    ok("AiConcierge foundation component present");
  }
  const listingFn = blocks.slice(
    blocks.indexOf("export function ListingContact"),
    blocks.indexOf("export function PlatformCustomerSuccess"),
  );
  if (listingFn.includes("getPlatformCustomerSuccessContacts")) {
    fail("ListingContact must not load platform CS contacts");
    failures += 1;
  } else {
    ok("ListingContact does not load platform CS contacts");
  }
  // Live agent_id coverage is validated in CONTACT_SAFETY_VALIDATION_REPORT /
  // scripts/check-agent-relations.mjs (requires Supabase network). Offline gate
  // asserts the documented freeze baseline still claims 12 relations.
  try {
    const integrity = readFileSync(
      resolve(process.cwd(), "DATA_INTEGRITY_REPORT.md"),
      "utf8",
    );
    if (!/\|\s*properties with `agent_id`\s*\|\s*12\s*\|/.test(integrity)) {
      fail("DATA_INTEGRITY_REPORT.md must document 12 properties with agent_id");
      failures += 1;
    } else {
      ok("documented freeze baseline retains 12 listing-agent relations");
    }
  } catch (error) {
    fail(`agent baseline doc check failed: ${error.message}`);
    failures += 1;
  }
} catch (error) {
  fail(`dictionary/contact card checks failed: ${error.message}`);
  failures += 1;
}

if (failures === 0) {
  console.log(JSON.stringify({ ok: true, failures: 0 }));
} else {
  console.log(JSON.stringify({ ok: false, failures }));
  process.exitCode = 1;
}

if (originalExit && !process.exitCode) process.exitCode = originalExit;
