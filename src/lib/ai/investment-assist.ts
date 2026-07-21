/**
 * P2-073/076 — Investment assist framing bound to mortgage calculator.
 * Forbidden-claim scanner; no fabricated yields.
 */

import { calculateMortgage, FINANCE_DISCLAIMER } from "@/lib/finance/mortgage";

export const INVESTMENT_ASSIST_DISCLAIMER =
  "Scenario framing only. Not investment advice. No guaranteed returns. Rental income and appreciation must be user-supplied assumptions — the platform does not invent yields.";

export const INVESTMENT_FORBIDDEN = [
  "guaranteed return",
  "guaranteed roi",
  "risk-free",
  "you will earn",
  "assured yield",
  "guaranteed rental",
] as const;

export function containsForbiddenInvestmentClaim(text: string): boolean {
  const lower = text.toLowerCase();
  return INVESTMENT_FORBIDDEN.some((t) => lower.includes(t));
}

export type InvestmentAssistInput = {
  purchasePriceThb: number;
  downPaymentPercent: number;
  annualRatePercent: number;
  termYears: number;
  /** User-supplied monthly rent assumption — never platform-verified */
  assumedMonthlyRentThb: number | null;
};

export type InvestmentAssistResult = {
  loanPrincipalThb: number;
  mortgage: ReturnType<typeof calculateMortgage> | { error: string };
  assumedMonthlyRentThb: number | null;
  roughMonthlyCashFlowThb: number | null;
  notes: string[];
  disclaimer: string;
};

export function runInvestmentAssist(
  input: InvestmentAssistInput,
): InvestmentAssistResult | { error: string } {
  if (!(input.purchasePriceThb > 0)) {
    return { error: "Purchase price must be positive." };
  }
  if (
    input.downPaymentPercent < 0 ||
    input.downPaymentPercent > 100 ||
    !Number.isFinite(input.downPaymentPercent)
  ) {
    return { error: "Down payment percent must be 0–100." };
  }
  const loanPrincipalThb =
    input.purchasePriceThb * (1 - input.downPaymentPercent / 100);
  const mortgage = calculateMortgage({
    principalThb: loanPrincipalThb,
    annualRatePercent: input.annualRatePercent,
    termYears: input.termYears,
  });

  let roughMonthlyCashFlowThb: number | null = null;
  if (
    input.assumedMonthlyRentThb != null &&
    input.assumedMonthlyRentThb >= 0 &&
    !("error" in mortgage)
  ) {
    roughMonthlyCashFlowThb =
      Math.round(
        (input.assumedMonthlyRentThb - mortgage.monthlyPaymentThb) * 100,
      ) / 100;
  }

  return {
    loanPrincipalThb: Math.round(loanPrincipalThb * 100) / 100,
    mortgage,
    assumedMonthlyRentThb: input.assumedMonthlyRentThb,
    roughMonthlyCashFlowThb,
    notes: [
      "Rent is a user assumption — not a verified market rent.",
      "Cash flow ignores taxes, fees, vacancy, maintenance, and FX.",
      FINANCE_DISCLAIMER,
    ],
    disclaimer: INVESTMENT_ASSIST_DISCLAIMER,
  };
}

/** Kill switch / provider adapter stub (P2-074) — L0 only; no external LLM. */
export type AiProviderMode = "rules_l0" | "disabled";

export function getAiProviderMode(flagEnabled: boolean): AiProviderMode {
  if (!flagEnabled) return "disabled";
  if (process.env.FEATURE_P2_AI_KILL_SWITCH === "true") return "disabled";
  return "rules_l0";
}
