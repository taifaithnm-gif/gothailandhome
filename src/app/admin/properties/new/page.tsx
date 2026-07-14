import Link from "next/link";

import { PropertyForm } from "@/components/admin/property-form";
import { requireAdmin } from "@/lib/auth/admin";
import { listAgents, listLocations, listProjects } from "@/lib/data/properties";

export default async function NewPropertyPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const [locations, agents, projects] = await Promise.all([
    listLocations(),
    listAgents(),
    listProjects(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-heading text-3xl">Create property</h1>
        <Link
          href="/admin"
          className="text-sm text-[var(--brand)] hover:underline"
        >
          Back to list
        </Link>
      </div>
      <PropertyForm
        mode="create"
        locations={locations}
        agents={agents}
        projects={projects}
        error={params.error}
      />
    </div>
  );
}
