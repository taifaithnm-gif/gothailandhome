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
  ANALYTICS_CONSENT_KEY,
  isAnalyticsConsentGranted,
  readAnalyticsConsent,
  writeAnalyticsConsent,
  type AnalyticsConsent,
} from "@/lib/analytics";

type AnalyticsContextValue = {
  consent: AnalyticsConsent | null;
  hydrated: boolean;
  grant: () => void;
  deny: () => void;
  allowed: boolean;
};

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (typeof window !== "undefined") {
    const onStorage = (event: StorageEvent) => {
      if (event.key === ANALYTICS_CONSENT_KEY) emit();
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

function getSnapshot(): AnalyticsConsent | null {
  return readAnalyticsConsent();
}

function getServerSnapshot(): AnalyticsConsent | null {
  return null;
}

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const consent = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const hydrated = typeof window !== "undefined";

  const grant = useCallback(() => {
    writeAnalyticsConsent("granted");
    emit();
  }, []);

  const deny = useCallback(() => {
    writeAnalyticsConsent("denied");
    emit();
  }, []);

  const value = useMemo(
    () => ({
      consent,
      hydrated,
      grant,
      deny,
      allowed: hydrated && isAnalyticsConsentGranted(),
    }),
    [consent, hydrated, grant, deny],
  );

  return (
    <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>
  );
}

export function useAnalyticsConsent(): AnalyticsContextValue {
  const ctx = useContext(AnalyticsContext);
  if (!ctx) {
    return {
      consent: null,
      hydrated: false,
      grant: () => undefined,
      deny: () => undefined,
      allowed: false,
    };
  }
  return ctx;
}
