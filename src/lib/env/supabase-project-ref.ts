/**
 * Extract and validate Supabase project refs from URLs.
 * Does not log or return secrets.
 */

const PROJECT_REF_RE = /^[a-z0-9]{15,40}$/i;

export function extractSupabaseProjectRef(url: string): string | null {
  const trimmed = (url || "").trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();
    // https://<ref>.supabase.co
    const m = host.match(/^([a-z0-9-]+)\.supabase\.co$/i);
    if (m?.[1]) return m[1].toLowerCase();
    return null;
  } catch {
    return null;
  }
}

export function isValidProjectRef(ref: string | null | undefined): boolean {
  if (!ref) return false;
  return PROJECT_REF_RE.test(ref.trim());
}

export function normalizeProjectRef(ref: string | null | undefined): string {
  return (ref || "").trim().toLowerCase();
}
