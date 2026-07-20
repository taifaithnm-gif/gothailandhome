"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import {
  COMPARE_MAX_ITEMS,
  COMPARE_STORAGE_KEY,
  addCompareItem,
  clearCompareStorage,
  createBrowserCompareStorage,
  emptyCompareState,
  hasCompareItem,
  loadCompare,
  removeCompareItem,
  saveCompare,
  type CompareRef,
  type CompareState,
} from "@/lib/compare";

type CompareContextValue = {
  state: CompareState;
  /** False until client snapshot is read (SSR/hydration-safe). */
  hydrated: boolean;
  count: number;
  isFull: boolean;
  max: number;
  isSelected: (ref: CompareRef) => boolean;
  add: (ref: CompareRef) => void;
  remove: (ref: CompareRef) => void;
  toggle: (ref: CompareRef) => void;
  clear: () => void;
  pruneToSlugs: (slugs: string[]) => void;
};

const CompareContext = createContext<CompareContextValue | null>(null);

const storage = createBrowserCompareStorage();
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (typeof window !== "undefined") {
    const onStorage = (event: StorageEvent) => {
      if (event.key === COMPARE_STORAGE_KEY || event.key === null) {
        listener();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  }
  return () => {
    listeners.delete(listener);
  };
}

function getClientSnapshot(): CompareState {
  return loadCompare(storage);
}

function getServerSnapshot(): CompareState {
  return emptyCompareState();
}

function writeState(next: CompareState) {
  saveCompare(storage, next);
  emit();
}

export function CompareProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  const isSelected = useCallback(
    (ref: CompareRef) => hasCompareItem(state, ref),
    [state],
  );

  const add = useCallback((ref: CompareRef) => {
    writeState(addCompareItem(loadCompare(storage), ref));
  }, []);

  const remove = useCallback((ref: CompareRef) => {
    writeState(removeCompareItem(loadCompare(storage), ref));
  }, []);

  const toggle = useCallback((ref: CompareRef) => {
    const current = loadCompare(storage);
    writeState(
      hasCompareItem(current, ref)
        ? removeCompareItem(current, ref)
        : addCompareItem(current, ref),
    );
  }, []);

  const clear = useCallback(() => {
    clearCompareStorage(storage);
    emit();
  }, []);

  const pruneToSlugs = useCallback((slugs: string[]) => {
    const allowed = new Set(
      slugs.map((slug) => slug.trim().toLowerCase()).filter(Boolean),
    );
    const current = loadCompare(storage);
    const nextItems = current.items.filter(
      (item) => item.slug && allowed.has(item.slug),
    );
    if (nextItems.length === current.items.length) return;
    writeState({ ...current, items: nextItems });
  }, []);

  const count = state.items.length;
  const isFull = count >= COMPARE_MAX_ITEMS;

  const value = useMemo(
    () => ({
      state,
      hydrated,
      count,
      isFull,
      max: COMPARE_MAX_ITEMS,
      isSelected,
      add,
      remove,
      toggle,
      clear,
      pruneToSlugs,
    }),
    [
      state,
      hydrated,
      count,
      isFull,
      isSelected,
      add,
      remove,
      toggle,
      clear,
      pruneToSlugs,
    ],
  );

  return (
    <CompareContext.Provider value={value}>{children}</CompareContext.Provider>
  );
}

export function useCompare(): CompareContextValue {
  const ctx = useContext(CompareContext);
  if (!ctx) {
    throw new Error("useCompare must be used within CompareProvider");
  }
  return ctx;
}
