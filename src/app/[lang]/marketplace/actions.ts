"use server";

import { redirect } from "next/navigation";

import { createMarketplaceLead } from "@/lib/marketplace/leads";
import {
  generateLeadReference,
  isChecked,
  normalizeField,
  validateAgencyPartnership,
  validateContactBasics,
  validateDeveloperPartnership,
  validateListPropertyExtras,
  validateSupportMessage,
  type MarketplaceValidationCode,
} from "@/lib/marketplace/form-validation";
import {
  LEAD_CHANNEL_PREFIX,
  type LeadChannel,
  type LeadSubmitMode,
} from "@/lib/leads/channels";
import {
  readLeadContextFromForm,
  type LeadContext,
} from "@/lib/leads/context";
import { buildLeadSuccessPath } from "@/lib/leads/urls";

export type MarketplaceFormState = {
  ok: boolean;
  message: string;
  errorCode?: MarketplaceValidationCode | "storage_unavailable" | null;
  reference?: string | null;
  mode?: LeadSubmitMode | null;
};

function multi(formData: FormData, key: string): string[] {
  return formData
    .getAll(key)
    .map((item) => String(item).trim())
    .filter(Boolean);
}

function fail(
  code: MarketplaceValidationCode,
): MarketplaceFormState {
  return { ok: false, message: code, errorCode: code, reference: null, mode: null };
}

/**
 * Placeholder-safe submit → shared Lead success page.
 * No email / CRM automation. Validation failures stay on the form.
 */
async function finalizeLead(
  channel: LeadChannel,
  localeRaw: string,
  create: () => ReturnType<typeof createMarketplaceLead>,
  context?: LeadContext | null,
): Promise<never> {
  const locale = localeRaw || "en";
  const reference = generateLeadReference(LEAD_CHANNEL_PREFIX[channel]);
  const result = await create();
  const mode: LeadSubmitMode = result.ok ? "stored" : "placeholder";
  redirect(buildLeadSuccessPath(locale, channel, reference, mode, context));
}

export async function submitFindMyHomeLead(
  _prev: MarketplaceFormState,
  formData: FormData,
): Promise<MarketplaceFormState> {
  const name = normalizeField(formData.get("name"));
  const phone = normalizeField(formData.get("phone"));
  const email = normalizeField(formData.get("email"));
  const consent = isChecked(formData.get("consent"));
  const locale = normalizeField(formData.get("locale")) || "en";

  const basics = validateContactBasics({ name, phone, email, consent });
  if (!basics.ok) return fail(basics.code);

  const budgetMin = normalizeField(formData.get("budget_min"));
  const budgetMax = normalizeField(formData.get("budget_max"));

  return finalizeLead("find_my_home", locale, () =>
    createMarketplaceLead({
      leadType: "find_home",
      locale,
      source: "find_my_home_form",
      name,
      phone: phone || null,
      email: email || null,
      lineId: normalizeField(formData.get("line")) || null,
      whatsapp: normalizeField(formData.get("whatsapp")) || null,
      message: normalizeField(formData.get("notes")) || null,
      consent: true,
      payload: {
        buy_or_rent: normalizeField(formData.get("buy_or_rent")),
        property_type: normalizeField(formData.get("property_type")),
        preferred_areas: multi(formData, "preferred_areas"),
        preferred_projects: multi(formData, "preferred_projects"),
        bts_mrt_preference: normalizeField(formData.get("bts_mrt_preference")),
        budget_min: budgetMin || null,
        budget_max: budgetMax || null,
        bedrooms: normalizeField(formData.get("bedrooms")) || null,
        bathrooms: normalizeField(formData.get("bathrooms")) || null,
        move_in_date: normalizeField(formData.get("move_in_date")) || null,
        furnished: normalizeField(formData.get("furnished")) || null,
        pet_friendly: normalizeField(formData.get("pet_friendly")) || null,
        nationality: normalizeField(formData.get("nationality")) || null,
        preferred_language:
          normalizeField(formData.get("preferred_language")) || null,
        private: true,
        publish: false,
      },
    }),
  );
}

