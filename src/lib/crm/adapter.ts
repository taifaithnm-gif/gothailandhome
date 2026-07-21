import { createHmac, timingSafeEqual } from "node:crypto";

export type CrmLeadPayload = {
  external_id: string;
  channel: "gothailandhome";
  lead_type: string;
  status: string;
  email: string | null;
  name: string | null;
  locale: string | null;
  phone?: string | null;
  message?: string | null;
};

export function mapLeadToCrmPayload(input: {
  id: string;
  leadType: string;
  status: string;
  email?: string | null;
  name?: string | null;
  locale?: string | null;
  phone?: string | null;
  message?: string | null;
}): CrmLeadPayload {
  return {
    external_id: input.id,
    channel: "gothailandhome",
    lead_type: input.leadType,
    status: input.status,
    email: input.email ?? null,
    name: input.name ?? null,
    locale: input.locale ?? null,
    phone: input.phone ?? null,
    message: input.message ?? null,
  };
}

export function verifyCrmWebhookSignature(
  body: string,
  signatureHeader: string | null | undefined,
  secret: string,
): boolean {
  if (!signatureHeader || !secret) return false;
  const expected = createHmac("sha256", secret).update(body).digest("hex");
  const provided = signatureHeader.replace(/^sha256=/i, "").trim();
  try {
    const a = Buffer.from(expected, "utf8");
    const b = Buffer.from(provided, "utf8");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function signCrmBody(body: string, secret: string): string {
  return createHmac("sha256", secret).update(body).digest("hex");
}
