#!/usr/bin/env node
/**
 * P1-12 — Project detail decision flow contracts.
 *
 * Offline checks: section anchors/hierarchy, evidence labels retained,
 * FAQ UI/schema parity, bounded listing previews, inquiry project context.
 * No live property sources / Windows01.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { visibleProjectFaqs } from "../src/lib/projects/visible-faq.ts";

const root = process.cwd();

const FILES = {
  page: "src/app/[lang]/projects/[slug]/page.tsx",
  form: "src/components/projects/project-lead-form.tsx",
  actions: "src/app/[lang]/projects/actions.ts",
  faq: "src/lib/projects/visible-faq.ts",
  schema: "src/lib/seo/schema.ts",
  evidence: "src/lib/projects/evidence.ts",
  en: "src/dictionaries/en.json",
  zh: "src/dictionaries/zh.json",
  th: "src/dictionaries/th.json",
};

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

check("project-detail:required files exist", () => {
  for (const file of Object.values(FILES)) {
    assert.ok(existsSync(resolve(root, file)), file);
  }
});

check("project-detail:section anchors and hierarchy", () => {
  const src = read(FILES.page);
  assert.ok(src.includes('data-slot="project-section-nav"'));
  assert.ok(src.includes("aria-label={pl.sectionNav}"));
  assert.ok(src.includes("sectionLinks"));
  for (const id of [
    "overview",
    "units",
    "listings",
    "price",
    "map",
    "facilities",
    "nearby",
    "developer",
    "verification",
    "related-projects",
    "find-my-home",
    "platform-support",
    "lead",
  ]) {
    assert.ok(src.includes(`id="${id}"`), id);
  }
  assert.ok(src.includes("scroll-mt-24"));
  assert.ok(src.includes('id="units"'));
  assert.ok(src.includes('id="price"'));
});

check("project-detail:facts retain evidence labels", () => {
  const src = read(FILES.page);
  assert.ok(src.includes("FactValue"));
  assert.ok(src.includes("VerificationBadge"));
  assert.ok(src.includes("evidenceLabel"));
  assert.ok(src.includes("evidenceClassFor"));
  assert.ok(src.includes('id="verification"'));
});

check("project-detail:FAQ helper and schema parity", () => {
  const page = read(FILES.page);
  const schema = read(FILES.schema);
  assert.ok(page.includes("visibleProjectFaqs"));
  assert.ok(page.includes("visibleFaqs"));
  assert.ok(schema.includes('from "@/lib/projects/visible-faq"'));
  assert.ok(schema.includes("visibleProjectFaqs(locale, project.faq)"));
  assert.ok(schema.includes("Keep FAQPage entities identical"));

  const faqs = [
    {
      question: { en: "Q1", zh: "", th: "" },
      answer: { en: "A1", zh: "", th: "" },
    },
    {
      question: { en: "", zh: "", th: "" },
      answer: { en: "orphan-answer", zh: "", th: "" },
    },
    {
      question: { en: "Empty answer", zh: "", th: "" },
      answer: { en: "", zh: "", th: "" },
    },
  ];
  const visible = visibleProjectFaqs("en", faqs);
  assert.equal(visible.length, 1);
  assert.deepEqual(visible[0], { question: "Q1", answer: "A1" });

  const zhVisible = visibleProjectFaqs("zh", [
    {
      question: { en: "EN Q", zh: "中文问", th: "" },
      answer: { en: "EN A", zh: "中文答", th: "" },
    },
  ]);
  assert.deepEqual(zhVisible[0], { question: "中文问", answer: "中文答" });

  const empty = visibleProjectFaqs("en", []);
  assert.equal(empty.length, 0);
});

check("project-detail:related listings remain bounded", () => {
  const page = read(FILES.page);
  const evidence = read(FILES.evidence);
  assert.ok(evidence.includes("PROJECT_LISTING_PREVIEW_SIZE"));
  assert.match(evidence, /PROJECT_LISTING_PREVIEW_SIZE\s*=\s*3/);
  assert.ok(page.includes("PROJECT_LISTING_PREVIEW_SIZE"));
  assert.ok(page.includes("items.slice(0, PROJECT_LISTING_PREVIEW_SIZE)"));
  assert.ok(page.includes("out.slice(0, 6)"));
});

check("project-detail:inquiry includes project context", () => {
  const form = read(FILES.form);
  const actions = read(FILES.actions);
  const page = read(FILES.page);
  assert.ok(form.includes("projectSlug"));
  assert.ok(form.includes("projectTitle"));
  assert.ok(form.includes('name="project_slug"'));
  assert.ok(form.includes('name="project_title"'));
  assert.ok(form.includes("inquiryForProject"));
  assert.ok(form.includes('data-slot="project-inquiry-context"'));
  assert.ok(actions.includes("project_slug"));
  assert.ok(actions.includes("project_title"));
  assert.ok(actions.includes("Project:"));
  assert.ok(page.includes("projectSlug={project.slug}"));
  assert.ok(page.includes("projectTitle={projectTitle}"));
});

check("project-detail:dictionary keys en/zh/th", () => {
  for (const locale of ["en", "zh", "th"]) {
    const dict = JSON.parse(read(`src/dictionaries/${locale}.json`));
    assert.ok(dict.projectLanding.sectionNav, `${locale}.sectionNav`);
    assert.ok(
      dict.projectLanding.inquiryForProject,
      `${locale}.inquiryForProject`,
    );
  }
});

if (process.exitCode) {
  console.log(JSON.stringify({ ok: false }));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true }));
