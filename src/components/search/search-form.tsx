import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/config/locales";
import { localePath } from "@/lib/i18n/metadata";

type SearchFormProps = {
  locale: Locale;
  dict: Dictionary;
  defaults?: {
    q?: string;
    location?: string;
    type?: string;
  };
};

export function SearchForm({ locale, dict, defaults }: SearchFormProps) {
  return (
    <form
      action={localePath(locale, "/search")}
      method="get"
      className="grid gap-4 rounded-2xl border border-[var(--brand-line)] bg-white p-5 shadow-[0_1px_0_rgba(6,61,56,0.04)] sm:grid-cols-2 lg:grid-cols-4"
    >
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium text-[var(--brand-deep)]">
          {dict.search.queryLabel}
        </span>
        <input
          type="search"
          name="q"
          defaultValue={defaults?.q}
          placeholder={dict.search.queryPlaceholder}
          className="h-11 rounded-xl border border-[var(--brand-line)] bg-[var(--brand-soft)] px-3 outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium text-[var(--brand-deep)]">
          {dict.search.locationLabel}
        </span>
        <input
          type="text"
          name="location"
          defaultValue={defaults?.location}
          placeholder={dict.search.locationPlaceholder}
          className="h-11 rounded-xl border border-[var(--brand-line)] bg-[var(--brand-soft)] px-3 outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium text-[var(--brand-deep)]">
          {dict.search.typeLabel}
        </span>
        <select
          name="type"
          defaultValue={defaults?.type || "all"}
          className="h-11 rounded-xl border border-[var(--brand-line)] bg-[var(--brand-soft)] px-3 outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20"
        >
          <option value="all">{dict.common.allTypes}</option>
          <option value="condo">{dict.common.condo}</option>
          <option value="house">{dict.common.house}</option>
          <option value="villa">{dict.common.villa}</option>
          <option value="townhouse">{dict.common.townhouse}</option>
        </select>
      </label>

      <div className="flex items-end">
        <button
          type="submit"
          className="h-11 w-full rounded-xl bg-[var(--brand)] px-4 text-sm font-medium text-white transition hover:bg-[var(--brand-deep)]"
        >
          {dict.search.submit}
        </button>
      </div>
    </form>
  );
}
