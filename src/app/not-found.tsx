import Link from "next/link";

import { defaultLocale } from "@/config/locales";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { localePath } from "@/lib/i18n/metadata";

export default async function NotFound() {
  const dict = await getDictionary(defaultLocale);

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-start justify-center gap-4 px-4 py-20 sm:px-6">
      <p className="text-sm font-medium tracking-wide text-[var(--brand)] uppercase">
        404
      </p>
      <h1 className="font-heading text-4xl text-[var(--brand-deep)]">
        {dict.notFound.title}
      </h1>
      <p className="max-w-lg text-stone-600">{dict.notFound.body}</p>
      <Link
        href={localePath(defaultLocale)}
        className="mt-2 inline-flex h-11 items-center justify-center rounded-xl bg-[var(--brand)] px-5 text-sm font-medium text-white transition hover:bg-[var(--brand-deep)]"
      >
        {dict.notFound.cta}
      </Link>
    </div>
  );
}
