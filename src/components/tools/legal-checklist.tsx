"use client";

import { useState } from "react";
import Link from "next/link";

import {
  LEGAL_CHECKLIST,
  LEGAL_WORKFLOW_DISCLAIMER,
} from "@/lib/legal/workflow";

type Labels = {
  ackLabel: string;
  continueLabel: string;
  progress: string;
  openGuide: string;
  itemOwnershipGuide: string;
  helpOwnershipGuide: string;
  itemTenure: string;
  helpTenure: string;
  itemTitleDocs: string;
  helpTitleDocs: string;
  itemFees: string;
  helpFees: string;
  itemCounsel: string;
  helpCounsel: string;
};

export function LegalChecklistClient({
  lang,
  labels,
}: {
  lang: string;
  labels: Labels;
}) {
  const [acked, setAcked] = useState(false);
  const [done, setDone] = useState<Record<string, boolean>>({});

  if (!acked) {
    return (
      <div className="rounded-2xl border border-[var(--brand-line)] bg-white p-4">
        <p className="text-sm text-amber-900">{LEGAL_WORKFLOW_DISCLAIMER}</p>
        <label className="mt-4 flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            className="mt-1"
            checked={acked}
            onChange={(e) => setAcked(e.target.checked)}
          />
          <span>{labels.ackLabel}</span>
        </label>
        <p className="mt-3 text-xs text-stone-500">{labels.continueLabel}</p>
      </div>
    );
  }

  const completed = LEGAL_CHECKLIST.filter((i) => done[i.id]).length;

  return (
    <div className="space-y-4">
      <p className="text-sm" aria-live="polite">
        {labels.progress
          .replace("{done}", String(completed))
          .replace("{total}", String(LEGAL_CHECKLIST.length))}
      </p>
      <ul className="space-y-3">
        {LEGAL_CHECKLIST.map((item) => (
          <li
            key={item.id}
            className="rounded-xl border border-[var(--brand-line)] bg-white p-4"
          >
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                checked={Boolean(done[item.id])}
                onChange={(e) =>
                  setDone((prev) => ({ ...prev, [item.id]: e.target.checked }))
                }
              />
              <span>
                <span className="font-medium">
                  {labels[item.titleKey as keyof Labels]}
                </span>
                <span className="mt-1 block text-stone-600">
                  {labels[item.helpKey as keyof Labels]}
                </span>
                {item.guidePath ? (
                  <Link
                    className="mt-1 inline-block underline"
                    href={`/${lang}${item.guidePath}`}
                  >
                    {labels.openGuide}
                  </Link>
                ) : null}
              </span>
            </label>
          </li>
        ))}
      </ul>
      <p className="text-xs text-stone-500">{LEGAL_WORKFLOW_DISCLAIMER}</p>
    </div>
  );
}
