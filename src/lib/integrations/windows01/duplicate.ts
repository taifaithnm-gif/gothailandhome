import type {
  DuplicateHit,
  DuplicateMatchKey,
  Windows01RecordV0,
} from "./types.ts";

function asString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const t = value.trim();
  return t ? t.toLowerCase() : null;
}

function payloadField(record: Windows01RecordV0, key: string): string | null {
  return asString(record.payload[key]);
}

function hintField(record: Windows01RecordV0, key: string): string | null {
  if (!record.entityHints) return null;
  return asString(record.entityHints[key]);
}

export function extractDuplicateKeys(record: Windows01RecordV0): Partial<
  Record<DuplicateMatchKey, string>
> {
  const project =
    payloadField(record, "project_name") ??
    payloadField(record, "project") ??
    hintField(record, "project_name") ??
    hintField(record, "project");
  const developer =
    payloadField(record, "developer") ??
    payloadField(record, "developer_name") ??
    hintField(record, "developer") ??
    hintField(record, "developer_name");

  const keys: Partial<Record<DuplicateMatchKey, string>> = {
    record_id: record.recordId.toLowerCase(),
    content_hash: record.contentHash.toLowerCase(),
  };

  if (record.sourceUrl) keys.source_url = record.sourceUrl.toLowerCase();
  if (project) keys.project_name = project;
  // Developer alone is not a duplicate; require developer+project composite.
  if (developer && project) keys.developer = `${developer}||${project}`;
  if (record.evidence?.imageHash) {
    keys.image_hash = record.evidence.imageHash.toLowerCase();
  }
  if (record.evidence?.pdfHash) {
    keys.pdf_hash = record.evidence.pdfHash.toLowerCase();
  }
  if (record.evidence?.newsUrl) {
    keys.news_url = record.evidence.newsUrl.toLowerCase();
  }

  return keys;
}

/**
 * In-batch duplicate detector.
 * On hit: caller must Skip (quarantine), never import.
 */
export class DuplicateIndex {
  private readonly seen = new Map<string, string>();

  /**
   * Returns duplicate hits for this record against previously indexed records.
   * Empty array means no duplicate — record should be indexed after accept.
   */
  check(record: Windows01RecordV0): DuplicateHit[] {
    const keys = extractDuplicateKeys(record);
    const hits: DuplicateHit[] = [];
    for (const [key, value] of Object.entries(keys) as Array<
      [DuplicateMatchKey, string]
    >) {
      if (!value) continue;
      const mapKey = `${key}::${value}`;
      const prior = this.seen.get(mapKey);
      if (prior) {
        hits.push({
          key,
          value,
          recordId: record.recordId,
          priorRecordId: prior,
        });
      }
    }
    return hits;
  }

  index(record: Windows01RecordV0): void {
    const keys = extractDuplicateKeys(record);
    for (const [key, value] of Object.entries(keys) as Array<
      [DuplicateMatchKey, string]
    >) {
      if (!value) continue;
      const mapKey = `${key}::${value}`;
      if (!this.seen.has(mapKey)) {
        this.seen.set(mapKey, record.recordId);
      }
    }
  }
}

export function duplicateReason(
  key: DuplicateMatchKey,
):
  | "DUPLICATE_RECORD"
  | "DUPLICATE_HASH"
  | "DUPLICATE_SOURCE_URL"
  | "DUPLICATE_PROJECT"
  | "DUPLICATE_DEVELOPER_PROJECT"
  | "DUPLICATE_IMAGE_HASH"
  | "DUPLICATE_PDF_HASH"
  | "DUPLICATE_NEWS_URL" {
  switch (key) {
    case "record_id":
      return "DUPLICATE_RECORD";
    case "content_hash":
      return "DUPLICATE_HASH";
    case "source_url":
      return "DUPLICATE_SOURCE_URL";
    case "project_name":
      return "DUPLICATE_PROJECT";
    case "developer":
      return "DUPLICATE_DEVELOPER_PROJECT";
    case "image_hash":
      return "DUPLICATE_IMAGE_HASH";
    case "pdf_hash":
      return "DUPLICATE_PDF_HASH";
    case "news_url":
      return "DUPLICATE_NEWS_URL";
  }
}
