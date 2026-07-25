/**
 * Thailand province validation for staging import.
 */

const PROVINCES_EN = [
  "Bangkok",
  "Amnat Charoen",
  "Ang Thong",
  "Bueng Kan",
  "Buriram",
  "Chachoengsao",
  "Chai Nat",
  "Chaiyaphum",
  "Chanthaburi",
  "Chiang Mai",
  "Chiang Rai",
  "Chonburi",
  "Chumphon",
  "Kalasin",
  "Kamphaeng Phet",
  "Kanchanaburi",
  "Khon Kaen",
  "Krabi",
  "Lampang",
  "Lamphun",
  "Loei",
  "Lopburi",
  "Mae Hong Son",
  "Maha Sarakham",
  "Mukdahan",
  "Nakhon Nayok",
  "Nakhon Pathom",
  "Nakhon Phanom",
  "Nakhon Ratchasima",
  "Nakhon Sawan",
  "Nakhon Si Thammarat",
  "Nan",
  "Narathiwat",
  "Nong Bua Lamphu",
  "Nong Khai",
  "Nonthaburi",
  "Pathum Thani",
  "Pattani",
  "Phang Nga",
  "Phatthalung",
  "Phayao",
  "Phetchabun",
  "Phetchaburi",
  "Phichit",
  "Phitsanulok",
  "Phra Nakhon Si Ayutthaya",
  "Phrae",
  "Phuket",
  "Prachinburi",
  "Prachuap Khiri Khan",
  "Ranong",
  "Ratchaburi",
  "Rayong",
  "Roi Et",
  "Sa Kaeo",
  "Sakon Nakhon",
  "Samut Prakan",
  "Samut Sakhon",
  "Samut Songkhram",
  "Saraburi",
  "Satun",
  "Sing Buri",
  "Sisaket",
  "Songkhla",
  "Sukhothai",
  "Suphan Buri",
  "Surat Thani",
  "Surin",
  "Tak",
  "Trang",
  "Trat",
  "Ubon Ratchathani",
  "Udon Thani",
  "Uthai Thani",
  "Uttaradit",
  "Yala",
  "Yasothon",
] as const;

/** Common aliases / romanization variants → canonical EN name. */
const ALIASES: Record<string, string> = {
  bangkok: "Bangkok",
  "krung thep": "Bangkok",
  "krung thep maha nakhon": "Bangkok",
  chonburi: "Chonburi",
  "chon buri": "Chonburi",
  phuket: "Phuket",
  "chiang mai": "Chiang Mai",
  chiangmai: "Chiang Mai",
  "chiang rai": "Chiang Rai",
  nonthaburi: "Nonthaburi",
  "samut prakan": "Samut Prakan",
  "pathum thani": "Pathum Thani",
  rayong: "Rayong",
  pattaya: "Chonburi",
  "hua hin": "Prachuap Khiri Khan",
  // Thai-script aliases (Windows01 Goth Batch)
  กรุงเทพ: "Bangkok",
  กรุงเทพมหานคร: "Bangkok",
  พัทยา: "Chonburi",
  ชลบุรี: "Chonburi",
  สระบุรี: "Saraburi",
  หัวหิน: "Prachuap Khiri Khan",
  ประจวบคีรีขันธ์: "Prachuap Khiri Khan",
  ระยอง: "Rayong",
  ภูเก็ต: "Phuket",
  เชียงใหม่: "Chiang Mai",
};

function normalize(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const CANONICAL = new Map(
  PROVINCES_EN.map((p) => [normalize(p), p] as const),
);

export type ProvinceValidationResult = {
  ok: boolean;
  input: string | null | undefined;
  canonical: string | null;
  unknown: boolean;
  aliasUsed: boolean;
  code: "OK" | "UNKNOWN" | "EMPTY" | "LOW_CONFIDENCE_ALIAS";
};

export function listProvinces(): readonly string[] {
  return PROVINCES_EN;
}

export function validateProvince(
  input: string | null | undefined,
): ProvinceValidationResult {
  if (input == null || !String(input).trim()) {
    return {
      ok: false,
      input,
      canonical: null,
      unknown: true,
      aliasUsed: false,
      code: "EMPTY",
    };
  }
  const key = normalize(input);
  const direct = CANONICAL.get(key);
  if (direct) {
    return {
      ok: true,
      input,
      canonical: direct,
      unknown: false,
      aliasUsed: false,
      code: "OK",
    };
  }
  const alias = ALIASES[key];
  if (alias) {
    return {
      ok: true,
      input,
      canonical: alias,
      unknown: false,
      aliasUsed: true,
      code: key === "pattaya" || key === "hua hin" || key === "พัทยา" || key === "หัวหิน"
        ? "LOW_CONFIDENCE_ALIAS"
        : "OK",
    };
  }
  return {
    ok: false,
    input,
    canonical: null,
    unknown: true,
    aliasUsed: false,
    code: "UNKNOWN",
  };
}

export function isKnownProvince(input: string | null | undefined): boolean {
  return validateProvince(input).ok;
}