export async function submitListYourPropertyLead(
  _prev: MarketplaceFormState,
  formData: FormData,
): Promise<MarketplaceFormState> {
  const name = normalizeField(formData.get("name"));
  const phone = normalizeField(formData.get("phone"));
  const email = normalizeField(formData.get("email"));
  const consent = isChecked(formData.get("consent"));
  const authorization = isChecked(formData.get("authorization"));
  const project = normalizeField(formData.get("project"));
  const price = normalizeField(formData.get("price"));
  const locale = normalizeField(formData.get("locale")) || "en";

  const basics = validateContactBasics({ name, phone, email, consent });
  if (!basics.ok) return fail(basics.code);

  const extras = validateListPropertyExtras({
    project,
    price,
    authorization,
  });
  if (!extras.ok) return fail(extras.code);

  const payload = {
    owner_or_authorized_agent: normalizeField(
      formData.get("owner_or_authorized_agent"),
    ),
    project,
    property_type: normalizeField(formData.get("property_type")),
    sale_or_rent: normalizeField(formData.get("sale_or_rent")),
    price,
    bedrooms: normalizeField(formData.get("bedrooms")) || null,
    bathrooms: normalizeField(formData.get("bathrooms")) || null,
    area: normalizeField(formData.get("area")) || null,
    floor: normalizeField(formData.get("floor")) || null,
    furnishing: normalizeField(formData.get("furnishing")) || null,
    availability: normalizeField(formData.get("availability")) || null,
    authorization_confirmed: true,
    auto_publish: false,
    review_required: true,
    notes: normalizeField(formData.get("notes")) || null,
  };

  const { isPhase2AcquisitionEnabled } = await import(
    "@/lib/feature-flags"
  );
  const { createAcquisitionCase } = await import(
    "@/lib/acquisition/service"
  );

  const reference = generateLeadReference(LEAD_CHANNEL_PREFIX.list_your_property);
  const leadResult = await createMarketplaceLead({
    leadType: "list_property",
    locale,
    source: "list_your_property_form",
    name,
    phone: phone || null,
    email: email || null,
    lineId: normalizeField(formData.get("line")) || null,
    whatsapp: normalizeField(formData.get("whatsapp")) || null,
    message: normalizeField(formData.get("notes")) || null,
    consent: true,
    status: "new",
    reviewStatus: "pending_review",
    payload,
  });

  let acquisitionCaseId: string | null = null;
  if (isPhase2AcquisitionEnabled()) {
    const acq = await createAcquisitionCase({
      locale,
      source: "list_your_property_form",
      submitterName: name,
      submitterEmail: email || null,
      submitterPhone: phone || null,
      payload: {
        ...payload,
        message: normalizeField(formData.get("notes")) || null,
      },
    });
    if (acq.ok) acquisitionCaseId = acq.id;
  }

  const mode: LeadSubmitMode = leadResult.ok ? "stored" : "placeholder";
  const successPath = buildLeadSuccessPath(
    locale,
    "list_your_property",
    reference,
    mode,
  );
  if (acquisitionCaseId) {
    redirect(`${successPath}&acquisition=${acquisitionCaseId}`);
  }
  redirect(successPath);
}

export async function submitDeveloperPartnershipLead(
  _prev: MarketplaceFormState,
  formData: FormData,
): Promise<MarketplaceFormState> {
  const company = normalizeField(formData.get("company"));
  const representative = normalizeField(formData.get("representative"));
  const phone = normalizeField(formData.get("phone"));
  const email = normalizeField(formData.get("email"));
  const consent = isChecked(formData.get("consent"));
  const locale = normalizeField(formData.get("locale")) || "en";

  const check = validateDeveloperPartnership({
    company,
    representative,
    phone,
    email,
    consent,
  });
  if (!check.ok) return fail(check.code);

  return finalizeLead("developer_partnership", locale, () =>
    createMarketplaceLead({
      leadType: "developer_partnership",
      locale,
      source: "developer_partnership_form",
      name: representative,
      phone: phone || null,
      email: email || null,
      lineId: normalizeField(formData.get("line")) || null,
      whatsapp: normalizeField(formData.get("whatsapp")) || null,
      message: normalizeField(formData.get("notes")) || null,
      consent: true,
      status: "new",
      payload: {
        company,
        official_website:
          normalizeField(formData.get("official_website")) || null,
        role: normalizeField(formData.get("role")) || null,
        projects: normalizeField(formData.get("projects")) || null,
        cooperation_interest:
          normalizeField(formData.get("cooperation_interest")) || null,
        pending_platform_review: true,
      },
    }),
  );
}

