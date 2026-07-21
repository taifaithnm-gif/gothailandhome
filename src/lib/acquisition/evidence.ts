/**
 * P2-032 — Evidence checklist for acquisition publish.
 * Aligns with Phase 1 honesty: never invent missing facts.
 */

export type EvidenceItemId =
  | "contact_consent"
  | "authorization"
  | "property_identity"
  | "pricing_stated"
  | "location_stated"
  | "media_or_placeholder_ack"
  | "source_attribution";

export type EvidenceItem = {
  id: EvidenceItemId;
  requiredForPublish: boolean;
  description: string;
};

export const ACQUISITION_EVIDENCE_CHECKLIST: EvidenceItem[] = [
  {
    id: "contact_consent",
    requiredForPublish: true,
    description: "Submitter consent recorded",
  },
  {
    id: "authorization",
    requiredForPublish: true,
    description: "Owner or authorized-agent confirmation",
  },
  {
    id: "property_identity",
    requiredForPublish: true,
    description: "Project/building or identifiable address/title provided",
  },
  {
    id: "pricing_stated",
    requiredForPublish: true,
    description: "Price present as stated by submitter (not estimated)",
  },
  {
    id: "location_stated",
    requiredForPublish: true,
    description: "City/district/location text present (may map later)",
  },
  {
    id: "media_or_placeholder_ack",
    requiredForPublish: false,
    description: "Media attached or honest empty-media acknowledged",
  },
  {
    id: "source_attribution",
    requiredForPublish: true,
    description: "Source channel recorded (form/partner)",
  },
];

export type EvidenceSatisfaction = Record<EvidenceItemId, boolean>;

export function emptyEvidenceSatisfaction(): EvidenceSatisfaction {
  return {
    contact_consent: false,
    authorization: false,
    property_identity: false,
    pricing_stated: false,
    location_stated: false,
    media_or_placeholder_ack: false,
    source_attribution: false,
  };
}

export function missingRequiredEvidence(
  sat: EvidenceSatisfaction,
): EvidenceItemId[] {
  return ACQUISITION_EVIDENCE_CHECKLIST.filter(
    (item) => item.requiredForPublish && !sat[item.id],
  ).map((item) => item.id);
}

export function canPublishWithEvidence(sat: EvidenceSatisfaction): boolean {
  return missingRequiredEvidence(sat).length === 0;
}

/** Map form payload fields → evidence satisfaction (honest nulls stay false). */
export function evidenceFromIntakePayload(payload: {
  consent?: boolean;
  authorization?: boolean;
  project?: string | null;
  price?: string | null;
  location?: string | null;
  propertyType?: string | null;
  hasMedia?: boolean;
  source?: string | null;
}): EvidenceSatisfaction {
  const sat = emptyEvidenceSatisfaction();
  sat.contact_consent = Boolean(payload.consent);
  sat.authorization = Boolean(payload.authorization);
  sat.property_identity = Boolean(
    (payload.project && payload.project.trim()) ||
      (payload.propertyType && payload.propertyType.trim()),
  );
  sat.pricing_stated = Boolean(payload.price && String(payload.price).trim());
  sat.location_stated = Boolean(
    payload.location && String(payload.location).trim(),
  );
  sat.media_or_placeholder_ack = Boolean(payload.hasMedia) || true; // Phase 2B allows placeholder ack by default
  sat.source_attribution = Boolean(payload.source && payload.source.trim());
  return sat;
}
