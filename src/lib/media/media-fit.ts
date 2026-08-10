/**
 * Client-safe media path helpers (no fs / server-only imports).
 */

/** True when the public path is a developer logo asset. */
export function isDeveloperLogoSrc(src: string | null | undefined): boolean {
  if (!src) return false;
  return src.startsWith("/developers/");
}
