/**
 * Build tap-to-call / messaging deep links from contact channel values.
 * Fail closed: return null when the value cannot form a safe actionable URL.
 */

export function toTelHref(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/[^\d+]/g, "");
  if (digits.replace(/\D/g, "").length < 8) return null;
  return `tel:${digits}`;
}

/** WhatsApp deep link — digits only in the path (wa.me convention). */
export function toWhatsAppHref(
  whatsapp: string | null | undefined,
): string | null {
  if (!whatsapp) return null;
  let digits = whatsapp.replace(/\D/g, "");
  if (digits.length < 8) return null;
  // Local Thai numbers often stored as 0xxxxxxxxx — normalize to country code.
  if (digits.startsWith("0") && digits.length >= 9) {
    digits = `66${digits.slice(1)}`;
  }
  return `https://wa.me/${digits}`;
}

/** LINE Official Account / friend URL when an ID or https URL is configured. */
export function toLineHref(line: string | null | undefined): string | null {
  if (!line) return null;
  const trimmed = line.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const id = trimmed.replace(/^@/, "");
  if (!id) return null;
  return `https://line.me/R/ti/p/@${encodeURIComponent(id)}`;
}

/**
 * WeChat deep link when an https URL is configured (e.g. from verified QR payload).
 * Plain WeChat IDs are not linkable — return null and keep QR/scan UX.
 */
export function toWeChatHref(wechat: string | null | undefined): string | null {
  if (!wechat) return null;
  const trimmed = wechat.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return null;
}
