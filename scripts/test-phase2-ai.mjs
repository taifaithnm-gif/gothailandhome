#!/usr/bin/env node
/**
 * Phase 2D — AI L0 recommend + investment assist (P2-070–076).
 * Note: investment-assist.ts uses @/ imports (Next); we validate via mortgage + source contracts.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const {
  recommendSimilarL0,
  AI_RECOMMEND_DISCLAIMER,
} = await import(path.join(root, "src/lib/ai/recommend-l0.ts"));
const { calculateMortgage, FINANCE_DISCLAIMER } = await import(
  path.join(root, "src/lib/finance/mortgage.ts")
);

const seed = {
  id: "1",
  slug: "a",
  titleEn: "A",
  listingType: "sale",
  propertyType: "condo",
  priceThb: 5_000_000,
  districtSlug: "watthana",
  bedrooms: 2,
};
const pool = [
  seed,
  {
    id: "2",
    slug: "b",
    titleEn: "B",
    listingType: "sale",
    propertyType: "condo",
    priceThb: 5_200_000,
    districtSlug: "watthana",
    bedrooms: 2,
  },
  {
    id: "3",
    slug: "c",
    titleEn: "C",
    listingType: "rent",
    propertyType: "house",
    priceThb: 50_000,
    districtSlug: "other",
    bedrooms: null,
  },
];

const hits = recommendSimilarL0(seed, pool, 4);
assert.ok(hits.length >= 1);
assert.equal(hits[0].candidate.slug, "b");
assert.ok(AI_RECOMMEND_DISCLAIMER.includes("L0"));

const loan = 5_000_000 * 0.8;
const mortgage = calculateMortgage({
  principalThb: loan,
  annualRatePercent: 5,
  termYears: 30,
});
assert.ok(!("error" in mortgage));
const cashflow =
  Math.round((25_000 - mortgage.monthlyPaymentThb) * 100) / 100;
assert.ok(Number.isFinite(cashflow));
assert.ok(FINANCE_DISCLAIMER.toLowerCase().includes("not financial advice"));

const assistSrc = fs.readFileSync(
  path.join(root, "src/lib/ai/investment-assist.ts"),
  "utf8",
);
assert.match(assistSrc, /INVESTMENT_ASSIST_DISCLAIMER/);
assert.match(assistSrc, /guaranteed return/);
assert.match(assistSrc, /FEATURE_P2_AI_KILL_SWITCH/);
assert.match(assistSrc, /getAiProviderMode/);
assert.match(assistSrc, /runInvestmentAssist/);
assert.ok(
  assistSrc.toLowerCase().includes("not investment advice"),
);

assert.equal(
  /guaranteed return/i.test("guaranteed return of 12%"),
  true,
);

const rail = fs.readFileSync(
  path.join(root, "src/components/property/similar-listings-rail.tsx"),
  "utf8",
);
assert.match(rail, /recommendSimilarL0/);
assert.match(
  fs.readFileSync(
    path.join(root, "src/app/[lang]/properties/[id]/page.tsx"),
    "utf8",
  ),
  /SimilarListingsRail/,
);
assert.match(
  fs.readFileSync(
    path.join(root, "src/app/[lang]/tools/investment-assist/page.tsx"),
    "utf8",
  ),
  /InvestmentAssistClient/,
);

console.log("PASS: phase2 AI contracts");
