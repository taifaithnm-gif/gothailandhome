/**
 * BATCH_CONTRACT_V1 sealed ZIP verifier.
 * Port of Windows01 `providers.goth.batch_freeze.verify_sealed_zip`.
 *
 * Contract digest:
 *   sha256(ZIP bytes with zip_sha256 / zip_size zeroed + STORED CRC refreshed)
 *
 * raw_zip_sha256 is observational only — never the contract authority.
 */
import { createHash } from "node:crypto";
import fs from "node:fs";

export const ZIP_SHA256_PLACEHOLDER = "0".repeat(64);
export const ZIP_SIZE_WIDTH = 20;

export const LAX_HASH_PATHS = new Set([
  "manifests/file_inventory.json",
  "manifests/SHA256SUMS.txt",
  "manifests/batch_manifest.json",
]);

export function formatZipSize(size: number): string {
  return String(Math.trunc(size)).padStart(ZIP_SIZE_WIDTH, "0");
}

export function parseZipSize(value: unknown): number {
  return Number.parseInt(String(value).replace(/^0+/, "") || "0", 10);
}

export function sha256Bytes(data: Buffer | Uint8Array): string {
  return createHash("sha256").update(data).digest("hex");
}

function replaceFixedField(
  data: Buffer,
  key: string,
  newValue: string,
): void {
  const needle = Buffer.from(`"${key}": "`, "utf8");
  const idx = data.indexOf(needle);
  if (idx < 0) {
    throw new Error(`field not found: ${key}`);
  }
  const start = idx + needle.length;
  const end = start + newValue.length;
  if (data.subarray(end, end + 1).toString("utf8") !== '"') {
    throw new Error(`fixed-width mismatch for ${key}`);
  }
  Buffer.from(newValue, "ascii").copy(data, start);
}

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i += 1) {
    c ^= buf[i]!;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : c >>> 1;
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

function writeUInt32LE(data: Buffer, offset: number, value: number): void {
  data.writeUInt32LE(value >>> 0, offset);
}

function updateStoredMemberCrc(data: Buffer, memberName: string): void {
  const sigLocal = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
  let idx = 0;
  let target:
    | { localOffset: number; method: number; dataStart: number; dataSize: number }
    | null = null;

  while (true) {
    const i = data.indexOf(sigLocal, idx);
    if (i < 0) break;
    const fnLen = data.readUInt16LE(i + 26);
    const extraLen = data.readUInt16LE(i + 28);
    const method = data.readUInt16LE(i + 8);
    const name = data.subarray(i + 30, i + 30 + fnLen).toString("utf8");
    const dataStart = i + 30 + fnLen + extraLen;
    const csize = data.readUInt32LE(i + 18);
    if (name === memberName) {
      target = {
        localOffset: i,
        method,
        dataStart,
        dataSize: csize,
      };
      break;
    }
    idx = i + 4;
  }

  if (!target) {
    throw new Error(`ZIP member not found: ${memberName}`);
  }
  if (target.method !== 0) {
    throw new Error(`CRC update requires STORED member: ${memberName}`);
  }

  const payload = data.subarray(
    target.dataStart,
    target.dataStart + target.dataSize,
  );
  const crc = crc32(payload);
  writeUInt32LE(data, target.localOffset + 14, crc);

  const sigCd = Buffer.from([0x50, 0x4b, 0x01, 0x02]);
  idx = 0;
  while (true) {
    const i = data.indexOf(sigCd, idx);
    if (i < 0) break;
    const fnLen = data.readUInt16LE(i + 28);
    const name = data.subarray(i + 46, i + 46 + fnLen).toString("utf8");
    if (name === memberName) {
      writeUInt32LE(data, i + 16, crc);
      return;
    }
    idx = i + 4;
  }
  throw new Error(`central directory entry not found: ${memberName}`);
}

/**
 * Compute BATCH_CONTRACT_V1 sealed digest for a ZIP file.
 * Does not mutate the on-disk ZIP.
 */
export function verifySealedZip(
  zipPath: string,
  expectedDigest?: string | null,
): string {
  const data = Buffer.from(fs.readFileSync(zipPath));
  replaceFixedField(data, "zip_sha256", ZIP_SHA256_PLACEHOLDER);
  replaceFixedField(data, "zip_size", formatZipSize(0));
  updateStoredMemberCrc(data, "manifests/batch_manifest.json");
  const digest = sha256Bytes(data);
  if (expectedDigest != null && digest !== expectedDigest.toLowerCase()) {
    throw new Error("sealed ZIP digest mismatch");
  }
  return digest;
}

export type SealedZipValidation = {
  status: "PASS" | "FAIL";
  sealed_zip_sha256: string | null;
  raw_zip_sha256: string;
  sidecar_sha256: string | null;
  external_manifest_sha256: string | null;
  internal_manifest_sha256: string | null;
  zip_size: number;
  manifest_zip_size: number | null;
  reasons: string[];
};

export function validateSealedZipContract(options: {
  zipPath: string;
  sidecarPath?: string | null;
  externalManifestPath?: string | null;
  internalManifest?: { zip_sha256?: string; zip_size?: unknown } | null;
}): SealedZipValidation {
  const reasons: string[] = [];
  const raw = sha256Bytes(fs.readFileSync(options.zipPath));
  const zipSize = fs.statSync(options.zipPath).size;

  let sealed: string | null = null;
  try {
    sealed = verifySealedZip(options.zipPath);
  } catch (err) {
    reasons.push(
      `sealed_digest_compute_failed: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  let sidecar: string | null = null;
  if (options.sidecarPath && fs.existsSync(options.sidecarPath)) {
    sidecar = fs
      .readFileSync(options.sidecarPath, "utf8")
      .trim()
      .split(/\s+/)[0]!
      .toLowerCase();
  } else if (options.sidecarPath) {
    reasons.push("sidecar_missing");
  }

  let external: string | null = null;
  let externalSize: number | null = null;
  if (options.externalManifestPath && fs.existsSync(options.externalManifestPath)) {
    const ext = JSON.parse(
      fs.readFileSync(options.externalManifestPath, "utf8"),
    ) as { zip_sha256?: string; zip_size?: unknown };
    external = ext.zip_sha256?.toLowerCase() ?? null;
    externalSize =
      ext.zip_size != null ? parseZipSize(ext.zip_size) : null;
  } else if (options.externalManifestPath) {
    reasons.push("external_manifest_missing");
  }

  const internal = options.internalManifest?.zip_sha256?.toLowerCase() ?? null;
  const internalSize =
    options.internalManifest?.zip_size != null
      ? parseZipSize(options.internalManifest.zip_size)
      : null;

  if (sealed && sidecar && sealed !== sidecar) {
    reasons.push("sidecar_mismatch");
  }
  if (sealed && external && sealed !== external) {
    reasons.push("external_manifest_mismatch");
  }
  if (sealed && internal && sealed !== internal) {
    reasons.push("internal_manifest_mismatch");
  }
  if (sidecar && external && sidecar !== external) {
    reasons.push("sidecar_external_disagree");
  }
  if (sidecar && internal && sidecar !== internal) {
    reasons.push("sidecar_internal_disagree");
  }
  if (external && internal && external !== internal) {
    reasons.push("external_internal_disagree");
  }
  if (internalSize != null && internalSize !== zipSize) {
    reasons.push("internal_zip_size_mismatch");
  }
  if (externalSize != null && externalSize !== zipSize) {
    reasons.push("external_zip_size_mismatch");
  }
  if (!sealed) {
    reasons.push("sealed_digest_unavailable");
  }

  return {
    status: reasons.length === 0 && sealed != null ? "PASS" : "FAIL",
    sealed_zip_sha256: sealed,
    raw_zip_sha256: raw,
    sidecar_sha256: sidecar,
    external_manifest_sha256: external,
    internal_manifest_sha256: internal,
    zip_size: zipSize,
    manifest_zip_size: internalSize ?? externalSize,
    reasons,
  };
}
