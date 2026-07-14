import Link from "next/link";

import { requireAdmin } from "@/lib/auth/admin";
import { listAllPropertiesForAdmin } from "@/lib/data/properties";

export default async function AdminHomePage() {
  await requireAdmin();
  const properties = await listAllPropertiesForAdmin();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl">Properties</h1>
          <p className="mt-1 text-sm text-stone-600">
            Create, edit, and publish listings stored in Supabase.
          </p>
        </div>
        <Link
          href="/admin/properties/new"
          className="inline-flex h-11 items-center rounded-xl bg-[var(--brand)] px-4 text-sm font-medium text-white hover:bg-[var(--brand-deep)]"
        >
          New property
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--brand-line)] bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[var(--brand-soft)] text-xs tracking-wide text-stone-600 uppercase">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Listing</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {properties.map((property) => (
              <tr
                key={property.id}
                className="border-t border-[var(--brand-line)]"
              >
                <td className="px-4 py-3 font-medium">{property.title.en}</td>
                <td className="px-4 py-3">{property.type}</td>
                <td className="px-4 py-3">{property.listingType}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      property.status === "published"
                        ? "rounded-full bg-emerald-50 px-2 py-1 text-xs text-emerald-700"
                        : "rounded-full bg-amber-50 px-2 py-1 text-xs text-amber-700"
                    }
                  >
                    {property.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {property.priceThb.toLocaleString("en-US")}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/properties/${property.id}/edit`}
                    className="text-[var(--brand)] hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {properties.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-stone-500"
                >
                  No properties yet. Create the first listing.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