export async function submitAgencyPartnershipLead(
  _prev: MarketplaceFormState,
  formData: FormData,
): Promise<MarketplaceFormState> {
  const agencyName = normalizeField(formData.get("agency_name"));
  const representative = normalizeField(formData.get("representative"));
  const phone = normalizeField(formData.get("phone"));
  const email = normalizeField(formData.get("email"));
  const consent = isChecked(formData.get("consent"));
  const locale = normalizeField(formData.get("locale")) || "en";

  const check = validateAgencyPartnership({
    agencyName,
    representative,
    phone,
    email,
    consent,
  });
  if (!check.ok) return fail(check.code);

  return finalizeLead("agency_partnership", locale, () =>
    createMarketplaceLead({
      leadType: "agency_partnership",
      locale,
      source: "agency_partnership_form",
      name: representative,
      phone: phone || null,
      email: email || null,
      lineId: normalizeField(formData.get("line")) || null,
      whatsapp: normalizeField(formData.get("whatsapp")) || null,
      message: normalizeField(formData.get("notes")) || null,
      consent: true,
      status: "new",
      payload: {
        agency_name: agencyName,
        license_registration:
          normalizeField(formData.get("license_registration")) || null,
        service_areas: normalizeField(formData.get("service_areas")) || null,
        listing_volume: normalizeField(formData.get("listing_volume")) || null,
        languages: normalizeField(formData.get("languages")) || null,
        pending_platform_review: true,
      },
    }),
  );
}

export async function submitViewingRequestLead(
  _prev: MarketplaceFormState,
  formData: FormData,
): Promise<MarketplaceFormState> {
  const name = normalizeField(formData.get("name"));
  const phone = normalizeField(formData.get("phone"));
  const email = normalizeField(formData.get("email"));
  const propertyId = normalizeField(formData.get("property_id")) || null;
  const propertySlug = normalizeField(formData.get("property_slug")) || null;
  const propertyTitle = normalizeField(formData.get("property_title")) || null;
  const consent = isChecked(formData.get("consent"));
  const locale = normalizeField(formData.get("locale")) || "en";

  const basics = validateContactBasics({ name, phone, email, consent });
  if (!basics.ok) return fail(basics.code);

  // Allowlisted, validated public source context only (no private payload).
  const context = readLeadContextFromForm(formData);

  return finalizeLead(
    "viewing_request",
    locale,
    () =>
      createMarketplaceLead({
        leadType: "viewing_request",
        locale,
        source: "property_viewing_form",
        name,
        phone: phone || null,
        email: email || null,
        lineId: normalizeField(formData.get("line")) || null,
        whatsapp: normalizeField(formData.get("whatsapp")) || null,
        message: normalizeField(formData.get("notes")) || null,
        propertyId,
        consent: true,
        payload: {
          preferred_datetime:
            normalizeField(formData.get("preferred_datetime")) || null,
          property_slug: propertySlug,
          property_title: propertyTitle,
          uses_listing_contact_first: true,
          platform_support_is_escalation_only: true,
        },
      }),
    context,
  );
}

/** Platform CS remains on shared validation; success stays inline (not one of the five entry channels). */
export async function submitPlatformSupportLead(
  _prev: MarketplaceFormState,
  formData: FormData,
): Promise<MarketplaceFormState> {
  const name = normalizeField(formData.get("name"));
  const email = normalizeField(formData.get("email"));
  const message = normalizeField(formData.get("message"));
  const consent = isChecked(formData.get("consent"));
  const locale = normalizeField(formData.get("locale")) || "en";

  const check = validateSupportMessage({ name, email, message, consent });
  if (!check.ok) return fail(check.code);

  const reference = generateLeadReference("PCS");
  const result = await createMarketplaceLead({
    leadType: "platform_support",
    locale,
    source: "contact_page_platform_support",
    name,
    email,
    phone: normalizeField(formData.get("phone")) || null,
    message,
    consent: true,
    payload: {
      channel: "platform_customer_success",
      not_listing_owner: true,
    },
  });

  return {
    ok: true,
    message: "ok",
    errorCode: null,
    reference,
    mode: result.ok ? "stored" : "placeholder",
  };
}
