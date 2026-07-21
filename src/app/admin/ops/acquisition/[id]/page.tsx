import Link from "next/link";
import { notFound } from "next/navigation";

import {
  publishAcquisitionAction,
  unpublishAcquisitionAction,
  updateAcquisitionStatusAction,
} from "@/app/admin/ops/acquisition/actions";
import {
  ACQUISITION_STATUSES,
  canTransitionAcquisition,
  type AcquisitionStatus,
} from "@/lib/acquisition/state-machine";
import {
  canPublishWithEvidence,
  missingRequiredEvidence,
  type EvidenceSatisfaction,
} from "@/lib/acquisition/evidence";
import { requireAdmin } from "@/lib/auth/admin";
import { isPhase2AcquisitionEnabled } from "@/lib/feature-flags";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; linked?: string }>;
};

export default async function AcquisitionDetailPage({
  params,
  searchParams,
}: Props) {
  if (!isPhase2AcquisitionEnabled()) notFound();
  const { id } = await params;
  const sp = await searchParams;
  const { supabase } = await requireAdmin();

  const { data: caseRow } = await supabase
    .from("acquisition_cases")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!caseRow) notFound();

  const { data: events } = await supabase
    .from("acquisition_events")
    .select("id, event_type, from_status, to_status, note, created_at")
    .eq("case_id", id)
    .order("created_at", { ascending: false })
    .limit(40);

  const { data: locations } = await supabase
    .from("locations")
    .select("id, name_en, slug")
    .order("name_en")
    .limit(200);

  const current = caseRow.status as AcquisitionStatus;
  const nextOptions = ACQUISITION_STATUSES.filter((status) =>
    canTransitionAcquisition(current, status, "ops"),
  );
  const evidence = (caseRow.evidence ?? {}) as EvidenceSatisfaction;
  const missing = missingRequiredEvidence(evidence);
  const evidenceOk = canPublishWithEvidence(evidence);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-stone-500">
          <Link href="/admin/ops/acquisition" className="underline">
            Acquisition queue
          </Link>
        </p>
        <h1 className="font-heading text-3xl">Case review</h1>
        {sp.error ? (
          <p role="alert" className="mt-2 text-sm text-red-700">
            {sp.error}
          </p>
        ) : null}
        {sp.linked ? (
          <p role="status" className="mt-2 text-sm text-emerald-700">
            Linked property {sp.linked}
          </p>
        ) : null}
      </div>

      <section className="rounded-2xl border border-[var(--brand-line)] bg-white p-4 text-sm">
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-stone-500">Status</dt>
            <dd>{caseRow.status}</dd>
          </div>
          <div>
            <dt className="text-stone-500">Project (stated)</dt>
            <dd>{caseRow.project_name ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-stone-500">Price (stated)</dt>
            <dd>{caseRow.price_text ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-stone-500">Type / listing</dt>
            <dd>
              {caseRow.property_type ?? "—"} / {caseRow.listing_type ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-stone-500">Submitter</dt>
            <dd>
              {caseRow.submitter_name} · {caseRow.submitter_email}
            </dd>
          </div>
          <div>
            <dt className="text-stone-500">Linked property</dt>
            <dd>{caseRow.linked_property_id ?? "—"}</dd>
          </div>
        </dl>
        <p className="mt-4 text-stone-600">
          Evidence ready: {evidenceOk ? "yes" : `missing ${missing.join(", ")}`}
        </p>
      </section>

      <form
        action={updateAcquisitionStatusAction}
        className="space-y-3 rounded-2xl border border-[var(--brand-line)] bg-white p-4"
      >
        <input type="hidden" name="caseId" value={caseRow.id} />
        <div>
          <label htmlFor="status" className="block text-sm font-medium">
            Transition status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={caseRow.status}
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
          <label htmlFor="note" className="block text-sm font-medium">
            Note
          </label>
          <textarea
            id="note"
            name="note"
            rows={2}
            className="mt-1 w-full rounded-lg border border-[var(--brand-line)] px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="inline-flex h-11 items-center rounded-xl bg-[var(--brand)] px-4 text-white"
        >
          Save status
        </button>
      </form>

      <form
        action={publishAcquisitionAction}
        className="space-y-3 rounded-2xl border border-[var(--brand-line)] bg-white p-4"
      >
        <h2 className="font-heading text-xl">Publish bridge</h2>
        <p className="text-sm text-stone-600">
          Creates a property from evidenced fields only. Reviewer must choose
          location_id (never inferred).
        </p>
        <input type="hidden" name="caseId" value={caseRow.id} />
        <div>
          <label htmlFor="locationId" className="block text-sm font-medium">
            Location
          </label>
          <select
            id="locationId"
            name="locationId"
            required
            className="mt-1 w-full rounded-lg border border-[var(--brand-line)] px-3 py-2"
            defaultValue=""
          >
            <option value="" disabled>
              Select location
            </option>
            {(locations ?? []).map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name_en} ({loc.slug})
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="publishNow" value="1" />
          Publish immediately (otherwise draft)
        </label>
        <button
          type="submit"
          disabled={!evidenceOk}
          className="inline-flex h-11 items-center rounded-xl bg-[var(--brand)] px-4 text-white disabled:opacity-50"
        >
          Link catalog property
        </button>
      </form>

      {caseRow.linked_property_id ? (
        <form action={unpublishAcquisitionAction}>
          <input type="hidden" name="caseId" value={caseRow.id} />
          <button
            type="submit"
            className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-700"
          >
            Unpublish linked property (rollback to draft)
          </button>
        </form>
      ) : null}

      <section>
        <h2 className="font-heading text-xl">Audit</h2>
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
                  <span>
                    {" "}
                    {event.from_status} → {event.to_status}
                  </span>
                ) : null}
                <div className="text-xs text-stone-500">
                  {new Date(event.created_at).toLocaleString("en-GB")}
                </div>
                {event.note ? <p>{event.note}</p> : null}
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
