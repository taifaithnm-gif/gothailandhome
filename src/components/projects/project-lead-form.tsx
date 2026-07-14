"use client";

import { useActionState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

import {
  submitProjectLead,
  type LeadFormState,
} from "@/app/[lang]/projects/actions";
import type { Locale } from "@/config/locales";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type ProjectLeadFormProps = {
  locale: Locale;
  projectId: string;
  dict: Dictionary;
};

const initialState: LeadFormState = { ok: false, message: "" };

export function ProjectLeadForm({
  locale,
  projectId,
  dict,
}: ProjectLeadFormProps) {
  const searchParams = useSearchParams();
  const [state, formAction, pending] = useActionState(
    submitProjectLead,
    initialState,
  );

  useEffect(() => {
    if (!state.ok) return;
    if (typeof window === "undefined") return;
    const w = window as Window & {
      __gthAds?: { metaPixelId?: string; googleAdsId?: string };
      fbq?: (...args: unknown[]) => void;
      gtag?: (...args: unknown[]) => void;
      dataLayer?: unknown[];
    };
    const ads = w.__gthAds;

    w.fbq?.("track", "Lead", {
      content_name: projectId,
      pixel_placeholder: ads?.metaPixelId,
    });
    w.gtag?.("event", "conversion", {
      send_to: `${ads?.googleAdsId || "AW-CONVERSION_ID_PLACEHOLDER"}/CONVERSION_LABEL_PLACEHOLDER`,
      event_callback: () => undefined,
    });
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({
      event: "generate_lead",
      project_id: projectId,
      locale,
    });
  }, [state.ok, projectId, locale]);

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-2xl border border-[var(--brand-line)] bg-white p-6 sm:p-8"
      data-ads-lead-form="project"
    >
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="project_id" value={projectId} />
      <input type="hidden" name="conversion_event" value="generate_lead" />
      <input
        type="hidden"
        name="utm_source"
        value={searchParams.get("utm_source") ?? ""}
      />
      <input
        type="hidden"
        name="utm_medium"
        value={searchParams.get("utm_medium") ?? ""}
      />
      <input
        type="hidden"
        name="utm_campaign"
        value={searchParams.get("utm_campaign") ?? ""}
      />
      <input
        type="hidden"
        name="utm_content"
        value={searchParams.get("utm_content") ?? ""}
      />
      <input
        type="hidden"
        name="utm_term"
        value={searchParams.get("utm_term") ?? ""}
      />
      <input
        type="hidden"
        name="gclid"
        value={searchParams.get("gclid") ?? ""}
      />
      <input
        type="hidden"
        name="fbclid"
        value={searchParams.get("fbclid") ?? ""}
      />

      <div>
        <h2 className="font-heading text-2xl text-[var(--brand-deep)]">
          {dict.projectLanding.leadTitle}
        </h2>
        <p className="mt-2 text-sm text-stone-600">
          {dict.projectLanding.leadSubtitle}
        </p>
      </div>

      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium text-[var(--brand-deep)]">
          {dict.contact.name}
        </span>
        <input
          required
          type="text"
          name="name"
          className="h-11 rounded-xl border border-[var(--brand-line)] bg-[var(--brand-soft)] px-3 transition outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium text-[var(--brand-deep)]">
          {dict.contact.email}
        </span>
        <input
          required
          type="email"
          name="email"
          className="h-11 rounded-xl border border-[var(--brand-line)] bg-[var(--brand-soft)] px-3 transition outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium text-[var(--brand-deep)]">
          {dict.projectLanding.phone}
        </span>
        <input
          type="tel"
          name="phone"
          className="h-11 rounded-xl border border-[var(--brand-line)] bg-[var(--brand-soft)] px-3 transition outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium text-[var(--brand-deep)]">
          {dict.contact.message}
        </span>
        <textarea
          required
          name="message"
          rows={4}
          className="rounded-xl border border-[var(--brand-line)] bg-[var(--brand-soft)] px-3 py-3 transition outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20"
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 items-center justify-center rounded-xl bg-[var(--brand)] px-5 text-sm font-medium text-white transition hover:bg-[var(--brand-deep)] disabled:opacity-60"
        data-ads-conversion="lead_submit"
      >
        {pending ? dict.projectLanding.sending : dict.projectLanding.submit}
      </button>

      {state.message ? (
        <p
          className={`text-sm ${state.ok ? "text-emerald-700" : "text-red-600"}`}
          role="status"
        >
          {state.ok ? dict.projectLanding.success : state.message}
        </p>
      ) : null}
      <p className="text-xs text-stone-500">{dict.projectLanding.adsNote}</p>
    </form>
  );
}
