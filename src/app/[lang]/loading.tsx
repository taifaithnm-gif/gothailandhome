"use client";

import { useParams } from "next/navigation";

import { LoadingState } from "@/components/ui/states";
import {
  routeStateCopy,
  routeStateLocale,
} from "@/lib/i18n/route-state-copy";

export default function LocaleLoading() {
  const params = useParams<{ lang?: string }>();
  const locale = routeStateLocale(params.lang);

  return (
    <div className="ds-container ds-section">
      <LoadingState
        label={routeStateCopy[locale].loading}
        className="min-h-48"
      />
    </div>
  );
}
