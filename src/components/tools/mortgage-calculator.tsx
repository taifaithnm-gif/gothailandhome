"use client";

import { useMemo, useState } from "react";

import {
  calculateMortgage,
  FINANCE_DISCLAIMER,
} from "@/lib/finance/mortgage";

type Labels = {
  principal: string;
  rate: string;
  term: string;
  calculate: string;
  monthly: string;
  total: string;
  interest: string;
  assumptions: string;
};

export function MortgageCalculator({ labels }: { labels: Labels }) {
  const [principal, setPrincipal] = useState("3000000");
  const [rate, setRate] = useState("5");
  const [term, setTerm] = useState("30");
  const [submitted, setSubmitted] = useState(false);

  const result = useMemo(() => {
    if (!submitted) return null;
    return calculateMortgage({
      principalThb: Number(principal),
      annualRatePercent: Number(rate),
      termYears: Number(term),
    });
  }, [submitted, principal, rate, term]);

  return (
    <div className="space-y-4 rounded-2xl border border-[var(--brand-line)] bg-white p-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-sm">
          <span className="font-medium">{labels.principal}</span>
          <input
            type="number"
            min={1}
            value={principal}
            onChange={(e) => {
              setSubmitted(false);
              setPrincipal(e.target.value);
            }}
            className="mt-1 w-full rounded-lg border border-[var(--brand-line)] px-3 py-2"
          />
        </label>
        <label className="text-sm">
          <span className="font-medium">{labels.rate}</span>
          <input
            type="number"
            min={0}
            max={30}
            step={0.1}
            value={rate}
            onChange={(e) => {
              setSubmitted(false);
              setRate(e.target.value);
            }}
            className="mt-1 w-full rounded-lg border border-[var(--brand-line)] px-3 py-2"
          />
        </label>
        <label className="text-sm">
          <span className="font-medium">{labels.term}</span>
          <input
            type="number"
            min={1}
            max={50}
            value={term}
            onChange={(e) => {
              setSubmitted(false);
              setTerm(e.target.value);
            }}
            className="mt-1 w-full rounded-lg border border-[var(--brand-line)] px-3 py-2"
          />
        </label>
      </div>
      <button
        type="button"
        className="rounded-xl bg-[var(--brand)] px-4 py-2 text-sm text-white"
        onClick={() => setSubmitted(true)}
      >
        {labels.calculate}
      </button>
      <div aria-live="polite" className="text-sm">
        {result && "error" in result ? (
          <p role="alert" className="text-red-700">
            {result.error}
          </p>
        ) : null}
        {result && !("error" in result) ? (
          <dl className="space-y-1">
            <div className="flex justify-between gap-4">
              <dt>{labels.monthly}</dt>
              <dd>{result.monthlyPaymentThb.toLocaleString()}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>{labels.total}</dt>
              <dd>{result.totalPaymentThb.toLocaleString()}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>{labels.interest}</dt>
              <dd>{result.totalInterestThb.toLocaleString()}</dd>
            </div>
            <p className="pt-2 text-xs text-stone-500">
              {labels.assumptions}: {result.assumptions.join(" ")}
            </p>
          </dl>
        ) : null}
      </div>
      <p className="text-xs text-stone-500">{FINANCE_DISCLAIMER}</p>
    </div>
  );
}
