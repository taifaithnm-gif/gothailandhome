import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AccountSignInForm } from "@/app/[lang]/account/sign-in-form";
import { isLocale, type Locale } from "@/config/locales";
import { isPhase2AccountEnabled } from "@/lib/feature-flags";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type Props = { params: Promise<{ lang: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Sign in | GoThailandHome",
    robots: { index: false, follow: false },
  };
}

export default async function AccountSignInPage({ params }: Props) {
  const { lang: raw } = await params;
  if (!isLocale(raw) || !isPhase2AccountEnabled()) notFound();
  const lang = raw as Locale;
  const dict = await getDictionary(lang);
  const a = dict.account;

  return (
    <main>
      <AccountSignInForm
        lang={lang}
        labels={{
          title: a.signInTitle,
          email: a.email,
          password: a.password,
          signIn: a.signIn,
          signUp: a.signUp,
          back: a.backToAccount,
        }}
      />
    </main>
  );
}
