import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PartnerSignInForm } from "@/app/partners/app/sign-in-form";
import { isPhase2PartnerPortalEnabled } from "@/lib/feature-flags";

export const metadata: Metadata = {
  title: "Partner sign in | GoThailandHome",
  robots: { index: false, follow: false },
};

export default function PartnerSignInPage() {
  if (!isPhase2PartnerPortalEnabled()) notFound();
  return (
    <main>
      <PartnerSignInForm />
    </main>
  );
}
