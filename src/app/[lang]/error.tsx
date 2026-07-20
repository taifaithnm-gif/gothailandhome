"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/states";
import {
  routeStateCopy,
  routeStateLocale,
} from "@/lib/i18n/route-state-copy";
import { localePath } from "@/lib/i18n/metadata";

export default function LocaleError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  const params = useParams<{ lang?: string }>();
  const locale = routeStateLocale(params.lang);
  const copy = routeStateCopy[locale];
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    console.error(error);
    titleRef.current?.focus();
  }, [error]);

  return (
    <div className="ds-container ds-section">
      <ErrorState
        title={copy.errorTitle}
        description={copy.errorDescription}
        titleRef={titleRef}
        focusTitle
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <Button type="button" onClick={() => unstable_retry()}>
              {copy.retry}
            </Button>
            <Link
              href={localePath(locale)}
              className={buttonVariants({ variant: "secondary" })}
            >
              {copy.home}
            </Link>
          </div>
        }
      />
    </div>
  );
}
