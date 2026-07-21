"use client";

import { useActionState } from "react";
import Link from "next/link";

import {
  customerSignIn,
  customerSignUp,
} from "@/app/[lang]/account/actions";

type Props = {
  lang: string;
  labels: {
    title: string;
    email: string;
    password: string;
    signIn: string;
    signUp: string;
    back: string;
  };
};

export function AccountSignInForm({ lang, labels }: Props) {
  const [signInState, signInAction, signInPending] = useActionState(
    customerSignIn,
    {},
  );
  const [signUpState, signUpAction, signUpPending] = useActionState(
    customerSignUp,
    {},
  );

  return (
    <div className="mx-auto max-w-md space-y-10 px-4 py-12">
      <div>
        <h1 className="font-heading text-3xl">{labels.title}</h1>
        <Link href={`/${lang}/account`} className="mt-2 inline-block text-sm underline">
          {labels.back}
        </Link>
      </div>

      <form action={signInAction} className="space-y-4">
        <input type="hidden" name="lang" value={lang} />
        <input type="hidden" name="next" value={`/${lang}/account`} />
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            {labels.email}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-1 w-full rounded-lg border border-[var(--brand-line)] px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            {labels.password}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            minLength={8}
            className="mt-1 w-full rounded-lg border border-[var(--brand-line)] px-3 py-2"
          />
        </div>
        {signInState?.error ? (
          <p role="alert" className="text-sm text-red-700">
            {signInState.error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={signInPending}
          className="inline-flex h-11 items-center rounded-xl bg-[var(--brand)] px-4 text-white disabled:opacity-60"
        >
          {labels.signIn}
        </button>
      </form>

      <form action={signUpAction} className="space-y-4 border-t border-[var(--brand-line)] pt-8">
        <input type="hidden" name="lang" value={lang} />
        <div>
          <label htmlFor="signup-email" className="block text-sm font-medium">
            {labels.email}
          </label>
          <input
            id="signup-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-1 w-full rounded-lg border border-[var(--brand-line)] px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="signup-password" className="block text-sm font-medium">
            {labels.password}
          </label>
          <input
            id="signup-password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            minLength={8}
            className="mt-1 w-full rounded-lg border border-[var(--brand-line)] px-3 py-2"
          />
        </div>
        {signUpState?.error ? (
          <p role="alert" className="text-sm text-red-700">
            {signUpState.error}
          </p>
        ) : null}
        {signUpState?.message ? (
          <p role="status" className="text-sm text-emerald-700">
            {signUpState.message}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={signUpPending}
          className="inline-flex h-11 items-center rounded-xl border border-[var(--brand-line)] px-4 disabled:opacity-60"
        >
          {labels.signUp}
        </button>
      </form>
    </div>
  );
}
