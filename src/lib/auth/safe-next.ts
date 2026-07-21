/**
 * Sanitize auth redirect targets — path-relative only (open-redirect safe).
 */
export function sanitizeNextPath(
  next: string | null | undefined,
  fallback: string,
): string {
  if (!next || typeof next !== "string") return fallback;
  const trimmed = next.trim();
  if (!trimmed.startsWith("/")) return fallback;
  if (trimmed.startsWith("//")) return fallback;
  if (trimmed.includes("://")) return fallback;
  if (trimmed.includes("\\")) return fallback;
  if (/[\r\n]/.test(trimmed)) return fallback;
  return trimmed;
}
