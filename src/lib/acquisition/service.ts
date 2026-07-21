import "server-only";

import { randomUUID } from "node:crypto";

import {
  canTransitionAcquisition,
  isAcquisitionStatus,
  type AcquisitionStatus,
} from "@/lib/acquisition/state-machine";
import {
  canPublishWithEvidence,
  evidenceFromIntakePayload,
  type EvidenceSatisfaction,
} from "@/lib/acquisition/evidence";
import {
  buildDraftPropertyFromCase,
  type AcquisitionCaseSnapshot,
} from "@/lib/acquisition/publish-bridge";
import { isPhase2AcquisitionEnabled } from "@/lib/feature-flags";
import { createClient } from "@/lib/supabase/server";

const RATE_WINDOW_MS = 60 * 60 * 1000;
const RATE_MAX_PER_EMAIL = 5;

export type CreateAcquisitionCaseInput = {
  locale: string;
  source: string;
  submitterName?: string | null;
  submitterEmail?: string | null;
  submitterPhone?: string | null;
  marketplaceLeadId?: string | null;
  customerUserId?: string | null;
  payload: Record<string, unknown>;
};

export async function assertAcquisitionRateLimit(email: string | null): Promise<
  | { ok: true }
  | { ok: false; message: string }
> {
  if (!email) return { ok: true };
  const supabase = await createClient();
  const since = new Date(Date.now() - RATE_WINDOW_MS).toISOString();
  const { count, error } = await supabase
    .from("acquisition_cases")
    .select("id", { count: "exact", head: true })
    .eq("submitter_email", email)
    .gte("created_at", since);
  // If table missing / RLS blocks count, fail open for ops apply later but still allow local.
  if (error) return { ok: true };
  if ((count ?? 0) >= RATE_MAX_PER_EMAIL) {
    return { ok: false, message: "Rate limit exceeded. Try again later." };
  }
  return { ok: true };
}

