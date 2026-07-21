import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getOptionalPartner } from "@/lib/partners/auth";
import { isPhase2PartnerPortalEnabled } from "@/lib/feature-flags";

export const metadata: Metadata = {
  title: "Partner app | GoThailandHome",
  robots: { index: false, follow: false },
};

export default async function PartnerAppHomePage() {
  if (!isPhase2PartnerPortalEnabled()) notFound();
  const partner = await getOptionalPartner();

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-heading text-3xl">Partner portal</h1>
      <p className="mt-2 text-stone-600">
        Invite-only developer and agent workflows. Not indexed.
      </p>
      {!partner ? (
        <Link
          href="/partners/app/sign-in"
          className="mt-6 inline-flex h-11 items-center rounded-xl bg-[var(--brand)] px-4 text-white"
        >
          Partner sign in
        </Link>
      ) : (
        <div className="mt-6 space-y-3">
          <p className="text-sm">
            Signed in as {partner.email} · {partner.orgName} · {partner.role}
          </p>
          <nav aria-label="Partner sections" className="flex flex-wrap gap-3">
            {partner.role === "developer" ? (
              <Link className="underline" href="/partners/app/developer">
                Developer workspace
              </Link>
            ) : null}
            {partner.role === "agent" ? (
              <Link className="underline" href="/partners/app/agent">
                Agent workspace
              </Link>
            ) : null}
          </nav>
        </div>
      )}
      <p className="mt-8 text-sm">
        <Link href="/en/partners/developers" className="underline">
          Public partner landing
        </Link>
      </p>
    </main>
  );
}
