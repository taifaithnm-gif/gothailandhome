import { createProperty, updateProperty } from "@/app/admin/actions";
import type { PropertyView } from "@/lib/data/properties";
import type {
  AgentRow,
  LocationRow,
  PropertyProjectRow,
} from "@/lib/supabase/types";

type PropertyFormProps = {
  mode: "create" | "edit";
  property?: PropertyView | null;
  locations: LocationRow[];
  agents: AgentRow[];
  projects: PropertyProjectRow[];
  message?: string;
  error?: string;
};

const inputClass =
  "h-11 w-full rounded-xl border border-[var(--brand-line)] bg-white px-3 text-sm";
const areaClass =
  "w-full rounded-xl border border-[var(--brand-line)] bg-white px-3 py-2 text-sm";

export function PropertyForm({
  mode,
  property,
  locations,
  agents,
  projects,
  message,
  error,
}: PropertyFormProps) {
  const action =
    mode === "create"
      ? createProperty
      : updateProperty.bind(null, property!.id);

  return (
    <form action={action} className="space-y-6">
      {message ? (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <section className="grid gap-4 rounded-2xl border border-[var(--brand-line)] bg-white p-5 md:grid-cols-2">
        <label className="space-y-1 text-sm md:col-span-2">
          <span className="font-medium">Title (EN)</span>
          <input
            name="title_en"
            required
            defaultValue={property?.title.en}
            className={inputClass}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium">Title (ZH)</span>
          <input
            name="title_zh"
            required
            defaultValue={property?.title.zh}
            className={inputClass}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium">Title (TH)</span>
          <input
            name="title_th"
            required
            defaultValue={property?.title.th}
            className={inputClass}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium">Slug</span>
          <input
            name="slug"
            defaultValue={property?.slug}
            className={inputClass}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium">Status</span>
          <select
            name="status"
            defaultValue={property?.status ?? "draft"}
            className={inputClass}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium">Listing type</span>
          <select
            name="listing_type"
            defaultValue={property?.listingType ?? "sale"}
            className={inputClass}
          >
            <option value="sale">Sale</option>
            <option value="rent">Rent</option>
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium">Property type</span>
          <select
            name="property_type"
            defaultValue={property?.type ?? "condo"}
            className={inputClass}
          >
            <option value="condo">Condo</option>
            <option value="house">House</option>
            <option value="villa">Villa</option>
            <option value="land">Land</option>
            <option value="commercial">Commercial</option>
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium">Location</span>
          <select
            name="location_id"
            required
            defaultValue={property?.locationId ?? ""}
            className={inputClass}
          >
            <option value="">Select location</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name_en}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium">Project</span>
          <select
            name="project_id"
            defaultValue={property?.projectId ?? ""}
            className={inputClass}
          >
            <option value="">None</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name_en}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium">Agent</span>
          <select
            name="agent_id"
            defaultValue={property?.agentId ?? ""}
            className={inputClass}
          >
            <option value="">None</option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name_en}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium">Price (THB)</span>
          <input
            name="price_thb"
            type="number"
            min="0"
            step="1"
            required
            defaultValue={property?.priceThb}
            className={inputClass}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium">Bedrooms</span>
          <input
            name="bedrooms"
            type="number"
            min="0"
            defaultValue={property?.bedrooms ?? undefined}
            className={inputClass}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium">Bathrooms</span>
          <input
            name="bathrooms"
            type="number"
            min="0"
            step="0.5"
            defaultValue={property?.bathrooms ?? undefined}
            className={inputClass}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium">Area (sqm)</span>
          <input
            name="area_sqm"
            type="number"
            min="0"
            step="0.01"
            defaultValue={property?.areaSqm ?? undefined}
            className={inputClass}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium">Land area (sqm)</span>
          <input
            name="land_area_sqm"
            type="number"
            min="0"
            step="0.01"
            defaultValue={property?.landAreaSqm ?? undefined}
            className={inputClass}
          />
        </label>
        <label className="flex items-center gap-2 text-sm md:col-span-2">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={property?.featured}
          />
          <span>Featured listing</span>
        </label>
      </section>

      <section className="grid gap-4 rounded-2xl border border-[var(--brand-line)] bg-white p-5">
        <label className="space-y-1 text-sm">
          <span className="font-medium">Summary (EN)</span>
          <textarea
            name="summary_en"
            required
            rows={2}
            defaultValue={property?.summary.en}
            className={areaClass}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium">Summary (ZH)</span>
          <textarea
            name="summary_zh"
            required
            rows={2}
            defaultValue={property?.summary.zh}
            className={areaClass}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium">Summary (TH)</span>
          <textarea
            name="summary_th"
            required
            rows={2}
            defaultValue={property?.summary.th}
            className={areaClass}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium">Description (EN)</span>
          <textarea
            name="description_en"
            required
            rows={4}
            defaultValue={property?.description.en}
            className={areaClass}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium">Description (ZH)</span>
          <textarea
            name="description_zh"
            required
            rows={4}
            defaultValue={property?.description.zh}
            className={areaClass}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium">Description (TH)</span>
          <textarea
            name="description_th"
            required
            rows={4}
            defaultValue={property?.description.th}
            className={areaClass}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium">Cover image</span>
          <input
            type="file"
            name="image"
            accept="image/*"
            className="block w-full text-sm"
          />
          {property?.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={property.coverUrl}
              alt={property.title.en}
              className="mt-3 h-40 w-full rounded-xl object-cover"
            />
          ) : null}
        </label>
      </section>

      <button
        type="submit"
        className="h-11 rounded-xl bg-[var(--brand)] px-5 text-sm font-medium text-white hover:bg-[var(--brand-deep)]"
      >
        {mode === "create" ? "Create property" : "Save changes"}
      </button>
    </form>
  );
}
