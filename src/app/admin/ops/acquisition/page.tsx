import Link from "next/link";
import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/auth/admin";
import { isPhase2AcquisitionEnabled } from "@/lib/feature-flags";

export default async function AcquisitionInboxPage() {
  if (!isPhase2AcquisitionEnabled()) notFound();
  const { supabase } = await requireAdmin();
  const { data: cases } = await supabase
    .from("acquisition_cases")
    .select(
      "id, status, project_name, submitter_email, submitter_name, created_at, linked_property_id",
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
          / Ops / Acquisition
        </p>
        <h1 className="font-heading text-3xl">Acquisition queue</h1>
        <p className="mt-1 text-sm text-stone-600">
          Review list-your-property cases. No silent fact invention on publish.
        </p>
      </div>
      <div className="overflow-hidden rounded-2xl border border-[var(--brand-line)] bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[var(--brand-soft)] text-xs uppercase text-stone-600">
            <tr>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Project</th>
              <th className="px-4 py-3">Submitter</th>
              <th className="px-4 py-3">Linked</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {(cases ?? []).map((row) => (
              <tr key={row.id} className="border-t border-[var(--brand-line)]">
                <td className="px-4 py-3 whitespace-nowrap">
                  {new Date(row.created_at).toLocaleString("en-GB")}
                </td>
                <td className="px-4 py-3">{row.status}</td>
                <td className="px-4 py-3">{row.project_name ?? "—"}</td>
                <td className="px-4 py-3">
                  <div>{row.submitter_name ?? "—"}</div>
                  <div className="text-xs text-stone-500">
                    {row.submitter_email}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs">
                  {row.linked_property_id ?? "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/ops/acquisition/${row.id}`}
                    className="text-[var(--brand)] hover:underline"
                  >
                    Review
                  </Link>
                </td>
              </tr>
            ))}
            {(cases ?? []).length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-stone-500"
                >
                  No acquisition cases yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
