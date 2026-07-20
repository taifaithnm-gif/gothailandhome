/**
 * P1-20 — Contextual inquiry handoff.
 *
 * Carries PUBLIC source context (property / project / developer) from an
 * inquiry form to the shared lead result page. Only allowlisted, validated
 * identifiers travel through the URL — never private lead payload (name,
 * email, phone, message). Parsing fails closed on anything unexpected.
 */

export const LEAD_CONTEXT_KINDS = [
  "property",
  "project",
  "developer",
] as const;

export type LeadContextKind = (typeof LEAD_CONTEXT_KINDS)[number];

export type LeadContext = {
  kind: LeadContextKind;
  /** Public slug of the source (route segment). */
  ref: string;
  /** Public display label (e.g. listing/project/developer name). */
  label: string;
};

/** Public, private-payload-free field names carried in the URL. */
export const LEAD_CONTEXT_PARAM = {
  kind: "ctx_kind",
  ref: "ctx_ref",
  label: "ctx_label",
} as const;

/** Standardized hidden form field names an inquiry form emits. */
export const LEAD_CONTEXT_FIELD = {
  kind: "context_kind",
  ref: "context_ref",
  label: "context_label",
} as const;

const REF_RE = /^[a-z0-9][a-z0-9-]{0,79}$/;
const LABEL_MAX = 120;

export function isLeadContextKind(
  value: string | null | undefined,
): value is LeadContextKind {
  return Boolean(
    value && (LEAD_CONTEXT_KINDS as readonly string[]).includes(value),
  );
}

function normalizeLabel(raw: unknown): string {
  return String(raw ?? "")
    // collapse control chars / newlines that could break the result UI
    .replace(/[\u0000-\u001f\u007f]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, LABEL_MAX);
}

/**
 * Validate + normalize a context triple. Returns null (fail-closed) when the
 * kind is not allowlisted, the ref is not a safe public slug, or the label is
 * empty after sanitization.
 */
export function normalizeLeadContext(raw: {
  kind?: unknown;
  ref?: unknown;
  label?: unknown;
}): LeadContext | null {
  const kind = String(raw.kind ?? "").trim();
  if (!isLeadContextKind(kind)) return null;

  const ref = String(raw.ref ?? "").trim().toLowerCase();
  if (!REF_RE.test(ref)) return null;

  const label = normalizeLabel(raw.label);
  if (!label) return null;

  return { kind, ref, label };
}

type FormLike = { get(name: string): unknown };

/** Read the standardized hidden context fields from submitted form data. */
export function readLeadContextFromForm(
  formData: FormLike,
): LeadContext | null {
  return normalizeLeadContext({
    kind: formData.get(LEAD_CONTEXT_FIELD.kind),
    ref: formData.get(LEAD_CONTEXT_FIELD.ref),
    label: formData.get(LEAD_CONTEXT_FIELD.label),
  });
}

/** Append PUBLIC context params to a lead result URL search string. */
export function appendLeadContextParams(
  params: URLSearchParams,
  context: LeadContext | null | undefined,
): void {
  if (!context) return;
  params.set(LEAD_CONTEXT_PARAM.kind, context.kind);
  params.set(LEAD_CONTEXT_PARAM.ref, context.ref);
  params.set(LEAD_CONTEXT_PARAM.label, context.label);
}

function single(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Parse + re-validate context from result-page search params (fail-closed). */
export function parseLeadContextParams(
  query: Record<string, string | string[] | undefined>,
): LeadContext | null {
  return normalizeLeadContext({
    kind: single(query[LEAD_CONTEXT_PARAM.kind]),
    ref: single(query[LEAD_CONTEXT_PARAM.ref]),
    label: single(query[LEAD_CONTEXT_PARAM.label]),
  });
}

/** Site-relative source path (without locale) for back-navigation. */
export function leadContextSourcePath(context: LeadContext): string {
  switch (context.kind) {
    case "property":
      return `/properties/${context.ref}`;
    case "project":
      return `/projects/${context.ref}`;
    case "developer":
      return `/developers/${context.ref}`;
  }
}
