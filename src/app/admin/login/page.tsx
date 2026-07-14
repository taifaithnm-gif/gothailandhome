import { loginAdmin } from "@/app/admin/actions";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-[var(--brand-line)] bg-white p-6 shadow-sm">
      <h1 className="font-heading text-2xl">Admin login</h1>
      <p className="mt-2 text-sm text-stone-600">
        Internal access only. Public users cannot register here.
      </p>
      {params.error ? (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {params.error === "unauthorized"
            ? "This account is not authorized for admin access."
            : params.error}
        </p>
      ) : null}
      <form action={loginAdmin} className="mt-6 space-y-4">
        <label className="block space-y-1 text-sm">
          <span className="font-medium">Email</span>
          <input
            type="email"
            name="email"
            required
            className="h-11 w-full rounded-xl border border-[var(--brand-line)] px-3"
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="font-medium">Password</span>
          <input
            type="password"
            name="password"
            required
            className="h-11 w-full rounded-xl border border-[var(--brand-line)] px-3"
          />
        </label>
        <button
          type="submit"
          className="h-11 w-full rounded-xl bg-[var(--brand)] text-sm font-medium text-white hover:bg-[var(--brand-deep)]"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}
