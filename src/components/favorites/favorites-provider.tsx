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
  FAVORITES_STORAGE_KEY,
  addFavorite,
  clearFavoritesStorage,
  createBrowserFavoritesStorage,
  emptyFavoritesState,
  hasFavorite,
  loadFavorites,
  removeFavorite,
  saveFavorites,
  type FavoriteRef,
  type FavoritesState,
} from "@/lib/favorites";

type FavoritesContextValue = {
  state: FavoritesState;
  /** False until client snapshot is read (SSR/hydration-safe). */
  hydrated: boolean;
  isSaved: (ref: FavoriteRef) => boolean;
  add: (ref: FavoriteRef) => void;
  remove: (ref: FavoriteRef) => void;
  toggle: (ref: FavoriteRef) => void;
  clear: () => void;
  pruneToSlugs: (slugs: string[]) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

const storage = createBrowserFavoritesStorage();
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (typeof window !== "undefined") {
    const onStorage = (event: StorageEvent) => {
      if (event.key === FAVORITES_STORAGE_KEY || event.key === null) {
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

function getClientSnapshot(): FavoritesState {
  return loadFavorites(storage);
}

function getServerSnapshot(): FavoritesState {
  return emptyFavoritesState();
}

function writeState(next: FavoritesState) {
  saveFavorites(storage, next);
  emit();
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  // Detect hydration: server snapshot is always empty; after mount, client
  // snapshot may still be empty but we mark hydrated via a client-only flag
  // by comparing subscribe identity — use a second store for hydration bit.
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  const isSaved = useCallback(
    (ref: FavoriteRef) => hasFavorite(state, ref),
    [state],
  );

  const add = useCallback((ref: FavoriteRef) => {
    writeState(addFavorite(loadFavorites(storage), ref));
  }, []);

  const remove = useCallback((ref: FavoriteRef) => {
    writeState(removeFavorite(loadFavorites(storage), ref));
  }, []);

  const toggle = useCallback((ref: FavoriteRef) => {
    const current = loadFavorites(storage);
    writeState(
      hasFavorite(current, ref)
        ? removeFavorite(current, ref)
        : addFavorite(current, ref),
    );
  }, []);

  const clear = useCallback(() => {
    clearFavoritesStorage(storage);
    emit();
  }, []);

  const pruneToSlugs = useCallback((slugs: string[]) => {
    const allowed = new Set(
      slugs.map((slug) => slug.trim().toLowerCase()).filter(Boolean),
    );
    const current = loadFavorites(storage);
    const nextItems = current.items.filter(
      (item) => item.slug && allowed.has(item.slug),
    );
    if (nextItems.length === current.items.length) return;
    writeState({ ...current, items: nextItems });
  }, []);

  const value = useMemo(
    () => ({
      state,
      hydrated,
      isSaved,
      add,
      remove,
      toggle,
      clear,
      pruneToSlugs,
    }),
    [state, hydrated, isSaved, add, remove, toggle, clear, pruneToSlugs],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error("useFavorites must be used within FavoritesProvider");
  }
  return ctx;
}
