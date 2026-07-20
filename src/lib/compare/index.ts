/**
 * P1-17 — Accountless comparison selection contract.
 *
 * Local-device only. No account, backend, sync, or CRM.
 * Persist only stable property identifiers (id and/or slug).
 * Comparable display fields: see `./fields.ts` (G-PRODUCT-COMPARE allowlist).
 */

/** Schema version written to storage. */
export const COMPARE_SCHEMA_VERSION = 1;

/**
 * localStorage key for the current schema.
 * Older unknown keys are ignored (fail closed).
 */
export const COMPARE_STORAGE_KEY = "gth.compare.v1";

/**
 * Minimum properties required to render a side-by-side comparison
 * (P1-18: two-to-four). Fewer selections prompt for more.
 */
export const COMPARE_MIN_ITEMS = 2;

/**
 * Maximum properties in a comparison selection (P1-18: two-to-four).
 * Overflow drops oldest first.
 */
export const COMPARE_MAX_ITEMS = 4;

/**
 * Retention / privacy wording for local-device comparison (G-PRODUCT-COMPARE).
 * Safe to surface in UI later; not a legal page.
 */
export const COMPARE_RETENTION_NOTE =
  "Comparison selections are stored only on this device. They are not linked to an account, not synced across devices, and are removed if you clear site data for this browser.";

const MAX_ID_LENGTH = 80;
const MAX_SLUG_LENGTH = 120;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/i;
const ID_PATTERN = /^[a-zA-Z0-9_-]+$/;

export type CompareRef = {
  /** Stable DB / row id when known. */
  id?: string;
  /** Stable public slug used by `/properties/[id]` routes. */
  slug?: string;
};

export type CompareState = {
  version: number;
  items: CompareRef[];
};

export type CompareStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

export function emptyCompareState(): CompareState {
  return { version: COMPARE_SCHEMA_VERSION, items: [] };
}

function normalizeId(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined;
  const value = raw.trim();
  if (!value || value.length > MAX_ID_LENGTH) return undefined;
  if (!ID_PATTERN.test(value)) return undefined;
  return value;
}

function normalizeSlug(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined;
  const value = raw.trim().toLowerCase();
  if (!value || value.length > MAX_SLUG_LENGTH) return undefined;
  if (!SLUG_PATTERN.test(value)) return undefined;
  return value;
}

/**
 * Normalize a candidate compare ref.
 * Requires at least one stable identifier; drops all other fields.
 */
export function normalizeCompareRef(raw: unknown): CompareRef | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const obj = raw as Record<string, unknown>;
  const id = normalizeId(obj.id);
  const slug = normalizeSlug(obj.slug);
  if (!id && !slug) return null;
  const out: CompareRef = {};
  if (id) out.id = id;
  if (slug) out.slug = slug;
  return out;
}

function refsEqual(a: CompareRef, b: CompareRef): boolean {
  if (a.id && b.id && a.id === b.id) return true;
  if (a.slug && b.slug && a.slug === b.slug) return true;
  return false;
}

function findIndex(items: CompareRef[], ref: CompareRef): number {
  return items.findIndex((item) => refsEqual(item, ref));
}

/**
 * Parse stored JSON. Corrupt, empty, or unsupported versions fail closed
 * to an empty v1 state (never throw).
 */
export function parseCompareState(
  raw: string | null | undefined,
): CompareState {
  if (raw == null || raw === "") return emptyCompareState();

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return emptyCompareState();
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return emptyCompareState();
  }

  const obj = parsed as Record<string, unknown>;
  const version =
    typeof obj.version === "number" && Number.isInteger(obj.version)
      ? obj.version
      : null;

  // Unknown / future versions fail closed rather than guessing.
  if (version == null || version < 1 || version > COMPARE_SCHEMA_VERSION) {
    return emptyCompareState();
  }

  const rawItems = Array.isArray(obj.items) ? obj.items : [];
  const items: CompareRef[] = [];
  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();

  for (const entry of rawItems) {
    const ref = normalizeCompareRef(entry);
    if (!ref) continue;
    if (ref.id && seenIds.has(ref.id)) continue;
    if (ref.slug && seenSlugs.has(ref.slug)) continue;
    if (ref.id) seenIds.add(ref.id);
    if (ref.slug) seenSlugs.add(ref.slug);
    items.push(ref);
    if (items.length >= COMPARE_MAX_ITEMS) break;
  }

  return { version: COMPARE_SCHEMA_VERSION, items };
}

