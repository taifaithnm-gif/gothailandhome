/**
 * P2-060/063 — Deterministic mortgage / finance calculators.
 * Illustrative only — not a loan offer or financial advice.
 */

export type MortgageInput = {
  principalThb: number;
  annualRatePercent: number;
  termYears: number;
};

export type MortgageResult = {
  monthlyPaymentThb: number;
  totalPaymentThb: number;
  totalInterestThb: number;
  assumptions: string[];
  formula: string;
};

export function calculateMortgage(input: MortgageInput): MortgageResult | { error: string } {
  const { principalThb, annualRatePercent, termYears } = input;
  if (!(principalThb > 0) || !Number.isFinite(principalThb)) {
    return { error: "Principal must be a positive number." };
  }
  if (!(termYears > 0) || termYears > 50 || !Number.isFinite(termYears)) {
    return { error: "Term must be between 1 and 50 years." };
  }
  if (annualRatePercent < 0 || annualRatePercent > 30 || !Number.isFinite(annualRatePercent)) {
    return { error: "Annual rate must be between 0 and 30%." };
  }

  const n = Math.round(termYears * 12);
  const r = annualRatePercent / 100 / 12;
  let monthly: number;
  if (r === 0) {
    monthly = principalThb / n;
  } else {
    const pow = Math.pow(1 + r, n);
    monthly = (principalThb * r * pow) / (pow - 1);
  }
  const total = monthly * n;
  const interest = total - principalThb;

  return {
    monthlyPaymentThb: round2(monthly),
    totalPaymentThb: round2(total),
    totalInterestThb: round2(interest),
    assumptions: [
      "Fixed rate for the full term (illustrative).",
      "No fees, insurance, taxes, or currency risk included.",
      "Not a bank quote or credit decision.",
      "User-supplied principal, rate, and term only.",
    ],
    formula: "M = P * r(1+r)^n / ((1+r)^n - 1) where r = annual/12, n = years*12",
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export const FINANCE_DISCLAIMER =
  "Illustrative estimate only. Not financial advice. Not a loan offer. Results depend on user assumptions and exclude fees, taxes, and lender criteria.";
