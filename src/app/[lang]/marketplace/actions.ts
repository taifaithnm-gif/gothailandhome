"use server";

import { createMarketplaceLead } from "@/lib/marketplace/leads";

export type MarketplaceFormState = {
  ok: boolean;
  message: string;
};

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function bool(formData: FormData, key: string): boolean {
  const value = formData.get(key);
  return value === "on" || value === "true" || value === "1" || value === "yes";
}

function multi(formData: FormData, key: string): string[] {
  return formData
    .getAll(key)
    .map((item) => String(item).trim())
    .filter(Boolean);
}

export async function submitFindMyHomeLead(
  _prev: MarketplaceFormState,
  formData: FormData,
): Promise<MarketplaceFormState> {
  const name = str(formData, "name");
  const phone = str(formData, "phone");
  const email = str(formData, "email");
  const consent = bool(formData, "consent");

  if (!name || (!phone && !email)) {
    return {
      ok: false,
      message: "Name and at least one of phone or email are required.",
    };
  }
  if (!consent) {
    return { ok: false, message: "Consent is required." };
  }

  const budgetMin = str(formData, "budget_min");
  const budgetMax = str(formData, "budget_max");

  const result = await createMarketplaceLead({
    leadType: "find_home",
    locale: str(formData, "locale") || "en",
    source: "find_my_home_form",
    name,
    phone: phone || null,
    email: email || null,
    lineId: str(formData, "line") || null,
    whatsapp: str(formData, "whatsapp") || null,
    message: str(formData, "notes") || null,
    consent: true,
    payload: {
      buy_or_rent: str(formData, "buy_or_rent"),
      property_type: str(formData, "property_type"),
      preferred_areas: multi(formData, "preferred_areas"),
      preferred_projects: multi(formData, "preferred_projects"),
      bts_mrt_preference: str(formData, "bts_mrt_preference"),
      budget_min: budgetMin || null,
      budget_max: budgetMax || null,
      bedrooms: str(formData, "bedrooms") || null,
      bathrooms: str(formData, "bathrooms") || null,
      move_in_date: str(formData, "move_in_date") || null,
      furnished: str(formData, "furnished") || null,
      pet_friendly: str(formData, "pet_friendly") || null,
      nationality: str(formData, "nationality") || null,
      preferred_language: str(formData, "preferred_language") || null,
      private: true,
      publish: false,
    },
  });

  if (!result.ok) return { ok: false, message: result.message };
  return { ok: true, message: "ok" };
}

export async function submitListYourPropertyLead(
  _prev: MarketplaceFormState,
  formData: FormData,
): Promise<MarketplaceFormState> {
  const name = str(formData, "name");
  const phone = str(formData, "phone");
  const email = str(formData, "email");
  const consent = bool(formData, "consent");
  const authorization = bool(formData, "authorization");

  if (!name || (!phone && !email)) {
    return {
      ok: false,
      message: "Contact name and at least one of phone or email are required.",
    };
  }
  if (!authorization) {
    return {
      ok: false,
      message: "Ownership / authorization confirmation is required.",
    };
  }
  if (!consent) {
    return { ok: false, message: "Consent is required." };
  }

  const result = await createMarketplaceLead({
    leadType: "list_property",
    locale: str(formData, "locale") || "en",
    source: "list_your_property_form",
    name,
    phone: phone || null,
    email: email || null,
    lineId: str(formData, "line") || null,
    whatsapp: str(formData, "whatsapp") || null,
    message: str(formData, "notes") || null,
    consent: true,
    status: "new",
    reviewStatus: "pending_review",
    payload: {
      owner_or_authorized_agent: str(formData, "owner_or_authorized_agent"),
      project: str(formData, "project"),
      property_type: str(formData, "property_type"),
      sale_or_rent: str(formData, "sale_or_rent"),
      price: str(formData, "price"),
      bedrooms: str(formData, "bedrooms") || null,
      bathrooms: str(formData, "bathrooms") || null,
      area: str(formData, "area") || null,
      floor: str(formData, "floor") || null,
      furnishing: str(formData, "furnishing") || null,
      availability: str(formData, "availability") || null,
      authorization_confirmed: true,
      auto_publish: false,
      review_required: true,
    },
  });

  if (!result.ok) return { ok: false, message: result.message };
  return { ok: true, message: "ok" };
}

