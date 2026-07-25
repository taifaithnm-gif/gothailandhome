/**
 * Unified Duplicate Engine — Developer / Project / News / PDF / Image / URL / Hash / Slug / Alias.
 * Output action: WOULD_SKIP_DUPLICATE. Never auto-merges.
 */

import { expandDeveloperAliases } from "./developer-validator.ts";
import type {
  DeveloperCandidate,
  DuplicateHit,
  EntityType,
  ImageCandidate,
  ImportBatch,
  NewsCandidate,
  PdfCandidate,
  ProjectCandidate,
} from "./types.ts";

function norm(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function similarity(a: string, b: string): number {
  if (a === b) return 1;
  if (!a || !b) return 0;
  const shorter = a.length < b.length ? a : b;
  const longer = a.length < b.length ? b : a;
  if (longer.includes(shorter) && shorter.length >= 4) {
    return shorter.length / longer.length;
  }
  const ta = new Set(a.split(" "));
  const tb = new Set(b.split(" "));
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter += 1;
  const union = ta.size + tb.size - inter;
  return union === 0 ? 0 : inter / union;
}

export class DuplicateEngine {
  private readonly index = new Map<string, { entityType: EntityType; entityId: string }>();
  private readonly hits: DuplicateHit[] = [];

  private key(kind: string, value: string): string {
    return `${kind}::${value}`;
  }

  private check(
    kind: DuplicateHit["kind"],
    entityType: EntityType,
    entityId: string,
    value: string,
    score?: number,
  ): void {
    if (!value) return;
    const mapKey = this.key(kind, value);
    const prior = this.index.get(mapKey);
    if (prior && prior.entityId !== entityId) {
      this.hits.push({
        kind,
        entityType,
        entityId,
        matchedId: prior.entityId,
        value,
        score,
        action: "WOULD_SKIP_DUPLICATE",
      });
    } else if (!prior) {
      this.index.set(mapKey, { entityType, entityId });
    }
  }

  seedExisting(options: {
    developerSlugs?: string[];
    projectSlugs?: string[];
    imageHashes?: string[];
    pdfHashes?: string[];
    newsUrls?: string[];
  }): void {
    for (const s of options.developerSlugs ?? []) {
      this.index.set(this.key("slug", `developer:${norm(s)}`), {
        entityType: "developer",
        entityId: `existing:${s}`,
      });
    }
    for (const s of options.projectSlugs ?? []) {
      this.index.set(this.key("slug", `project:${norm(s)}`), {
        entityType: "project",
        entityId: `existing:${s}`,
      });
    }
    for (const h of options.imageHashes ?? []) {
      this.index.set(this.key("hash", `image:${h.toLowerCase()}`), {
        entityType: "image",
        entityId: `existing:${h.slice(0, 12)}`,
      });
    }
    for (const h of options.pdfHashes ?? []) {
      this.index.set(this.key("hash", `pdf:${h.toLowerCase()}`), {
        entityType: "pdf",
        entityId: `existing:${h.slice(0, 12)}`,
      });
    }
    for (const u of options.newsUrls ?? []) {
      this.index.set(this.key("url", `news:${norm(u)}`), {
        entityType: "news",
        entityId: `existing:${u}`,
      });
    }
  }

  checkDeveloper(d: DeveloperCandidate): DuplicateHit[] {
    const before = this.hits.length;
    this.check("id", "developer", d.id, `developer:${d.id}`);
    for (const alias of expandDeveloperAliases(d)) {
      this.check("alias", "developer", d.id, `developer-alias:${alias}`);
      this.check("name", "developer", d.id, `developer-name:${alias}`);
    }
    if (d.slug) {
      this.check("slug", "developer", d.id, `developer:${norm(d.slug)}`);
    }
    if (d.officialWebsite) {
      this.check("url", "developer", d.id, `developer-url:${norm(d.officialWebsite)}`);
    }
    return this.hits.slice(before);
  }

  checkProject(p: ProjectCandidate): DuplicateHit[] {
    const before = this.hits.length;
    this.check("id", "project", p.id, `project:${p.id}`);
    if (p.slug) {
      this.check("slug", "project", p.id, `project:${norm(p.slug)}`);
    }
    if (p.name) {
      const n = norm(p.name);
      this.check("name", "project", p.id, `project-name:${n}`);
      if (p.developerId) {
        this.check(
          "name",
          "project",
          p.id,
          `project-dev:${norm(p.developerId)}||${n}`,
        );
      }
    }
    return this.hits.slice(before);
  }

  checkImage(img: ImageCandidate): DuplicateHit[] {
    const before = this.hits.length;
    this.check("id", "image", img.id, `image:${img.id}`);
    if (img.hash) {
      this.check("hash", "image", img.id, `image:${img.hash.toLowerCase()}`);
    }
    return this.hits.slice(before);
  }

  checkPdf(pdf: PdfCandidate): DuplicateHit[] {
    const before = this.hits.length;
    this.check("id", "pdf", pdf.id, `pdf:${pdf.id}`);
    if (pdf.hash) {
      this.check("hash", "pdf", pdf.id, `pdf:${pdf.hash.toLowerCase()}`);
    }
    return this.hits.slice(before);
  }

  checkNews(n: NewsCandidate): DuplicateHit[] {
    const before = this.hits.length;
    this.check("id", "news", n.id, `news:${n.id}`);
    if (n.sourceUrl) {
      this.check("url", "news", n.id, `news:${norm(n.sourceUrl)}`);
    }
    return this.hits.slice(before);
  }

  /** Cross-name similarity pass (projects/developers). Never merges. */
  findSimilarNames(
    batch: ImportBatch,
    threshold = 0.85,
  ): DuplicateHit[] {
    const out: DuplicateHit[] = [];
    const names = batch.projects.map((p) => ({
      id: p.id,
      name: norm(p.name),
      type: "project" as const,
    }));
    for (let i = 0; i < names.length; i += 1) {
      for (let j = i + 1; j < names.length; j += 1) {
        const a = names[i]!;
        const b = names[j]!;
        const score = similarity(a.name, b.name);
        if (score >= threshold && a.name !== b.name) {
          out.push({
            kind: "similarity",
            entityType: "project",
            entityId: b.id,
            matchedId: a.id,
            value: `${a.name}~${b.name}`,
            score,
            action: "WOULD_SKIP_DUPLICATE",
          });
        }
      }
    }
    return out;
  }

  scanBatch(batch: ImportBatch): DuplicateHit[] {
    this.hits.length = 0;
    for (const d of batch.developers) this.checkDeveloper(d);
    for (const p of batch.projects) this.checkProject(p);
    for (const i of batch.images) this.checkImage(i);
    for (const p of batch.pdfs) this.checkPdf(p);
    for (const n of batch.news) this.checkNews(n);
    this.hits.push(...this.findSimilarNames(batch));
    return [...this.hits];
  }

  allHits(): readonly DuplicateHit[] {
    return this.hits;
  }
}

export function runDuplicateCheck(batch: ImportBatch): DuplicateHit[] {
  return new DuplicateEngine().scanBatch(batch);
}
