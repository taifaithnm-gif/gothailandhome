"use client";

import { FAVORITES_STORAGE_KEY } from "@/lib/favorites";

type Props = {
  lang: string;
  label: string;
  action: (formData: FormData) => void | Promise<void>;
};

export function DeviceFavoritesMigrate({ lang, label, action }: Props) {
  return (
    <form
      action={action}
      className="mt-6"
      onSubmit={(event) => {
        const form = event.currentTarget;
        const input = form.elements.namedItem("itemsJson") as HTMLInputElement;
        try {
          const raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
          const parsed = raw ? JSON.parse(raw) : { items: [] };
          input.value = JSON.stringify(parsed.items ?? []);
        } catch {
          input.value = "[]";
        }
      }}
    >
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="itemsJson" defaultValue="[]" />
      <button
        type="submit"
        className="rounded-lg border border-[var(--brand-line)] px-3 py-2 text-sm"
      >
        {label}
      </button>
    </form>
  );
}