export async function submitDeveloperPartnershipLead(
  _prev: MarketplaceFormState,
  formData: FormData,
): Promise<MarketplaceFormState> {
  const company = str(formData, "company");
  const representative = str(formData, "representative");
  const phone = str(formData, "phone");
  const email = str(formData, "email");
  const consent = bool(formData, "consent");

  if (!company || !representative || (!phone && !email)) {
    return {
      ok: false,
      message: "Company, representative, and a contact channel are required.",
    };
  }
  if (!consent) {
    return { ok: false, message: "Consent is required." };
  }

  const result = await createMarketplaceLead({
    leadType: "developer_partnership",
    locale: str(formData, "locale") || "en",
    source: "developer_partnership_form",
    name: representative,
    phone: phone || null,
    email: email || null,
    lineId: str(formData, "line") || null,
    whatsapp: str(formData, "whatsapp") || null,
    message: str(formData, "notes") || null,
    consent: true,
    status: "new",
    payload: {
      company,
      official_website: str(formData, "official_website") || null,
      role: str(formData, "role") || null,
      projects: str(formData, "projects") || null,
      cooperation_interest: str(formData, "cooperation_interest") || null,
      pending_platform_review: true,
    },
  });

  if (!result.ok) return { ok: false, message: result.message };
  return { ok: true, message: "ok" };
}

export async function submitAgencyPartnershipLead(
  _prev: MarketplaceFormState,
  formData: FormData,
): Promise<MarketplaceFormState> {
  const agencyName = str(formData, "agency_name");
  const representative = str(formData, "representative");
  const phone = str(formData, "phone");
  const email = str(formData, "email");
  const consent = bool(formData, "consent");

  if (!agencyName || !representative || (!phone && !email)) {
    return {
      ok: false,
      message: "Agency name, representative, and a contact channel are required.",
    };
  }
  if (!consent) {
    return { ok: false, message: "Consent is required." };
  }

  const result = await createMarketplaceLead({
    leadType: "agency_partnership",
    locale: str(formData, "locale") || "en",
    source: "agency_partnership_form",
    name: representative,
    phone: phone || null,
    email: email || null,
    lineId: str(formData, "line") || null,
    whatsapp: str(formData, "whatsapp") || null,
    message: str(formData, "notes") || null,
    consent: true,
    status: "new",
    payload: {
      agency_name: agencyName,
      license_registration: str(formData, "license_registration") || null,
      service_areas: str(formData, "service_areas") || null,
      listing_volume: str(formData, "listing_volume") || null,
      languages: str(formData, "languages") || null,
      pending_platform_review: true,
    },
  });

  if (!result.ok) return { ok: false, message: result.message };
  return { ok: true, message: "ok" };
}

export async function submitViewingRequestLead(
  _prev: MarketplaceFormState,
  formData: FormData,
): Promise<MarketplaceFormState> {
  const name = str(formData, "name");
  const phone = str(formData, "phone");
  const email = str(formData, "email");
  const propertyId = str(formData, "property_id") || null;
  const consent = bool(formData, "consent");

  if (!name || (!phone && !email)) {
    return {
      ok: false,
      message: "Name and at least one of phone or email are required.",
    };
  }
  if (!consent) {
    return { ok: false, message: "Consent is required." };
  }

  const result = await createMarketplaceLead({
    leadType: "viewing_request",
    locale: str(formData, "locale") || "en",
    source: "property_viewing_form",
    name,
    phone: phone || null,
    email: email || null,
    lineId: str(formData, "line") || null,
    whatsapp: str(formData, "whatsapp") || null,
    message: str(formData, "notes") || null,
    propertyId,
    consent: true,
    payload: {
      preferred_datetime: str(formData, "preferred_datetime") || null,
      // Platform support is escalation only — never implied listing ownership.
      uses_listing_contact_first: true,
      platform_support_is_escalation_only: true,
    },
  });

  if (!result.ok) return { ok: false, message: result.message };
  return { ok: true, message: "ok" };
}

export async function submitPlatformSupportLead(
  _prev: MarketplaceFormState,
  formData: FormData,
): Promise<MarketplaceFormState> {
  const name = str(formData, "name");
  const email = str(formData, "email");
  const message = str(formData, "message");
  const consent = bool(formData, "consent");

  if (!name || !email || !message) {
    return { ok: false, message: "Name, email, and message are required." };
  }
  if (!consent) {
    return { ok: false, message: "Consent is required." };
  }

  const result = await createMarketplaceLead({
    leadType: "platform_support",
    locale: str(formData, "locale") || "en",
    source: "contact_page_platform_support",
    name,
    email,
    phone: str(formData, "phone") || null,
    message,
    consent: true,
    payload: {
      channel: "platform_customer_success",
      not_listing_owner: true,
    },
  });

  if (!result.ok) return { ok: false, message: result.message };
  return { ok: true, message: "ok" };
}
