/**
 * Shared marketplace form validation — no CRM, no email side-effects.
 * Returns stable error codes; UI maps them via dictionary.
 */

export type MarketplaceValidationCode =
  | "name_and_contact_required"
  | "company_contact_required"
  | "agency_contact_required"
  | "consent_required"
  | "authorization_required"
  | "project_required"
  | "price_required"
  | "message_required"
  | "invalid_email";

export type ContactBasicsInput = {
  name: string;
  phone: string;
  email: string;
  consent: boolean;
};

export type ValidationResult =
  | { ok: true }
  | { ok: false; code: MarketplaceValidationCode };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeField(value: unknown): string {
  return String(value ?? "").trim();
}

export function isChecked(value: unknown): boolean {
  return (
    value === true ||
    value === "on" ||
    value === "true" ||
    value === "1" ||
    value === "yes"
  );
}

export function isValidEmail(email: string): boolean {
  if (!email) return true; // optional until required elsewhere
  return EMAIL_RE.test(email);
}

/** Name + (phone or email) + consent — Find My Home / Viewing / List contact. */
export function validateContactBasics(
  input: ContactBasicsInput,
): ValidationResult {
  if (!input.name || (!input.phone && !input.email)) {
    return { ok: false, code: "name_and_contact_required" };
  }
  if (input.email && !isValidEmail(input.email)) {
    return { ok: false, code: "invalid_email" };
  }
  if (!input.consent) {
    return { ok: false, code: "consent_required" };
  }
  return { ok: true };
}

export function validateDeveloperPartnership(input: {
  company: string;
  representative: string;
  phone: string;
  email: string;
  consent: boolean;
}): ValidationResult {
  if (!input.company || !input.representative || (!input.phone && !input.email)) {
    return { ok: false, code: "company_contact_required" };
  }
  if (input.email && !isValidEmail(input.email)) {
    return { ok: false, code: "invalid_email" };
  }
  if (!input.consent) {
    return { ok: false, code: "consent_required" };
  }
  return { ok: true };
}

export function validateAgencyPartnership(input: {
  agencyName: string;
  representative: string;
  phone: string;
  email: string;
  consent: boolean;
}): ValidationResult {
  if (
    !input.agencyName ||
    !input.representative ||
    (!input.phone && !input.email)
  ) {
    return { ok: false, code: "agency_contact_required" };
  }
  if (input.email && !isValidEmail(input.email)) {
    return { ok: false, code: "invalid_email" };
  }
  if (!input.consent) {
    return { ok: false, code: "consent_required" };
  }
  return { ok: true };
}

export function validateListPropertyExtras(input: {
  project: string;
  price: string;
  authorization: boolean;
}): ValidationResult {
  if (!input.project) return { ok: false, code: "project_required" };
  if (!input.price) return { ok: false, code: "price_required" };
  if (!input.authorization) {
    return { ok: false, code: "authorization_required" };
  }
  return { ok: true };
}

export function validateSupportMessage(input: {
  name: string;
  email: string;
  message: string;
  consent: boolean;
}): ValidationResult {
  if (!input.name || !input.email || !input.message) {
    return { ok: false, code: "message_required" };
  }
  if (!isValidEmail(input.email)) {
    return { ok: false, code: "invalid_email" };
  }
  if (!input.consent) {
    return { ok: false, code: "consent_required" };
  }
  return { ok: true };
}

/** Human-visible reference for success UI (not a CRM ticket system). */
export function generateLeadReference(prefix: string): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `GTH-${prefix}-${stamp}${rand}`;
}
