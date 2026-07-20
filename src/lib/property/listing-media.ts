/**
 * Approved listing-media boundary.
 *
 * P1-11 permits existing local assets and public Supabase Storage assets only.
 * Protocol-relative, data, blob, and arbitrary remote URLs fail closed.
 */
export function isApprovedListingMediaUrl(
  value: string | null | undefined,
): value is string {
  const candidate = value?.trim();
  if (!candidate) return false;

  if (candidate.startsWith("/") && !candidate.startsWith("//")) {
    return true;
  }

  try {
    const url = new URL(candidate);
    return (
      url.protocol === "https:" &&
      url.hostname.endsWith(".supabase.co") &&
      url.pathname.startsWith("/storage/v1/object/public/")
    );
  } catch {
    return false;
  }
}

export function approvedListingMediaUrl(
  value: string | null | undefined,
): string | null {
  return isApprovedListingMediaUrl(value) ? value.trim() : null;
}