export async function createAcquisitionCase(
  input: CreateAcquisitionCaseInput,
): Promise<{ ok: true; id: string } | { ok: false; message: string }> {
  if (!isPhase2AcquisitionEnabled()) {
    return { ok: false, message: "Acquisition feature disabled." };
  }

  const email = input.submitterEmail?.trim().toLowerCase() || null;
  const rate = await assertAcquisitionRateLimit(email);
  if (!rate.ok) return rate;

  const payload = input.payload ?? {};
  const evidence = evidenceFromIntakePayload({
    consent: true,
    authorization: Boolean(payload.authorization_confirmed),
    project: typeof payload.project === "string" ? payload.project : null,
    price: typeof payload.price === "string" ? payload.price : null,
    location:
      typeof payload.location === "string"
        ? payload.location
        : typeof payload.project === "string"
          ? payload.project
          : null,
    propertyType:
      typeof payload.property_type === "string" ? payload.property_type : null,
    hasMedia: false,
    source: input.source,
  });

  const id = randomUUID();
  const supabase = await createClient();
  const { error } = await supabase.from("acquisition_cases").insert({
    id,
    status: "submitted",
    locale: input.locale || "en",
    source: input.source,
    submitter_name: input.submitterName ?? null,
    submitter_email: email,
    submitter_phone: input.submitterPhone ?? null,
    marketplace_lead_id: input.marketplaceLeadId ?? null,
    customer_user_id: input.customerUserId ?? null,
    payload,
    evidence,
    title_hint:
      typeof payload.project === "string" ? payload.project.slice(0, 160) : null,
    property_type:
      typeof payload.property_type === "string" ? payload.property_type : null,
    listing_type:
      typeof payload.sale_or_rent === "string" ? payload.sale_or_rent : null,
    price_text: typeof payload.price === "string" ? payload.price : null,
    project_name: typeof payload.project === "string" ? payload.project : null,
    bedrooms_text:
      typeof payload.bedrooms === "string" ? payload.bedrooms : null,
    bathrooms_text:
      typeof payload.bathrooms === "string" ? payload.bathrooms : null,
    area_text: typeof payload.area === "string" ? payload.area : null,
    notes:
      typeof payload.notes === "string"
        ? payload.notes
        : typeof input.payload.message === "string"
          ? input.payload.message
          : null,
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true, id };
}

export async function transitionAcquisitionCase(input: {
  caseId: string;
  toStatus: string;
  actorUserId: string;
  note?: string | null;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!isAcquisitionStatus(input.toStatus)) {
    return { ok: false, message: "Invalid status." };
  }
  const supabase = await createClient();
  const { data: current } = await supabase
    .from("acquisition_cases")
    .select("id, status, evidence")
    .eq("id", input.caseId)
    .maybeSingle();
  if (!current) return { ok: false, message: "Case not found." };

  const from = current.status as AcquisitionStatus;
  if (!canTransitionAcquisition(from, input.toStatus, "ops")) {
    return { ok: false, message: "Illegal transition." };
  }

  if (input.toStatus === "approved" || input.toStatus === "published") {
    const evidence = (current.evidence ?? {}) as EvidenceSatisfaction;
    if (!canPublishWithEvidence(evidence)) {
      return { ok: false, message: "Required evidence incomplete." };
    }
  }

  const { error } = await supabase
    .from("acquisition_cases")
    .update({
      status: input.toStatus,
      status_changed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.caseId);
  if (error) return { ok: false, message: error.message };

  await supabase.from("acquisition_events").insert({
    case_id: input.caseId,
    actor_user_id: input.actorUserId,
    event_type: "status_change",
    from_status: from,
    to_status: input.toStatus,
    note: input.note ?? null,
  });

  return { ok: true };
}

export async function publishAcquisitionCase(input: {
  caseId: string;
  actorUserId: string;
  locationId: string;
  publishNow?: boolean;
}): Promise<
  | { ok: true; propertyId: string }
  | { ok: false; message: string }
> {
  const supabase = await createClient();
  const { data: caseRow } = await supabase
    .from("acquisition_cases")
    .select("*")
    .eq("id", input.caseId)
    .maybeSingle();
  if (!caseRow) return { ok: false, message: "Case not found." };

  const evidence = (caseRow.evidence ?? {}) as EvidenceSatisfaction;
  if (!canPublishWithEvidence(evidence)) {
    return { ok: false, message: "Required evidence incomplete." };
  }

  const snapshot: AcquisitionCaseSnapshot = {
    id: caseRow.id,
    titleHint: caseRow.title_hint,
    propertyType: caseRow.property_type,
    listingType: caseRow.listing_type,
    priceText: caseRow.price_text,
    projectName: caseRow.project_name,
    bedroomsText: caseRow.bedrooms_text,
    bathroomsText: caseRow.bathrooms_text,
    areaText: caseRow.area_text,
    locale: caseRow.locale,
    submitterName: caseRow.submitter_name,
    notes: caseRow.notes,
  };

  const bridge = buildDraftPropertyFromCase(snapshot, input.locationId);
  if ("error" in bridge) return { ok: false, message: bridge.error };

  const status = input.publishNow ? "published" : "draft";
  const { data: property, error } = await supabase
    .from("properties")
    .insert({
      slug: bridge.slug,
      status,
      listing_type: bridge.listing_type,
      property_type: bridge.property_type,
      location_id: bridge.location_id,
      price_thb: bridge.price_thb,
      bedrooms: bridge.bedrooms,
      bathrooms: bridge.bathrooms,
      area_sqm: bridge.area_sqm,
      title_en: bridge.title_en,
      title_zh: bridge.title_zh,
      title_th: bridge.title_th,
      summary_en: bridge.summary_en,
      summary_zh: bridge.summary_zh,
      summary_th: bridge.summary_th,
      description_en: bridge.description_en,
      description_zh: bridge.description_zh,
      description_th: bridge.description_th,
      featured: false,
      created_by: input.actorUserId,
      published_at: status === "published" ? new Date().toISOString() : null,
      source: "acquisition_bridge",
      external_ref: `acquisition:${input.caseId}`,
    })
    .select("id")
    .maybeSingle();

  if (error || !property) {
    return { ok: false, message: error?.message ?? "Property create failed." };
  }

  await supabase
    .from("acquisition_cases")
    .update({
      status: status === "published" ? "published" : "approved",
      linked_property_id: property.id,
      status_changed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.caseId);

  await supabase.from("acquisition_events").insert({
    case_id: input.caseId,
    actor_user_id: input.actorUserId,
    event_type: "publish_bridge",
    to_status: status === "published" ? "published" : "approved",
    note: `Linked property ${property.id} as ${status}`,
  });

  return { ok: true, propertyId: property.id };
}

export async function unpublishLinkedProperty(input: {
  caseId: string;
  actorUserId: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = await createClient();
  const { data: caseRow } = await supabase
    .from("acquisition_cases")
    .select("id, linked_property_id, status")
    .eq("id", input.caseId)
    .maybeSingle();
  if (!caseRow?.linked_property_id) {
    return { ok: false, message: "No linked property." };
  }

  await supabase
    .from("properties")
    .update({ status: "draft" })
    .eq("id", caseRow.linked_property_id);

  const transition = await transitionAcquisitionCase({
    caseId: input.caseId,
    toStatus: "rejected",
    actorUserId: input.actorUserId,
    note: "Unpublish rollback — property set to draft",
  });
  return transition;
}
