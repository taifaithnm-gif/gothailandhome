#!/usr/bin/env node
/**
 * P1-20 — Contextual inquiry handoff.
 *
 * Deterministic offline checks: context identifiers are allowlisted + validated
 * (fail-closed), only public identifiers travel (no private payload), the shared
 * result page confirms channel/reference + context, and locale + back-navigation
 * are preserved. No live network / Windows01.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  LEAD_CONTEXT_FIELD,
  LEAD_CONTEXT_KINDS,
  LEAD_CONTEXT_PARAM,
  appendLeadContextParams,
  isLeadContextKind,
  leadContextSourcePath,
  normalizeLeadContext,
  parseLeadContextParams,
  readLeadContextFromForm,
} from "../src/lib/leads/context.ts";

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

check("handoff:context kinds are allowlisted", () => {
  assert.deepEqual([...LEAD_CONTEXT_KINDS], [
    "property",
    "project",
    "developer",
  ]);
  assert.equal(isLeadContextKind("property"), true);
  assert.equal(isLeadContextKind("agent"), false);
  assert.equal(isLeadContextKind(""), false);
});

check("handoff:valid context normalizes for each kind", () => {
  for (const kind of LEAD_CONTEXT_KINDS) {
    const ctx = normalizeLeadContext({
      kind,
      ref: "sukhumvit-31-condo",
      label: "  Sukhumvit 31 Condo  ",
    });
    assert.ok(ctx, `${kind} normalizes`);
    assert.equal(ctx.kind, kind);
    assert.equal(ctx.ref, "sukhumvit-31-condo");
    assert.equal(ctx.label, "Sukhumvit 31 Condo");
  }
});

check("handoff:invalid context fails closed", () => {
  assert.equal(normalizeLeadContext({ kind: "agent", ref: "x", label: "L" }), null);
  assert.equal(
    normalizeLeadContext({ kind: "property", ref: "../etc/passwd", label: "L" }),
    null,
    "path traversal rejected",
  );
  assert.equal(
    normalizeLeadContext({ kind: "property", ref: "Has Space", label: "L" }),
    null,
    "spaces rejected",
  );
  assert.equal(
    normalizeLeadContext({ kind: "property", ref: "ok-slug", label: "   " }),
    null,
    "empty label rejected",
  );
});

check("handoff:label is sanitized and length-bounded", () => {
  const ctx = normalizeLeadContext({
    kind: "project",
    ref: "the-line",
    label: `Line\nBreak\tHere ${"x".repeat(200)}`,
  });
  assert.ok(ctx);
  assert.ok(!/[\n\t]/.test(ctx.label), "control chars removed");
  assert.ok(ctx.label.length <= 120, "label bounded");
});

check("handoff:only public identifiers travel (no private payload)", () => {
  assert.deepEqual(Object.values(LEAD_CONTEXT_PARAM).sort(), [
    "ctx_kind",
    "ctx_label",
    "ctx_ref",
  ]);
  const params = new URLSearchParams({ channel: "viewing_request", ref: "GTH-VIEW-1" });
  appendLeadContextParams(params, {
    kind: "property",
    ref: "asoke-tower",
    label: "Asoke Tower",
  });
  const query = params.toString();
  for (const priv of ["name", "email", "phone", "message", "consent"]) {
    assert.ok(!query.includes(`${priv}=`), `private field ${priv} not in URL`);
  }
});

check("handoff:params round-trip and re-validate on parse", () => {
  const params = new URLSearchParams();
  appendLeadContextParams(params, {
    kind: "developer",
    ref: "sansiri",
    label: "Sansiri",
  });
  const parsed = parseLeadContextParams(
    Object.fromEntries(params.entries()),
  );
  assert.deepEqual(parsed, { kind: "developer", ref: "sansiri", label: "Sansiri" });

  const tampered = parseLeadContextParams({
    ctx_kind: "property",
    ctx_ref: "../secret",
    ctx_label: "x",
  });
  assert.equal(tampered, null, "tampered ref fails closed on parse");
});

check("handoff:source path preserves the correct route per kind", () => {
  assert.equal(
    leadContextSourcePath({ kind: "property", ref: "a", label: "A" }),
    "/properties/a",
  );
  assert.equal(
    leadContextSourcePath({ kind: "project", ref: "b", label: "B" }),
    "/projects/b",
  );
  assert.equal(
    leadContextSourcePath({ kind: "developer", ref: "c", label: "C" }),
    "/developers/c",
  );
});

check("handoff:form reader uses standardized fields", () => {
  assert.deepEqual(Object.values(LEAD_CONTEXT_FIELD).sort(), [
    "context_kind",
    "context_label",
    "context_ref",
  ]);
  const form = new Map([
    ["context_kind", "property"],
    ["context_ref", "riverside-88"],
    ["context_label", "Riverside 88"],
  ]);
  const ctx = readLeadContextFromForm({ get: (k) => form.get(k) });
  assert.deepEqual(ctx, {
    kind: "property",
    ref: "riverside-88",
    label: "Riverside 88",
  });
});

check("handoff:viewing form emits validated context fields", () => {
  const form = read("src/components/property/viewing-request-form.tsx");
  assert.ok(form.includes('name="context_kind" value="property"'));
  assert.ok(form.includes('name="context_ref" value={propertySlug}'));
  assert.ok(form.includes('name="context_label" value={propertyTitle}'));
});

check("handoff:action carries context to shared result", () => {
  const actions = read("src/app/[lang]/marketplace/actions.ts");
  assert.ok(actions.includes("readLeadContextFromForm(formData)"));
  assert.ok(
    actions.includes("context?: LeadContext | null"),
    "finalizeLead accepts context",
  );
  assert.ok(
    actions.includes("buildLeadSuccessPath(locale, channel, reference, mode, context)"),
  );
  const urls = read("src/lib/leads/urls.ts");
  assert.ok(urls.includes("appendLeadContextParams"));
});

check("handoff:result page confirms context without private payload", () => {
  const page = read("src/app/[lang]/leads/success/page.tsx");
  assert.ok(page.includes("parseLeadContextParams"));
  assert.ok(page.includes("context={context}"));

  const result = read("src/components/leads/lead-result.tsx");
  assert.ok(result.includes("leads.regardingLabel"));
  assert.ok(result.includes("{context.label}"));
  assert.ok(result.includes("leadContextSourcePath(context)"));
  assert.ok(
    result.includes("localePath(locale, leadContextSourcePath(context))"),
    "back-navigation preserves locale",
  );
  // Result must never render private lead payload.
  for (const priv of ["context.name", "context.email", "context.phone", "context.message"]) {
    assert.ok(!result.includes(priv), `no private field ${priv} on result`);
  }
});

check("handoff:EN/ZH/TH result context copy present", () => {
  for (const locale of ["en", "zh", "th"]) {
    const dict = JSON.parse(read(`src/dictionaries/${locale}.json`));
    assert.ok(dict.leads.regardingLabel, `${locale}.leads.regardingLabel`);
    assert.ok(dict.leads.backToSource, `${locale}.leads.backToSource`);
  }
});

check("handoff:required files exist", () => {
  for (const file of [
    "src/lib/leads/context.ts",
    "src/lib/leads/urls.ts",
    "src/app/[lang]/marketplace/actions.ts",
    "src/components/property/viewing-request-form.tsx",
    "src/app/[lang]/leads/success/page.tsx",
    "src/components/leads/lead-result.tsx",
  ]) {
    assert.ok(existsSync(resolve(root, file)), file);
  }
});

if (process.exitCode) {
  console.log(JSON.stringify({ ok: false }));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true }));
