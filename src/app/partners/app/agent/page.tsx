import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { partnerSignOut } from "@/app/partners/app/actions";
import {
  createStewardshipAction,
  createHandoffAction,
} from "@/app/partners/app/agent/actions";
import { requirePartner } from "@/lib/partners/auth";
import { isPhase2PartnerPortalEnabled } from "@/lib/feature-flags";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Agent workspace | GoThailandHome",
  robots: { index: false, follow: false },
};

export default async function AgentPortalPage() {
  if (!isPhase2PartnerPortalEnabled()) notFound();
  const partner = await requirePartner("agent");
  const supabase = await createClient();

  const { data: stewardships } = await supabase
    .from("agent_stewardships")
    .select("id, property_slug, notes, updated_at")
    .eq("org_id", partner.orgId)
    .eq("user_id", partner.userId)
    .order("updated_at", { ascending: false })
    .limit(50);

  const { data: handoffs } = await supabase
    .from("partner_lead_handoffs")
    .select("id, status, lead_id, viewing_notes, created_at")
    .eq("org_id", partner.orgId)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-4 py-12">
      <div>
        <p className="text-sm text-stone-500">
          <Link href="/partners/app" className="underline">
            Partner app
          </Link>
        </p>
        <h1 className="font-heading text-3xl">Agent workspace</h1>
        <p className="mt-1 text-sm text-stone-600">
          Steward listings, hand off leads, and record viewing notes.
        </p>
      </div>

      <form
        action={createStewardshipAction}
        className="space-y-3 rounded-xl border border-[var(--brand-line)] bg-white p-4"
      >
        <h2 className="font-heading text-lg">Add stewardship</h2>
        <div>
          <label htmlFor="property_slug" className="block text-sm font-medium">
            Property slug
          </label>
          <input
            id="property_slug"
            name="property_slug"
            required
            className="mt-1 w-full rounded-lg border border-[var(--brand-line)] px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="notes" className="block text-sm font-medium">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={2}
            className="mt-1 w-full rounded-lg border border-[var(--brand-line)] px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="inline-flex h-11 items-center rounded-xl bg-[var(--brand)] px-4 text-white"
        >
          Save stewardship
        </button>
      </form>

      <section>
        <h2 className="font-heading text-xl">Your stewardships</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {(stewardships ?? []).length === 0 ? (
            <li className="text-stone-500">None yet.</li>
          ) : (
            (stewardships ?? []).map((row) => (
              <li
                key={row.id}
                className="rounded-lg border border-[var(--brand-line)] px-3 py-2"
              >
                <Link
                  className="underline"
                  href={`/en/properties/${row.property_slug}`}
                >
                  {row.property_slug}
                </Link>
                {row.notes ? <p className="mt-1">{row.notes}</p> : null}
              </li>
            ))
          )}
        </ul>
      </section>

      <form
        action={createHandoffAction}
        className="space-y-3 rounded-xl border border-[var(--brand-line)] bg-white p-4"
      >
        <h2 className="font-heading text-lg">Lead handoff</h2>
        <div>
          <label htmlFor="lead_id" className="block text-sm font-medium">
            Marketplace lead ID
          </label>
          <input
            id="lead_id"
            name="lead_id"
            className="mt-1 w-full rounded-lg border border-[var(--brand-line)] px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="viewing_notes" className="block text-sm font-medium">
            Viewing notes
          </label>
          <textarea
            id="viewing_notes"
            name="viewing_notes"
            rows={2}
            className="mt-1 w-full rounded-lg border border-[var(--brand-line)] px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="inline-flex h-11 items-center rounded-xl border border-[var(--brand-line)] px-4"
        >
          Record handoff
        </button>
      </form>

      <section>
        <h2 className="font-heading text-xl">Handoffs</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {(handoffs ?? []).length === 0 ? (
            <li className="text-stone-500">None yet.</li>
          ) : (
            (handoffs ?? []).map((row) => (
              <li
                key={row.id}
                className="rounded-lg border border-[var(--brand-line)] px-3 py-2"
              >
                {row.status} · {row.lead_id ?? "—"}
                {row.viewing_notes ? (
                  <p className="mt-1">{row.viewing_notes}</p>
                ) : null}
              </li>
            ))
          )}
        </ul>
      </section>

      <form action={partnerSignOut}>
        <button type="submit" className="text-sm underline">
          Sign out
        </button>
      </form>
    </main>
  );
}
