/**
 * P2-070–075 — L0 recommendation rules (no LLM).
 * Only cites evidenced listing fields. Null fields never claimed.
 */

export type RecommendCandidate = {
  id: string;
  slug: string;
  titleEn: string;
  listingType: string;
  propertyType: string;
  priceThb: number;
  districtSlug: string | null;
  bedrooms: number | null;
};

export type RecommendReasonCode =
  | "same_district"
  | "same_listing_type"
  | "same_property_type"
  | "similar_price_band"
  | "similar_bedrooms";

export type RecommendHit = {
  candidate: RecommendCandidate;
  score: number;
  reasons: RecommendReasonCode[];
};

const PRICE_BAND = 0.25; // ±25%

export function recommendSimilarL0(
  seed: RecommendCandidate,
  pool: RecommendCandidate[],
  limit = 6,
): RecommendHit[] {
  const hits: RecommendHit[] = [];
  for (const candidate of pool) {
    if (candidate.id === seed.id || candidate.slug === seed.slug) continue;
    const reasons: RecommendReasonCode[] = [];
    let score = 0;

    if (
      seed.districtSlug &&
      candidate.districtSlug &&
      seed.districtSlug === candidate.districtSlug
    ) {
      reasons.push("same_district");
      score += 4;
    }
    if (seed.listingType && seed.listingType === candidate.listingType) {
      reasons.push("same_listing_type");
      score += 2;
    }
    if (seed.propertyType && seed.propertyType === candidate.propertyType) {
      reasons.push("same_property_type");
      score += 2;
    }
    if (seed.priceThb > 0 && candidate.priceThb > 0) {
      const delta = Math.abs(candidate.priceThb - seed.priceThb) / seed.priceThb;
      if (delta <= PRICE_BAND) {
        reasons.push("similar_price_band");
        score += 3;
      }
    }
    if (
      seed.bedrooms != null &&
      candidate.bedrooms != null &&
      seed.bedrooms === candidate.bedrooms
    ) {
      reasons.push("similar_bedrooms");
      score += 1;
    }

    if (reasons.length === 0) continue;
    hits.push({ candidate, score, reasons });
  }

  return hits
    .sort((a, b) => b.score - a.score || a.candidate.slug.localeCompare(b.candidate.slug))
    .slice(0, limit);
}

export function explainReasons(reasons: RecommendReasonCode[]): string {
  return reasons
    .map((r) => {
      switch (r) {
        case "same_district":
          return "Same district (evidenced)";
        case "same_listing_type":
          return "Same sale/rent type";
        case "same_property_type":
          return "Same property type";
        case "similar_price_band":
          return "Similar stated price band (±25%)";
        case "similar_bedrooms":
          return "Same bedroom count (when known)";
        default:
          return r;
      }
    })
    .join("; ");
}

export const AI_RECOMMEND_DISCLAIMER =
  "Suggestions use listing filters only (L0 rules). Not a valuation or guarantee. Missing fields are never invented.";
