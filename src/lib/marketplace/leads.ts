import "server-only";

import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export type MarketplaceLeadType =
  | "find_home"
  | "list_property"
  | "viewing_request"
  | "developer_partnership"
  | "agency_partnership"
  | "platform_support";

export type MarketplaceLeadStatus =
  | "new"
  | "qualified"
  | "assigned"
  | "contacted"
  | "viewing_scheduled"
  | "negotiating"
  | "won"
  | "lost"
  | "spam"
  | "archived";

export type MarketplaceReviewStatus =
  | "not_applicable"
  | "pending_review"
  | "approved"
  | "rejected";

export type CreateMarketplaceLeadInput = {
  leadType: MarketplaceLeadType;
  source?: string;
  locale?: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  lineId?: string | null;
  whatsapp?: string | null;
  message?: string | null;
  payload?: Record<string, unknown>;
  propertyId?: string | null;
  projectId?: string | null;
  consent: boolean;
  assignedTo?: string | null;
  status?: MarketplaceLeadStatus;
  reviewStatus?: MarketplaceReviewStatus;
  /** Optional Phase 2 account linkage (ignored if column absent). */
  customerUserId?: string | null;
};

export type CreateMarketplaceLeadResult =
  | { ok: true; id: string }
  | { ok: false; message: string };

/**
 * Create a private marketplace lead. Never publishes demand or owner listings.
 * list_property leads always enter pending_review (DB before-insert trigger).
 */
export async function createMarketplaceLead(
  input: CreateMarketplaceLeadInput,
): Promise<CreateMarketplaceLeadResult> {
  if (!hasSupabaseEnv()) {
    return { ok: false, message: "Lead storage is not configured." };
  }

  if (!input.consent) {
    return { ok: false, message: "Consent is required." };
  }

  const reviewStatus: MarketplaceReviewStatus =
    input.leadType === "list_property"
      ? "pending_review"
      : (input.reviewStatus ?? "not_applicable");

  const supabase = await createClient();
  const { error } = await supabase.from("marketplace_leads").insert({
    lead_type: input.leadType,
    status: input.status ?? "new",
    review_status: reviewStatus,
    source: input.source ?? "web_form",
    assigned_to: input.assignedTo ?? null,
    locale: input.locale ?? "en",
    name: input.name?.trim() || null,
    email: input.email?.trim() || null,
    phone: input.phone?.trim() || null,
    line_id: input.lineId?.trim() || null,
    whatsapp: input.whatsapp?.trim() || null,
    message: input.message?.trim() || null,
    payload: input.payload ?? {},
    property_id: input.propertyId ?? null,
    project_id: input.projectId ?? null,
    consent: true,
    consent_at: new Date().toISOString(),
    ...(input.customerUserId
      ? { customer_user_id: input.customerUserId }
      : {}),
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  // Anon RLS allows insert but not select — do not require returning the row.
  return { ok: true, id: "submitted" };
}