/** Serialize for storage. Strips anything outside the contract. */
export function serializeCompareState(state: CompareState): string {
  const normalized = parseCompareState(
    JSON.stringify({
      version: COMPARE_SCHEMA_VERSION,
      items: state.items,
    }),
  );
  return JSON.stringify({
    version: normalized.version,
    items: normalized.items.map((item) => {
      const out: CompareRef = {};
      if (item.id) out.id = item.id;
      if (item.slug) out.slug = item.slug;
      return out;
    }),
  });
}

export function hasCompareItem(state: CompareState, ref: CompareRef): boolean {
  const normalized = normalizeCompareRef(ref);
  if (!normalized) return false;
  return findIndex(state.items, normalized) >= 0;
}

/**
 * Add a compare selection. Deterministic:
 * - invalid ref → unchanged
 * - duplicate → move to end (most recent)
 * - over max → drop oldest until within bound
 */
export function addCompareItem(
  state: CompareState,
  ref: CompareRef,
): CompareState {
  const normalized = normalizeCompareRef(ref);
  if (!normalized) {
    return {
      version: COMPARE_SCHEMA_VERSION,
      items: [...state.items],
    };
  }

  const items = state.items.filter((item) => !refsEqual(item, normalized));
  items.push(normalized);
  while (items.length > COMPARE_MAX_ITEMS) {
    items.shift();
  }

  return { version: COMPARE_SCHEMA_VERSION, items };
}

export function removeCompareItem(
  state: CompareState,
  ref: CompareRef,
): CompareState {
  const normalized = normalizeCompareRef(ref);
  if (!normalized) {
    return {
      version: COMPARE_SCHEMA_VERSION,
      items: [...state.items],
    };
  }

  return {
    version: COMPARE_SCHEMA_VERSION,
    items: state.items.filter((item) => !refsEqual(item, normalized)),
  };
}

export function clearCompare(): CompareState {
  return emptyCompareState();
}

export function listCompareSlugs(state: CompareState): string[] {
  return state.items
    .map((item) => item.slug)
    .filter((slug): slug is string => Boolean(slug));
}

export function listCompareIds(state: CompareState): string[] {
  return state.items
    .map((item) => item.id)
    .filter((id): id is string => Boolean(id));
}

/** In-memory adapter for tests and SSR-safe defaults. */
export function createMemoryCompareStorage(
  initial?: Record<string, string>,
): CompareStorage {
  const map = new Map<string, string>(Object.entries(initial ?? {}));
  return {
    getItem(key) {
      return map.has(key) ? map.get(key)! : null;
    },
    setItem(key, value) {
      map.set(key, String(value));
    },
    removeItem(key) {
      map.delete(key);
    },
  };
}

/**
 * Browser localStorage adapter. Missing/blocked storage fails closed
 * (get → null; set/remove no-op) without throwing.
 */
export function createBrowserCompareStorage(
  storage?: Pick<Storage, "getItem" | "setItem" | "removeItem"> | null,
): CompareStorage {
  const store =
    storage ??
    (typeof globalThis !== "undefined" &&
    "localStorage" in globalThis &&
    globalThis.localStorage
      ? globalThis.localStorage
      : null);

  return {
    getItem(key) {
      if (!store) return null;
      try {
        return store.getItem(key);
      } catch {
        return null;
      }
    },
    setItem(key, value) {
      if (!store) return;
      try {
        store.setItem(key, value);
      } catch {
        // Quota / privacy mode — fail closed.
      }
    },
    removeItem(key) {
      if (!store) return;
      try {
        store.removeItem(key);
      } catch {
        // ignore
      }
    },
  };
}

export function loadCompare(
  storage: CompareStorage,
  key: string = COMPARE_STORAGE_KEY,
): CompareState {
  return parseCompareState(storage.getItem(key));
}

export function saveCompare(
  storage: CompareStorage,
  state: CompareState,
  key: string = COMPARE_STORAGE_KEY,
): CompareState {
  const normalized = parseCompareState(serializeCompareState(state));
  storage.setItem(key, serializeCompareState(normalized));
  return normalized;
}

export function clearCompareStorage(
  storage: CompareStorage,
  key: string = COMPARE_STORAGE_KEY,
): CompareState {
  storage.removeItem(key);
  return emptyCompareState();
}
