"use client";

import { useActionState } from "react";

import { partnerSignIn } from "@/app/partners/app/actions";

export function PartnerSignInForm() {
  const [state, action, pending] = useActionState(partnerSignIn, {});
  return (
    <form action={action} className="mx-auto max-w-md space-y-4 px-4 py-12">
      <h1 className="font-heading text-3xl">Partner sign in</h1>
      <p className="text-sm text-stone-600">
        Use the email invited by ops. Staff must use /admin/login.
      </p>
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="mt-1 w-full rounded-lg border border-[var(--brand-line)] px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          className="mt-1 w-full rounded-lg border border-[var(--brand-line)] px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="inviteToken" className="block text-sm font-medium">
          Invite token (first sign-in)
        </label>
        <input
          id="inviteToken"
          name="inviteToken"
          className="mt-1 w-full rounded-lg border border-[var(--brand-line)] px-3 py-2"
        />
      </div>
      {state?.error ? (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 items-center rounded-xl bg-[var(--brand)] px-4 text-white disabled:opacity-60"
      >
        Sign in
      </button>
    </form>
  );
}
