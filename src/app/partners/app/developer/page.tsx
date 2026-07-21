import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { partnerSignOut } from "@/app/partners/app/actions";
import { updateDeveloperOrgAction } from "@/app/partners/app/developer/actions";
import { requirePartner } from "@/lib/partners/auth";
import { isPhase2PartnerPortalEnabled } from "@/lib/feature-flags";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Developer workspace | GoThailandHome",
  robots: { index: false, follow: false },
};

export default async function DeveloperPortalPage() {
  if (!isPhase2PartnerPortalEnabled()) notFound();
  const partner = await requirePartner("developer");
  const supabase = await createClient();
  const { data: org } = await supabase
    .from("partner_orgs")
    .select("id, name, website, lead_routing_email, slug")
    .eq("id", partner.orgId)
    .maybeSingle();

  const { data: handoffs } = await supabase
    .from("partner_lead_handoffs")
    .select("id, status, lead_id, created_at")
    .eq("org_id", partner.orgId)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 space-y-8">
      <div>
        <p className="text-sm text-stone-500">
          <Link href="/partners/app" className="underline">
            Partner app
          </Link>
        </p>
        <h1 className="font-heading text-3xl">Developer workspace</h1>
        <p className="mt-1 text-sm text-stone-600">
          Manage org profile and lead routing. Scoped to your organization.
        </p>
      </div>

      <form
        action={updateDeveloperOrgAction}
        className="space-y-3 rounded-xl border border-[var(--brand-line)] bg-white p-4"
      >
        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            Organization name
          </label>
          <input
            id="name"
            name="name"
            required
            defaultValue={org?.name ?? partner.orgName}
            className="mt-1 w-full rounded-lg border border-[var(--brand-line)] px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="website" className="block text-sm font-medium">
            Website
          </label>
          <input
            id="website"
            name="website"
            defaultValue={org?.website ?? ""}
            className="mt-1 w-full rounded-lg border border-[var(--brand-line)] px-3 py-2"
          />
        </div>
        <div>
          <label
            htmlFor="lead_routing_email"
            className="block text-sm font-medium"
          >
            Lead routing email
          </label>
          <input
            id="lead_routing_email"
            name="lead_routing_email"
            type="email"
            defaultValue={org?.lead_routing_email ?? ""}
            className="mt-1 w-full rounded-lg border border-[var(--brand-line)] px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="inline-flex h-11 items-center rounded-xl bg-[var(--brand)] px-4 text-white"
        >
          Save profile
        </button>
      </form>

      <section>
        <h2 className="font-heading text-xl">Lead routing activity</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {(handoffs ?? []).length === 0 ? (
            <li className="text-stone-500">No handoffs yet.</li>
          ) : (
            (handoffs ?? []).map((row) => (
              <li
                key={row.id}
                className="rounded-lg border border-[var(--brand-line)] px-3 py-2"
              >
                {row.status} · lead {row.lead_id ?? "—"} ·{" "}
                {new Date(row.created_at).toLocaleString("en-GB")}
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
