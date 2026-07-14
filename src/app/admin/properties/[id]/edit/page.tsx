import Link from "next/link";
import { notFound } from "next/navigation";

import { PropertyForm } from "@/components/admin/property-form";
import { requireAdmin } from "@/lib/auth/admin";
import {
  getPropertyByIdForAdmin,
  listAgents,
  listLocations,
  listProjects,
} from "@/lib/data/properties";

export default async function EditPropertyPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string; created?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const query = await searchParams;
  const property = await getPropertyByIdForAdmin(id);
  if (!property) notFound();

  const [locations, agents, projects] = await Promise.all([
    listLocations(),
    listAgents(),
    listProjects(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl">Edit property</h1>
          <p className="mt-1 text-sm text-stone-600">{property.slug}</p>
        </div>
        <div className="flex gap-3 text-sm">
          <Link
            href={`/en/properties/${property.slug}`}
            className="text-[var(--brand)] hover:underline"
          >
            Public page
          </Link>
          <Link href="/admin" className="text-[var(--brand)] hover:underline">
            Back to list
          </Link>
        </div>
      </div>
      <PropertyForm
        mode="edit"
        property={property}
        locations={locations}
        agents={agents}
        projects={projects}
        error={query.error}
        message={
          query.created
            ? "Property created."
            : query.saved
              ? "Property saved."
              : undefined
        }
      />
    </div>
  );
}
