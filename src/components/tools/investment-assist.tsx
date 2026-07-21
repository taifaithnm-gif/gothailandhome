"use client";

import { useMemo, useState } from "react";

import {
  INVESTMENT_ASSIST_DISCLAIMER,
  containsForbiddenInvestmentClaim,
  runInvestmentAssist,
} from "@/lib/ai/investment-assist";

type Labels = {
  ack: string;
  price: string;
  down: string;
  rate: string;
  term: string;
  rent: string;
  run: string;
  loan: string;
  cashflow: string;
  rentOptional: string;
};

export function InvestmentAssistClient({ labels }: { labels: Labels }) {
  const [acked, setAcked] = useState(false);
  const [price, setPrice] = useState("5000000");
  const [down, setDown] = useState("20");
  const [rate, setRate] = useState("5");
  const [term, setTerm] = useState("30");
  const [rent, setRent] = useState("");
  const [run, setRun] = useState(false);

  const result = useMemo(() => {
    if (!run || !acked) return null;
    return runInvestmentAssist({
      purchasePriceThb: Number(price),
      downPaymentPercent: Number(down),
      annualRatePercent: Number(rate),
      termYears: Number(term),
      assumedMonthlyRentThb: rent.trim() === "" ? null : Number(rent),
    });
  }, [run, acked, price, down, rate, term, rent]);

  if (!acked) {
    return (
      <div className="rounded-2xl border border-[var(--brand-line)] bg-white p-4">
        <p className="text-sm text-amber-900">{INVESTMENT_ASSIST_DISCLAIMER}</p>
        <label className="mt-4 flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            className="mt-1"
            checked={acked}
            onChange={(e) => setAcked(e.target.checked)}
          />
          <span>{labels.ack}</span>
        </label>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="font-medium">{labels.price}</span>
          <input
            type="number"
            value={price}
            onChange={(e) => {
              setRun(false);
              setPrice(e.target.value);
            }}
            className="mt-1 w-full rounded-lg border border-[var(--brand-line)] px-3 py-2"
          />
        </label>
        <label className="text-sm">
          <span className="font-medium">{labels.down}</span>
          <input
            type="number"
            value={down}
            onChange={(e) => {
              setRun(false);
              setDown(e.target.value);
            }}
            className="mt-1 w-full rounded-lg border border-[var(--brand-line)] px-3 py-2"
          />
        </label>
        <label className="text-sm">
          <span className="font-medium">{labels.rate}</span>
          <input
            type="number"
            value={rate}
            onChange={(e) => {
              setRun(false);
              setRate(e.target.value);
            }}
            className="mt-1 w-full rounded-lg border border-[var(--brand-line)] px-3 py-2"
          />
        </label>
        <label className="text-sm">
          <span className="font-medium">{labels.term}</span>
          <input
            type="number"
            value={term}
            onChange={(e) => {
              setRun(false);
              setTerm(e.target.value);
            }}
            className="mt-1 w-full rounded-lg border border-[var(--brand-line)] px-3 py-2"
          />
        </label>
        <label className="text-sm sm:col-span-2">
          <span className="font-medium">{labels.rent}</span>
          <input
            type="number"
            value={rent}
            placeholder={labels.rentOptional}
            onChange={(e) => {
              setRun(false);
              setRent(e.target.value);
            }}
            className="mt-1 w-full rounded-lg border border-[var(--brand-line)] px-3 py-2"
          />
        </label>
      </div>
      <button
        type="button"
        className="rounded-xl bg-[var(--brand)] px-4 py-2 text-sm text-white"
        onClick={() => setRun(true)}
      >
        {labels.run}
      </button>
      <div aria-live="polite" className="text-sm">
        {result && "error" in result ? (
          <p role="alert" className="text-red-700">
            {result.error}
          </p>
        ) : null}
        {result && !("error" in result) ? (
          <dl className="space-y-1 rounded-xl border border-[var(--brand-line)] bg-white p-4">
            <div className="flex justify-between gap-4">
              <dt>{labels.loan}</dt>
              <dd>{result.loanPrincipalThb.toLocaleString()}</dd>
            </div>
            {"error" in result.mortgage ? (
              <p className="text-red-700">{result.mortgage.error}</p>
            ) : (
              <div className="flex justify-between gap-4">
                <dt>Monthly payment (illustrative)</dt>
                <dd>{result.mortgage.monthlyPaymentThb.toLocaleString()}</dd>
              </div>
            )}
            {result.roughMonthlyCashFlowThb != null ? (
              <div className="flex justify-between gap-4">
                <dt>{labels.cashflow}</dt>
                <dd>{result.roughMonthlyCashFlowThb.toLocaleString()}</dd>
              </div>
            ) : null}
            <ul className="mt-2 list-disc pl-5 text-xs text-stone-500">
              {result.notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
            {containsForbiddenInvestmentClaim(JSON.stringify(result)) ? (
              <p role="alert" className="text-red-700">
                Forbidden claim detected — results withheld.
              </p>
            ) : null}
          </dl>
        ) : null}
      </div>
      <p className="text-xs text-stone-500">{INVESTMENT_ASSIST_DISCLAIMER}</p>
    </div>
  );
}
