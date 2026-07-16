import Link from "next/link";
import { AlertCircle, CheckCircle2 } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { SurfaceCard } from "@/components/ui/card";
import type { Locale } from "@/config/locales";
import {
  leadReturnPath,
  type LeadChannel,
  type LeadSubmitMode,
} from "@/lib/leads/channels";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { localePath } from "@/lib/i18n/metadata";
import { cn } from "@/lib/utils";

function channelTitle(dict: Dictionary, channel: LeadChannel): string {
  const m = dict.marketplace;
  switch (channel) {
    case "find_my_home":
      return m.findTitle;
    case "list_your_property":
      return m.listTitle;
    case "developer_partnership":
      return m.developerPartnerTitle;
    case "agency_partnership":
      return m.agencyPartnerTitle;
    case "viewing_request":
      return m.viewingEntryTitle;
  }
}

function channelBody(dict: Dictionary, channel: LeadChannel): string {
  const m = dict.marketplace;
  switch (channel) {
    case "find_my_home":
      return m.successPrivate;
    case "list_your_property":
      return m.successReview;
    case "developer_partnership":
    case "agency_partnership":
      return m.successPending;
    case "viewing_request":
      return m.successViewing;
  }
}

export function LeadSuccessPanel({
  locale,
  dict,
  channel,
  reference,
  mode,
}: {
  locale: Locale;
  dict: Dictionary;
  channel: LeadChannel;
  reference: string | null;
  mode: LeadSubmitMode;
}) {
  const leads = dict.leads;
  const m = dict.marketplace;

  return (
    <SurfaceCard
      data-slot="lead-success"
      className="space-y-4 p-6! sm:p-8!"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <CheckCircle2
          className="mt-0.5 size-6 shrink-0 text-[var(--success)]"
          aria-hidden
        />
        <div className="space-y-2">
          <p className="ds-caption text-[var(--brand)]">
            {channelTitle(dict, channel)}
          </p>
          <h1 className="ds-h2 text-2xl sm:text-3xl">{leads.successTitle}</h1>
          <p className="text-sm text-stone-700">{channelBody(dict, channel)}</p>
          {reference ? (
            <p className="text-sm text-stone-600">
              <span className="font-medium text-[var(--brand-deep)]">
                {m.referenceLabel}:
              </span>{" "}
              <code className="rounded bg-[var(--brand-soft)] px-1.5 py-0.5 text-xs">
                {reference}
              </code>
            </p>
          ) : null}
          <p className="text-sm text-stone-600">{m.nextSteps}</p>
          <p className="text-xs text-stone-500">
            {mode === "stored" ? leads.modeStored : leads.modePlaceholder}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3 pt-2">
        <Link
          href={localePath(locale, leadReturnPath(channel))}
          className={buttonVariants({ variant: "primary" })}
        >
          {leads.backToForm}
        </Link>
        <Link
          href={localePath(locale, "/marketplace")}
          className={buttonVariants({ variant: "secondary" })}
        >
          {leads.backToMarketplace}
        </Link>
        <Link
          href={localePath(locale)}
          className={cn(buttonVariants({ variant: "ghost" }))}
        >
          {dict.nav.home}
        </Link>
      </div>
    </SurfaceCard>
  );
}

export function LeadErrorPanel({
  locale,
  dict,
  channel,
  code,
}: {
  locale: Locale;
  dict: Dictionary;
  channel: LeadChannel | null;
  code: string | null;
}) {
  const leads = dict.leads;
  const m = dict.marketplace;
  const errors = m.errors as Record<string, string>;
  const message =
    (code && errors[code]) || leads.errorBody;

  return (
    <SurfaceCard
      data-slot="lead-error"
      className="space-y-4 p-6! sm:p-8!"
      role="alert"
    >
      <div className="flex items-start gap-3">
        <AlertCircle
          className="mt-0.5 size-6 shrink-0 text-[var(--danger)]"
          aria-hidden
        />
        <div className="space-y-2">
          {channel ? (
            <p className="ds-caption text-[var(--brand)]">
              {channelTitle(dict, channel)}
            </p>
          ) : null}
          <h1 className="ds-h2 text-2xl sm:text-3xl">{leads.errorTitle}</h1>
          <p className="text-sm text-stone-700">{message}</p>
          <p className="text-sm text-stone-600">{leads.errorHint}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3 pt-2">
        {channel ? (
          <Link
            href={localePath(locale, leadReturnPath(channel))}
            className={buttonVariants({ variant: "primary" })}
          >
            {leads.tryAgain}
          </Link>
        ) : null}
        <Link
          href={localePath(locale, "/marketplace")}
          className={buttonVariants({ variant: "secondary" })}
        >
          {leads.backToMarketplace}
        </Link>
        <Link
          href={localePath(locale, "/contact")}
          className={buttonVariants({ variant: "ghost" })}
        >
          {dict.nav.contact}
        </Link>
      </div>
    </SurfaceCard>
  );
}
