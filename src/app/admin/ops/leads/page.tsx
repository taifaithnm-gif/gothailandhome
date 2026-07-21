import Link from "next/link";
import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/auth/admin";
import { isPhase2OpsLeadsEnabled } from "@/lib/feature-flags";
import {
  isSlaBreached,
  type LeadStatus,
} from "@/lib/ops/lead-lifecycle";

export default async function OpsLeadsInboxPage() {
  if (!isPhase2OpsLeadsEnabled()) notFound();
  const { supabase } = await requireAdmin();

  const { data: leads } = await supabase
    .from("marketplace_leads")
    .select(
      "id, lead_type, status, name, email, locale, assigned_to, created_at, status_changed_at",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-stone-500">
          <Link href="/admin" className="underline">
            Admin
          </Link>{" "}
          / Ops / Leads
        </p>
        <h1 className="font-heading text-3xl">Lead inbox</h1>
        <p className="mt-1 text-sm text-stone-600">
          Staff triage for marketplace leads. Private — not indexed.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--brand-line)] bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[var(--brand-soft)] text-xs tracking-wide text-stone-600 uppercase">
            <tr>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Assignee</th>
              <th className="px-4 py-3">SLA</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {(leads ?? []).map((lead) => {
              const breached = isSlaBreached({
                status: lead.status as LeadStatus,
                statusChangedAt: lead.status_changed_at ?? lead.created_at,
              });
              return (
                <tr key={lead.id} className="border-t border-[var(--brand-line)]">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {new Date(lead.created_at).toLocaleString("en-GB")}
                  </td>
                  <td className="px-4 py-3">{lead.lead_type}</td>
                  <td className="px-4 py-3">{lead.status}</td>
                  <td className="px-4 py-3">
                    <div>{lead.name ?? "—"}</div>
                    <div className="text-xs text-stone-500">{lead.email}</div>
                  </td>
                  <td className="px-4 py-3">{lead.assigned_to ?? "—"}</td>
                  <td className="px-4 py-3">
                    {breached ? (
                      <span className="rounded-full bg-red-50 px-2 py-1 text-xs text-red-700">
                        Breached
                      </span>
                    ) : (
                      <span className="text-xs text-stone-500">OK</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/ops/leads/${lead.id}`}
                      className="text-[var(--brand)] hover:underline"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              );
            })}
            {(leads ?? []).length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-stone-500">
                  No leads yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
