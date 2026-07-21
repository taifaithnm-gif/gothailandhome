import Link from "next/link";
import { notFound } from "next/navigation";

import { updateLeadStatusAction } from "@/app/admin/ops/leads/actions";
import { requireAdmin } from "@/lib/auth/admin";
import { isPhase2OpsLeadsEnabled } from "@/lib/feature-flags";
import {
  LEAD_STATUSES,
  canTransitionLeadStatus,
  type LeadStatus,
} from "@/lib/ops/lead-lifecycle";

type Props = { params: Promise<{ id: string }> };

export default async function OpsLeadDetailPage({ params }: Props) {
  if (!isPhase2OpsLeadsEnabled()) notFound();
  const { id } = await params;
  const { supabase } = await requireAdmin();

  const { data: lead } = await supabase
    .from("marketplace_leads")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!lead) notFound();

  const { data: events } = await supabase
    .from("marketplace_lead_events")
    .select("id, event_type, from_status, to_status, note, created_at")
    .eq("lead_id", id)
    .order("created_at", { ascending: false })
    .limit(50);

  const current = lead.status as LeadStatus;
  const nextOptions = LEAD_STATUSES.filter((status) =>
    canTransitionLeadStatus(current, status),
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-stone-500">
          <Link href="/admin/ops/leads" className="underline">
            Lead inbox
          </Link>
        </p>
        <h1 className="font-heading text-3xl">Lead detail</h1>
      </div>

      <section className="rounded-2xl border border-[var(--brand-line)] bg-white p-4 text-sm">
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-stone-500">Type</dt>
            <dd>{lead.lead_type}</dd>
          </div>
          <div>
            <dt className="text-stone-500">Status</dt>
            <dd>{lead.status}</dd>
          </div>
          <div>
            <dt className="text-stone-500">Name</dt>
            <dd>{lead.name ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-stone-500">Email</dt>
            <dd>{lead.email ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-stone-500">Phone</dt>
            <dd>{lead.phone ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-stone-500">Locale</dt>
            <dd>{lead.locale}</dd>
          </div>
        </dl>
        {lead.message ? (
          <p className="mt-4 whitespace-pre-wrap text-stone-700">{lead.message}</p>
        ) : null}
      </section>

      <form
        action={updateLeadStatusAction}
        className="space-y-3 rounded-2xl border border-[var(--brand-line)] bg-white p-4"
      >
        <input type="hidden" name="id" value={lead.id} />
        <div>
          <label htmlFor="status" className="block text-sm font-medium">
            Update status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={lead.status}
            className="mt-1 w-full rounded-lg border border-[var(--brand-line)] px-3 py-2"
          >
            {nextOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="assignedTo" className="block text-sm font-medium">
            Assigned to
          </label>
          <input
            id="assignedTo"
            name="assignedTo"
            defaultValue={lead.assigned_to ?? ""}
            className="mt-1 w-full rounded-lg border border-[var(--brand-line)] px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="note" className="block text-sm font-medium">
            Note
          </label>
          <textarea
            id="note"
            name="note"
            rows={3}
            className="mt-1 w-full rounded-lg border border-[var(--brand-line)] px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="inline-flex h-11 items-center rounded-xl bg-[var(--brand)] px-4 text-white"
        >
          Save
        </button>
      </form>

      <section>
        <h2 className="font-heading text-xl">Audit events</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {(events ?? []).length === 0 ? (
            <li className="text-stone-500">No events yet.</li>
          ) : (
            (events ?? []).map((event) => (
              <li
                key={event.id}
                className="rounded-lg border border-[var(--brand-line)] bg-white px-3 py-2"
              >
                <span className="font-medium">{event.event_type}</span>
                {event.from_status || event.to_status ? (
                  <span className="text-stone-600">
                    {" "}
                    {event.from_status} → {event.to_status}
                  </span>
                ) : null}
                <div className="text-xs text-stone-500">
                  {new Date(event.created_at).toLocaleString("en-GB")}
                </div>
                {event.note ? <p className="mt-1">{event.note}</p> : null}
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
